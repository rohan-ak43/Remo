import * as dotenv from 'dotenv';
dotenv.config();

import { Injectable, Logger } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface PoseData {
  reps: number;
  formAccuracy: number;
  elbowAngle?: number;
  shoulderAngle?: number;
  hipAngle?: number;
}

export interface SessionData {
  totalReps: number;
  avgAccuracy: number;
  maxAccuracy: number;
  minAccuracy: number;
  fsrReadings: number[];
  avgFsrReading: number;
  poorFormReps: number[];
  duration: number;
  patientName?: string;
}

export interface FormAnalysis {
  feedback: string;
  riskLevel: 'low' | 'medium' | 'high';
  tip: string;
  corrections: string[];
}

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name);
  private genAI: GoogleGenerativeAI;
  private textModel;
  private jsonModel;
  private visionModel;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log('🔑 GEMINI_API_KEY (from .env):', apiKey ? 'Loaded ✅' : '❌ Missing');
    if (!apiKey) {
      this.logger.error('❌ GEMINI_API_KEY not found in environment variables');
      throw new Error('GEMINI_API_KEY is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);

    // ✅ Text Model for reports, chat, quick feedback
    this.textModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite', // use supported model
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      },
    });

    // ✅ JSON model for anomaly detection
    this.jsonModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        temperature: 0.2,
        responseMimeType: 'application/json',
        maxOutputTokens: 1024,
      },
    });

    // ✅ Vision model for form/face analysis
    this.visionModel = this.genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-lite',
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 512,
      },
    });
  }

  /** 🧍‍♂️ Analyze form with image (Vision + Data) */
  async analyzeFormWithImage(imageBase64: string, poseData: PoseData): Promise<FormAnalysis> {
    try {
      const prompt = `
You are a physiotherapist AI analyzing a bicep curl.
Use both the image and exercise data to evaluate.

Exercise Data:
- Reps: ${poseData.reps}
- Accuracy: ${poseData.formAccuracy}%
- Elbow: ${poseData.elbowAngle ?? 'N/A'}°
- Shoulder: ${poseData.shoulderAngle ?? 'N/A'}°
- Hip: ${poseData.hipAngle ?? 'N/A'}°

Return JSON:
{
  "feedback": "short personalized feedback",
  "riskLevel": "low" | "medium" | "high",
  "tip": "safety or improvement tip",
  "corrections": ["list", "of", "corrections"]
}`;

      const result = await this.visionModel.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ''),
          },
        },
      ]);

      const rawText = result.response.text();
      const analysis = JSON.parse(rawText);

      return {
        feedback: analysis.feedback ?? 'Form analysis complete.',
        riskLevel: analysis.riskLevel ?? 'low',
        tip: analysis.tip ?? 'Maintain steady movement and alignment.',
        corrections: analysis.corrections ?? [],
      };
    } catch (error) {
      this.logger.error(`Error analyzing form: ${error.message}`);
      return {
        feedback: 'Error analyzing image. Please try again.',
        riskLevel: 'low',
        tip: 'Ensure your full body is visible to the camera.',
        corrections: [],
      };
    }
  }

  /** ⚡ Quick feedback without image */
  async analyzeFormQuick(poseData: PoseData): Promise<string> {
    try {
      const prompt = `
As a physiotherapist, give short encouraging feedback on this exercise.
Data:
Reps: ${poseData.reps}
Form Accuracy: ${poseData.formAccuracy}%
Elbow Angle: ${poseData.elbowAngle ?? 'N/A'}°
Use under 20 words.`;

      const result = await this.textModel.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      this.logger.error(`Error in quick form analysis: ${error.message}`);
      return 'Good effort! Maintain consistent form throughout the exercise.';
    }
  }

  /** 🧾 Generate full AI session report */
  async generateSessionReport(sessionData: SessionData): Promise<string> {
    try {
      const fsrAnalysis = this.analyzeFsrPattern(sessionData.fsrReadings);
      const prompt = `
Generate a detailed rehabilitation session report for ${
        sessionData.patientName || 'the patient'
      }.

Data:
Total Reps: ${sessionData.totalReps}
Average Accuracy: ${sessionData.avgAccuracy.toFixed(1)}%
Max: ${sessionData.maxAccuracy}%
Min: ${sessionData.minAccuracy}%
Avg FSR: ${sessionData.avgFsrReading.toFixed(0)}
Poor Form Reps: ${
        sessionData.poorFormReps.length ? sessionData.poorFormReps.join(', ') : 'None'
      }
Duration: ${(sessionData.duration / 60).toFixed(1)} mins
Muscle Activation: ${fsrAnalysis}

Structure in markdown:
## Performance Summary
## Muscle Activation Analysis
## Areas for Improvement
## Recommendations
## Motivation`;

      const result = await this.textModel.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      this.logger.error(`Error generating report: ${error.message}`);
      return '## Report Generation Failed\nCould not generate report due to API issue.';
    }
  }

  /** 💬 Patient chat */
  async chatWithPatient(message: string, sessionContext: any): Promise<string> {
    try {
      const prompt = `
You are a kind, supportive physiotherapy AI assistant.
Session:
- Reps: ${sessionContext.reps}
- Accuracy: ${sessionContext.formAccuracy}%
- Active: ${sessionContext.active ? 'Yes' : 'No'}

Patient says: "${message}"
Respond warmly in 2-3 sentences, with helpful advice (no medical diagnosis).`;

      const result = await this.textModel.generateContent(prompt);
      return result.response.text().trim();
    } catch (error) {
      this.logger.error(`Error in chatWithPatient: ${error.message}`);
      return "I'm facing technical issues now. Please try again shortly.";
    }
  }

  /** ⚠️ Detect anomalies in reps and FSR */
  async detectAnomalies(recentReps: Array<{ rep: number; accuracy: number; fsrValue: number }>) {
    try {
      const avgAccuracy = recentReps.reduce((s, r) => s + r.accuracy, 0) / recentReps.length;
      const avgFsr = recentReps.reduce((s, r) => s + r.fsrValue, 0) / recentReps.length;
      const dataList = recentReps
        .map((r) => `Rep ${r.rep}: Accuracy ${r.accuracy}%, FSR ${r.fsrValue}`)
        .join('\n');

      const prompt = `
Analyze the following exercise data for abnormalities.
${dataList}

Averages:
Accuracy: ${avgAccuracy.toFixed(1)}%
FSR: ${avgFsr.toFixed(1)}

Return JSON:
{
  "isAnomalous": boolean,
  "alert": "short alert",
  "severity": "info" | "warning" | "critical"
}`;

      const result = await this.jsonModel.generateContent(prompt);
      const parsed = JSON.parse(result.response.text());
      return parsed;
    } catch (error) {
      this.logger.error(`Error detecting anomalies: ${error.message}`);
      return { isAnomalous: false, alert: 'Normal pattern', severity: 'info' };
    }
  }

  /** 🏋️ Recommend next exercises */
  async recommendExercises(patientProfile: any, progressData: any): Promise<string> {
    try {
      const prompt = `
Recommend 3 next-step exercises for a patient in rehab.
Profile:
Weeks in therapy: ${patientProfile.weeksInTherapy}
Goal: ${patientProfile.goal}
Progress:
Accuracy: ${progressData.avgAccuracy}%
Pain: ${progressData.painLevel}
Strength: ${progressData.strengthLevel}
Sessions: ${progressData.sessions}

Output format:
## [Exercise Name]
**Difficulty:** [Beginner/Intermediate/Advanced]
**Why Now:** [short reason]
**Description:** [one sentence description]`;

      const result = await this.textModel.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      this.logger.error(`Error recommending exercises: ${error.message}`);
      return '## Recommendation Failed\nPlease retry later.';
    }
  }

  /** 😣 Discomfort Assessment (Face + Text) */
  async assessDiscomfort(faceImageBase64: string, painDescription: string, exerciseData: any) {
    try {
      const prompt = `
Analyze patient discomfort using the face image and data.

Pain description: "${painDescription}"
Reps: ${exerciseData.reps}
Form Accuracy: ${exerciseData.formAccuracy}%

Return JSON:
{
  "severity": number (1-10),
  "shouldPause": boolean,
  "recommendation": string
}`;

      const result = await this.visionModel.generateContent([
        { text: prompt },
        {
          inlineData: {
            mimeType: 'image/jpeg',
            data: faceImageBase64.replace(/^data:image\/\w+;base64,/, ''),
          },
        },
      ]);

      const parsed = JSON.parse(result.response.text());
      return parsed;
    } catch (error) {
      this.logger.error(`Error assessing discomfort: ${error.message}`);
      return {
        severity: 5,
        shouldPause: true,
        recommendation: 'Please pause and consult your therapist.',
      };
    }
  }

  /** 🔍 Utility: Analyze FSR patterns */
  private analyzeFsrPattern(readings: number[]): string {
    if (!readings.length) return 'No data';
    const avg = readings.reduce((a, b) => a + b, 0) / readings.length;
    const variance = readings.reduce((sum, v) => sum + Math.pow(v - avg, 2), 0) / readings.length;
    const std = Math.sqrt(variance);
    if (std < avg * 0.2) return 'Consistent activation';
    if (std < avg * 0.4) return 'Moderate variation';
    return 'High variation detected';
  }
}
