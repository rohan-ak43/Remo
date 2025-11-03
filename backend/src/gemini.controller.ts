import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { GeminiService } from './gemini.service';

@Controller('gemini')
export class GeminiController {
  constructor(private readonly geminiService: GeminiService) {}

  @Post('analyze-form')
  @HttpCode(HttpStatus.OK)
  async analyzeForm(@Body() body: {
    imageBase64: string;
    poseData: {
      reps: number;
      formAccuracy: number;
      elbowAngle?: number;
      shoulderAngle?: number;
      hipAngle?: number;
    };
  }) {
    const analysis = await this.geminiService.analyzeFormWithImage(
      body.imageBase64,
      body.poseData
    );
        
    return {
      success: true,
      analysis,
      timestamp: Date.now()
    };
  }

  @Post('analyze-form-quick')
  @HttpCode(HttpStatus.OK)
  async analyzeFormQuick(@Body() body: {
    poseData: {
      reps: number;
      formAccuracy: number;
      elbowAngle?: number;
    };
  }) {
    const feedback = await this.geminiService.analyzeFormQuick(body.poseData);
        
    return {
      success: true,
      feedback,
      timestamp: Date.now()
    };
  }

  @Post('generate-report')
  @HttpCode(HttpStatus.OK)
  async generateReport(@Body() body: {
    sessionData: {
      totalReps: number;
      avgAccuracy: number;
      maxAccuracy: number;
      minAccuracy: number;
      fsrReadings: number[];
      avgFsrReading: number;
      poorFormReps: number[];
      duration: number;
      patientName?: string;
    };
  }) {
    const report = await this.geminiService.generateSessionReport(body.sessionData);
        
    return {
      success: true,
      report,
      timestamp: Date.now()
    };
  }

  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() body: {
    message: string;
    sessionContext: {
      reps: number;
      formAccuracy: number;
      active: boolean;
    };
  }) {
    const response = await this.geminiService.chatWithPatient(
      body.message,
      body.sessionContext
    );
        
    return {
      success: true,
      response,
      timestamp: Date.now()
    };
  }

  @Post('detect-anomalies')
  @HttpCode(HttpStatus.OK)
  async detectAnomalies(@Body() body: {
    recentReps: Array<{
      rep: number;
      accuracy: number;
      fsrValue: number;
    }>;
  }) {
    const anomalyResult = await this.geminiService.detectAnomalies(body.recentReps);
        
    return {
      success: true,
      ...anomalyResult,
      timestamp: Date.now()
    };
  }

  @Post('recommend-exercises')
  @HttpCode(HttpStatus.OK)
  async recommendExercises(@Body() body: {
    patientProfile: {
      weeksInTherapy: number;
      goal: string;
    };
    progressData: {
      avgAccuracy: number;
      sessions: number;
      strengthLevel: string;
      consistency: string;
      painLevel: string;
    };
  }) {
    const recommendations = await this.geminiService.recommendExercises(
      body.patientProfile,
      body.progressData
    );
        
    return {
      success: true,
      recommendations,
      timestamp: Date.now()
    };
  }

  @Post('assess-discomfort')
  @HttpCode(HttpStatus.OK)
  async assessDiscomfort(@Body() body: {
    faceImageBase64: string;
    painDescription: string;
    exerciseData: {
      reps: number;
      formAccuracy: number;
    };
  }) {
    const assessment = await this.geminiService.assessDiscomfort(
      body.faceImageBase64,
      body.painDescription,
      body.exerciseData
    );
        
    return {
      success: true,
      assessment,
      timestamp: Date.now()
    };
  }
}