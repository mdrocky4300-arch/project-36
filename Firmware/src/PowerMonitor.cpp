#include "PowerMonitor.h"
#include "Config.h"

PowerMonitor powerMonitor;

void PowerMonitor::begin() {
    Serial2.begin(9600, SERIAL_8N1, PIN_PZEM_RX, PIN_PZEM_TX);
    pzem = new PZEM004Tv30(Serial2);
}

void PowerMonitor::update() {
    if (millis() - lastRead > 2000) {
        lastRead = millis();
        voltage = pzem->voltage();
        current = pzem->current();
        power = pzem->power();
        energy = pzem->energy();
        
        if(isnan(voltage)) {
            voltage = 0;
            current = 0;
            power = 0;
            // Serial.println("Error reading PZEM");
        }
    }
}
