#pragma once
#include <Arduino.h>
#include <PZEM004Tv30.h>

class PowerMonitor {
public:
    void begin();
    void update();
    
    float getVoltage() const { return voltage; }
    float getCurrent() const { return current; }
    float getPower() const { return power; }
    float getEnergy() const { return energy; }

private:
    PZEM004Tv30* pzem;
    float voltage = 0.0;
    float current = 0.0;
    float power = 0.0;
    float energy = 0.0;
    unsigned long lastRead = 0;
};

extern PowerMonitor powerMonitor;
