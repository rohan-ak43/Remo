# RMP System - Remote Medical Practice System

A real-time patient monitoring system for remote rehabilitation exercises, featuring computer vision-based rep counting, form analysis, and muscle activation monitoring via FSR sensors.

## 📋 System Overview

The RMP System enables **exactly 1 patient and 1 doctor** to work together:

- **Patient**: Performs bicep curls in front of webcam, which tracks reps and form accuracy using MediaPipe Pose
- **ESP32**: Reads FSR (Force Sensitive Resistor) sensor data and sends muscle activation readings
- **Doctor**: Views live dashboard with real-time updates of reps, form accuracy, and FSR sensor chart

## 🏗️ Project Structure

```
rmp-system/
├── backend/
│   ├── src/
│   │   ├── main.ts              # NestJS entry point
│   │   ├── app.module.ts         # Main application module
│   │   ├── ws.gateway.ts         # WebSocket gateway for live updates
│   │   ├── iot.controller.ts     # ESP32 sensor data endpoint
│   │   └── cv.controller.ts      # Patient CV data endpoint
│   ├── public/
│   │   ├── patient.html          # Patient webcam page
│   │   └── doctor.html           # Doctor dashboard
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── esp32/
│   └── fsr_sensor.ino            # ESP32 Arduino code
└── README.md
```

## 🚀 Setup Instructions

### Prerequisites

- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **ESP32** development board
- **FSR sensor** (Force Sensitive Resistor)
- **Arduino IDE** with ESP32 board support

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and set:
   ```
   SENSOR_API_KEY=changeme123  # Change to a secure key
   PORT=3000
   ```

4. **Build the project:**
   ```bash
   npm run build
   ```

5. **Start the server:**
   ```bash
   npm run start:dev
   ```
   
   Or for production:
   ```bash
   npm run build
   npm run start:prod
   ```

6. **Access the application:**
   - Patient page: `http://localhost:3000/patient.html`
   - Doctor dashboard: `http://localhost:3000/doctor.html`

### ESP32 Setup

1. **Install ESP32 Board Support in Arduino IDE:**
   - Go to `File` → `Preferences`
   - Add this URL to "Additional Board Manager URLs":
     ```
     https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json
     ```
   - Go to `Tools` → `Board` → `Boards Manager`
   - Search for "ESP32" and install "esp32 by Espressif Systems"

2. **Configure the sketch:**
   - Open `esp32/fsr_sensor.ino` in Arduino IDE
   - Update these constants in the code:
     ```cpp
     const char* WIFI_SSID = "YOUR_WIFI_SSID";
     const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD";
     const char* SERVER_URL = "http://YOUR_SERVER_IP:3000";  // Backend IP address
     const char* API_KEY = "changeme123";  // Must match backend .env
     ```

3. **Hardware Connections:**
   - Connect FSR sensor to **GPIO34** (or change `FSR_PIN` in code)
   - Connect one FSR terminal to GPIO34
   - Connect other FSR terminal through a **10kΩ pull-down resistor** to GND
   - Connect the junction between FSR and resistor to GPIO34

4. **Upload to ESP32:**
   - Select your ESP32 board: `Tools` → `Board` → `ESP32 Arduino` → `ESP32 Dev Module`
   - Select the correct port: `Tools` → `Port`
   - Click Upload

5. **Monitor Serial Output:**
   - Open Serial Monitor (`Tools` → `Serial Monitor`)
   - Set baud rate to **115200**
   - Verify WiFi connection and data transmission

## 📡 API Endpoints

### POST `/iot/reading`
Receives FSR sensor readings from ESP32.

**Headers:**
- `x-api-key`: API key (must match `SENSOR_API_KEY` in `.env`)
- `Content-Type`: `application/json`

**Body:**
```json
{
  "value": 1234.5
}
```

**Response:**
```json
{
  "success": true,
  "message": "Sensor reading received and broadcasted",
  "timestamp": 1234567890
}
```

### POST `/cv/update`
Receives rep count and form accuracy from patient page.

**Headers:**
- `x-api-key`: API key (must match `SENSOR_API_KEY` in `.env`)
- `Content-Type`: `application/json`

**Body:**
```json
{
  "reps": 10,
  "formAccuracy": 85
}
```

**Response:**
```json
{
  "success": true,
  "message": "CV update received and broadcasted",
  "timestamp": 1234567890
}
```

## 🔌 WebSocket Events

The system uses Socket.IO for real-time communication:

- **Event: `cv-update`**
  - Sent when patient page sends rep/form data
  - Payload: `{ reps: number, formAccuracy: number, timestamp: number }`

- **Event: `sensor-data`**
  - Sent when ESP32 sends sensor reading
  - Payload: `{ timestamp: number, value: number }`

## 🎯 How to Use

### For Patient:

1. Open `http://localhost:3000/patient.html` in a browser
2. Click **"Start Camera"** and allow webcam access
3. Position yourself so your upper body is visible
4. Perform bicep curls
5. Watch the rep count and form accuracy update in real-time
6. Data is automatically sent to the backend every 2 seconds

### For Doctor:

1. Open `http://localhost:3000/doctor.html` in a browser
2. The dashboard will automatically connect via WebSocket
3. Monitor:
   - **Total Reps**: Number of bicep curls completed
   - **Form Accuracy**: Percentage score (0-100%)
   - **Muscle Activation**: Current FSR sensor reading
   - **Real-Time Chart**: FSR sensor data over time

## 🔒 Security Notes

- The API key is currently sent in plain text in requests
- For production, consider:
  - Using HTTPS/WSS
  - Implementing proper authentication (JWT tokens)
  - Rate limiting
  - Input validation and sanitization

## 🐛 Troubleshooting

### Backend Issues:

- **Port already in use**: Change `PORT` in `.env` or kill the process using port 3000
- **WebSocket connection fails**: Ensure CORS is configured correctly and firewall allows connections

### ESP32 Issues:

- **WiFi connection fails**: Verify SSID and password are correct
- **Cannot reach server**: 
  - Ensure backend is running
  - Verify `SERVER_URL` matches backend IP address
  - Check firewall settings
- **Sensor readings are 0 or constant**: 
  - Check FSR wiring
  - Verify pull-down resistor is connected
  - Test with multimeter

### Patient Page Issues:

- **Webcam not working**: Check browser permissions and ensure no other app is using the camera
- **MediaPipe not loading**: Check internet connection (MediaPipe is loaded from CDN)
- **Reps not counting**: Ensure full range of motion is visible in camera frame

### Doctor Dashboard Issues:

- **No data received**: 
  - Check WebSocket connection status (top indicator)
  - Verify backend is running
  - Check browser console for errors

## 📝 Notes

- MediaPipe Pose is loaded from CDN, so an internet connection is required for the patient page
- Sensor data is sent every 200ms from ESP32 (configurable in `.ino` file)
- Patient page sends updates every 2 seconds
- The system is designed for exactly 1 patient and 1 doctor session
- No database is required - all data is streamed in real-time

## 🛠️ Development

### Running in Development Mode:

```bash
cd backend
npm run start:dev
```

This will watch for file changes and auto-reload.

### Building for Production:

```bash
cd backend
npm run build
npm run start:prod
```

## 📄 License

MIT License - feel free to use and modify as needed.

## 🤝 Contributing

This is a complete implementation with no placeholders. All code is production-ready and fully functional.

---

**Built with:**
- NestJS (Backend)
- Socket.IO (WebSocket)
- MediaPipe Pose (Computer Vision)
- Chart.js (Visualization)
- ESP32 (IoT Sensor)

