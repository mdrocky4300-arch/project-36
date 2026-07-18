#pragma once

#include <Arduino.h>
#include <WiFiManager.h>
#include <Firebase_ESP_Client.h>
#include "Config.h"
#include "addons/TokenHelper.h"

class NetworkManager {
public:
    void begin();
    void loop();
    void updateFirebaseState(bool lightOn, bool fanOn, int fanSpeed, float voltage, float current, float power, float energy);
    void logEvent(const String& device, const String& previousState, const String& newState);

    
    typedef void (*StateChangeCallback)(bool lightOn, bool fanOn, int fanSpeed);
    void setStateChangeCallback(StateChangeCallback cb) { callback = cb; }

private:
    FirebaseData fbdo;
    FirebaseAuth auth;
    FirebaseConfig config;
    unsigned long sendDataPrevMillis = 0;
    StateChangeCallback callback = nullptr;

    void initWiFi();
    void initFirebase();
};

extern NetworkManager network;
