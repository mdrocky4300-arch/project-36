#pragma once
#include <Arduino.h>
#include <Update.h>
#include <HTTPClient.h>

class OTAManager {
public:
    void begin();
    void loop();
    void checkForUpdates(const String& currentVersion);

private:
    unsigned long lastCheck = 0;
};

extern OTAManager ota;
