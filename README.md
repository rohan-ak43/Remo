# RMP System -- Remote Medical Practice System

A real-time remote rehabilitation and physiotherapy monitoring system
powered by Google Gemini API, Computer Vision, and IoT muscle activation
sensing, enabling doctors to remotely assess and guide patients with
AI-driven exercise insights.

## 🎯 Hackathon Theme Alignment: Efficient Use of Gemini API

This project uses the Gemini API to automatically analyze exercise
performance and generate structured physiotherapy session reports based
on webcam posture data and muscle activation readings.

Gemini is used to: - Evaluate patient posture accuracy - Provide
real-time corrective feedback text - Generate structured physiotherapy
session summaries - Analyze IoT muscle activation patterns to classify
effort level and consistency

The system ensures efficient Gemini usage through: - Low-frequency AI
calls (only key checkpoints & end-session analysis) - Structured prompt
design for consistent medical output - Local calculations for rep
counting & pose tracking (reducing AI load)

## 📌 System Overview

-   Patient performs exercises in front of webcam
-   ESP32 streams muscle activation using FSR sensor
-   Backend receives CV + IoT data and communicates in real time
-   Gemini generates rehab insights
-   Doctor monitors real-time dashboard

## 🧠 Key Features

-   Gemini-powered physiotherapy session report
-   Real-time rep count & form accuracy via MediaPipe Pose
-   Muscle activation tracking using ESP32 + FSR
-   WebSocket live streaming
-   Secure 1 Doctor ↔ 1 Patient session

## 🏗️ Tech Stack

  Category        Technology
  --------------- -------------------------
  Backend         NestJS, Socket.IO
  AI              Google Gemini API
  CV              MediaPipe Pose
  IoT             ESP32 + FSR Sensor
  Frontend        HTML, CSS, JS, Chart.js
  Communication   REST + WebSocket

## 📂 Project Structure

    rmp-system/
    ├── backend/
    │   ├── src/
    │   │   ├── main.ts
    │   │   ├── app.module.ts
    │   │   ├── ws.gateway.ts
    │   │   ├── iot.controller.ts
    │   │   ├── cv.controller.ts
    │   │   └── gemini.service.ts
    │   ├── public/
    │   │   ├── patient.html
    │   │   └── doctor.html
    ├── esp32/
    │   └── fsr_sensor.ino
    └── README.md

## ⚙️ Setup

### Backend

    cd backend
    npm install
    cp .env.example .env

Add in `.env`:

    SENSOR_API_KEY=changeme123
    PORT=3000
    GOOGLE_API_KEY=your_gemini_api_key

Run:

    npm run start:dev

### ESP32

-   Add Wi-Fi credentials in `fsr_sensor.ino`
-   Connect FSR to GPIO34
-   Upload and monitor on 115200 baud

## 📡 API Endpoints

  Route               Function
  ------------------- ------------------------------
  POST /iot/reading   Submit FSR muscle data
  POST /cv/update     Submit rep + pose accuracy
  POST /ai/report     Generate Gemini rehab report

## 🧠 Gemini Output Example

    {
     "exercise":"Bicep Curl",
     "totalReps": 24,
     "averageFormScore": 82,
     "muscleActivationSummary": "Consistent effort",
     "corrections": ["Improve wrist alignment"],
     "clinicalNotes": "Good progress"
    }

## ✅ Why This Project Stands Out

-   AI + CV + IoT integration
-   Real use-case in tele-physiotherapy
-   Efficient Gemini usage
-   Clinical-quality rehab reporting

## 📄 License

MIT License

## 🙌 Contribution

PRs welcome.
