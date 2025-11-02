/**
 * ESP32 FSR Sensor - Remote Medical Practice System
 * 
 * This sketch reads FSR (Force Sensitive Resistor) sensor values from an analog pin
 * and sends them to the backend server via HTTP POST requests every 200ms.
 * 
 * Hardware Setup:
 * - FSR sensor connected to analog pin (default: GPIO34 / A2)
 * - Connect one FSR terminal to analog pin
 * - Connect other FSR terminal through a 10kΩ pull-down resistor to GND
 * - Connect the junction between FSR and resistor to analog pin
 * 
 * Configuration:
 * - Update WIFI_SSID and WIFI_PASSWORD with your WiFi credentials
 * - Update SERVER_URL with your backend server IP/domain
 * - Update API_KEY to match backend .env SENSOR_API_KEY
 */

#include <WiFi.h>
#include <HTTPClient.h>

// ============ CONFIGURATION ============
const char* WIFI_SSID = "YOUR_WIFI_SSID";      // Replace with your WiFi SSID
const char* WIFI_PASSWORD = "YOUR_WIFI_PASSWORD"; // Replace with your WiFi password
const char* SERVER_URL = "http://192.168.1.3:3000"; // Replace with your backend URL
const char* API_KEY = "changeme123";            // Must match backend .env SENSOR_API_KEY

// Sensor pin configuration
const int FSR_PIN = 34;  // GPIO34 (ADC1_CH6) - Change if using different pin
const int SEND_INTERVAL = 200; // Send data every 200ms

// ============ GLOBAL VARIABLES ============
unsigned long lastSendTime = 0;
HTTPClient http;
WiFiClient client;

// ============ SETUP ============
void setup() {
  // Initialize serial communication
  Serial.begin(115200);
  delay(1000);
  
  Serial.println("\n\n========================================");
  Serial.println("  RMP System - ESP32 FSR Sensor");
  Serial.println("========================================\n");

  // Configure FSR pin (analog input)
  pinMode(FSR_PIN, INPUT);
  
  // Connect to WiFi
  connectToWiFi();
  
  Serial.println("✅ ESP32 initialized and ready!");
  Serial.print("📡 Sending sensor data to: ");
  Serial.println(SERVER_URL);
  Serial.print("⏱️  Update interval: ");
  Serial.print(SEND_INTERVAL);
  Serial.println("ms\n");
}

// ============ MAIN LOOP ============
void loop() {
  // Check WiFi connection
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  WiFi disconnected. Reconnecting...");
    connectToWiFi();
  }

  // Send sensor reading at specified interval
  unsigned long currentTime = millis();
  if (currentTime - lastSendTime >= SEND_INTERVAL) {
    sendSensorReading();
    lastSendTime = currentTime;
  }

  // Small delay to prevent overwhelming the system
  delay(10);
}

// ============ FUNCTIONS ============

/**
 * Connect to WiFi network
 */
void connectToWiFi() {
  Serial.print("🔌 Connecting to WiFi: ");
  Serial.println(WIFI_SSID);
  
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int attempts = 0;
  while (WiFi.status() != WL_CONNECTED && attempts < 20) {
    delay(500);
    Serial.print(".");
    attempts++;
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("✅ WiFi connected!");
    Serial.print("📡 IP Address: ");
    Serial.println(WiFi.localIP());
    Serial.print("📶 Signal Strength: ");
    Serial.print(WiFi.RSSI());
    Serial.println(" dBm\n");
  } else {
    Serial.println("❌ WiFi connection failed!");
    Serial.println("Please check your credentials and try again.\n");
  }
}

/**
 * Read FSR sensor value and send to backend
 */
void sendSensorReading() {
  // Check WiFi connection first
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠️  WiFi not connected, skipping send");
    return;
  }

  // Read analog value from FSR (0-4095 for ESP32, 12-bit ADC)
  int rawValue = analogRead(FSR_PIN);
  
  // Optional: Convert to voltage or force (calibrate based on your FSR)
  // For now, we'll send the raw analog reading
  float sensorValue = rawValue;

  // Create JSON payload
  String jsonPayload = "{\"value\":" + String(sensorValue) + "}";
  
  // Build full URL
  String fullURL = String(SERVER_URL) + "/iot/reading";
  
  // Debug: Print URL on first attempt or error
  static bool firstAttempt = true;
  if (firstAttempt) {
    Serial.print("🔗 Attempting to connect to: ");
    Serial.println(fullURL);
    firstAttempt = false;
  }

  // Initialize HTTP client with timeout
  http.begin(client, fullURL);
  http.setTimeout(5000); // 5 second timeout
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", API_KEY);

  // Send POST request
  int httpResponseCode = http.POST(jsonPayload);

  // Check response
  if (httpResponseCode > 0) {
    String response = http.getString();
    
    // Only print every 10th reading to avoid spam (every 2 seconds at 200ms interval)
    static int printCounter = 0;
    if (printCounter % 10 == 0) {
      Serial.print("✅ Sensor reading sent: ");
      Serial.print(sensorValue);
      Serial.print(" (HTTP ");
      Serial.print(httpResponseCode);
      Serial.println(")");
    }
    printCounter++;
  } else {
    // Enhanced error reporting
    Serial.println("\n❌ ========== HTTP Error ==========");
    Serial.print("Response Code: ");
    Serial.println(httpResponseCode);
    Serial.print("Error: ");
    Serial.println(http.errorToString(httpResponseCode));
    Serial.print("Server URL: ");
    Serial.println(fullURL);
    Serial.print("WiFi Status: ");
    Serial.println(WiFi.status());
    Serial.print("ESP32 IP: ");
    Serial.println(WiFi.localIP());
    Serial.println("===================================\n");
    
    // Common error codes:
    // -1 = Connection failed (server unreachable)
    // -2 = Timeout
    // -3 = Invalid response
    // -4 = Too many redirects
    
    if (httpResponseCode == -1) {
      Serial.println("💡 Troubleshooting:");
      Serial.println("   1. Check if backend server is running");
      Serial.println("   2. Verify SERVER_URL IP address is correct");
      Serial.println("   3. Ensure ESP32 and server are on same network");
      Serial.println("   4. Check firewall/antivirus settings");
      Serial.println("   5. Test URL in browser: http://SERVER_IP:3000/iot/reading");
    }
  }

  // Clean up
  http.end();
}

/**
 * Optional: Calibrate FSR reading to force/weight
 * Uncomment and adjust based on your specific FSR sensor
 */
/*
float convertToForce(int rawValue) {
  // This is a placeholder formula - calibrate based on your FSR specs
  // Typical FSR: V = Vcc * R / (R + R_fsr)
  // You may need to map rawValue to actual force/weight using calibration data
  
  float voltage = (rawValue / 4095.0) * 3.3; // ESP32 ADC reference voltage
  float force = 0.0; // Add your calibration formula here
  
  return force;
}
*/

