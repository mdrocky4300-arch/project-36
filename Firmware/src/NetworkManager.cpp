#include "NetworkManager.h"

NetworkManager network;

void NetworkManager::begin() {
    initWiFi();
    initFirebase();
}

void NetworkManager::initWiFi() {
    WiFiManager wm;
    bool res = wm.autoConnect("SmartHome_ESP32", "admin123");
    if(!res) {
        Serial.println("Failed to connect");
        ESP.restart();
    } 
    else {
        Serial.println("Connected to WiFi!");
    }
}

void NetworkManager::initFirebase() {
    config.api_key = FIREBASE_API_KEY;
    
    // Anonymous auth or email/pass. Usually email/pass for devices.
    auth.user.email = "device@smarthome.local";
    auth.user.password = "device1234";

    Firebase.begin(&config, &auth);
    Firebase.reconnectWiFi(true);
}

void NetworkManager::loop() {
    if (Firebase.ready() && (millis() - sendDataPrevMillis > HEARTBEAT_INTERVAL_MS || sendDataPrevMillis == 0)) {
        sendDataPrevMillis = millis();
        // Send heartbeat to RTDB
        Firebase.RTDB.setInt(&fbdo, "devices/main_controller/lastSeen", millis());
    }
}

void NetworkManager::updateFirebaseState(bool lightOn, bool fanOn, int fanSpeed, float voltage, float current, float power, float energy) {
    if(Firebase.ready()){
        // Ultra-low latency RTDB push
        FirebaseJson json;
        json.set("lightOn", lightOn);
        json.set("fanOn", fanOn);
        json.set("fanSpeed", fanSpeed);
        json.set("voltage", voltage);
        json.set("power", power);
        Firebase.RTDB.setJSON(&fbdo, "devices/main_controller", &json);
    }
}

void NetworkManager::logEvent(const String& device, const String& previousState, const String& newState) {
    if(Firebase.ready()){
        // Log to Firestore collection
        FirebaseJson content;
        content.set("fields/device/stringValue", device.c_str());
        content.set("fields/previousState/stringValue", previousState.c_str());
        content.set("fields/newState/stringValue", newState.c_str());
        content.set("fields/source/stringValue", "Manual");
        
        // This pushes a new document to the "logs" collection
        // Firebase.Firestore.createDocument(&fbdo, FIREBASE_PROJECT_ID, "", "logs", content.raw());
        Serial.printf("LOGGED: %s changed from %s to %s\n", device.c_str(), previousState.c_str(), newState.c_str());
    }
}
