#include <Arduino.h>
#include "Config.h"
#include "NetworkManager.h"
#include "FanController.h"
#include "PowerMonitor.h"
#include "InputManager.h"

// FreeRTOS Task Handles
TaskHandle_t NetworkTaskHandle;
TaskHandle_t HardwareTaskHandle;

// Global State
bool currentLightOn = false;
bool currentFanOn = false;
int currentFanSpeed = 50;

void onLightToggle() {
    bool prevState = currentLightOn;
    currentLightOn = !currentLightOn;
    digitalWrite(PIN_RELAY_LIGHT, currentLightOn ? HIGH : LOW);
    network.updateFirebaseState(currentLightOn, currentFanOn, currentFanSpeed, powerMonitor.getVoltage(), powerMonitor.getCurrent(), powerMonitor.getPower(), powerMonitor.getEnergy());
    network.logEvent("Light", prevState ? "ON" : "OFF", currentLightOn ? "ON" : "OFF");
}

void onFanToggle() {
    bool prevState = currentFanOn;
    currentFanOn = !currentFanOn;
    digitalWrite(PIN_RELAY_FAN_MAIN, currentFanOn ? HIGH : LOW);
    if(currentFanOn) {
        fan.setSpeed(currentFanSpeed);
    } else {
        fan.setSpeed(0);
    }
    network.updateFirebaseState(currentLightOn, currentFanOn, currentFanSpeed, powerMonitor.getVoltage(), powerMonitor.getCurrent(), powerMonitor.getPower(), powerMonitor.getEnergy());
    network.logEvent("Fan Power", prevState ? "ON" : "OFF", currentFanOn ? "ON" : "OFF");
}

void onEncoderTurn(int direction) {
    if(!currentFanOn) return;
    
    int prevSpeed = currentFanSpeed;
    currentFanSpeed += (direction * 5); // Change by 5% increments
    if(currentFanSpeed > 100) currentFanSpeed = 100;
    if(currentFanSpeed < 0) currentFanSpeed = 0;
    
    fan.setSpeed(currentFanSpeed);
    network.updateFirebaseState(currentLightOn, currentFanOn, currentFanSpeed, powerMonitor.getVoltage(), powerMonitor.getCurrent(), powerMonitor.getPower(), powerMonitor.getEnergy());
    network.logEvent("Fan Speed", String(prevSpeed) + "%", String(currentFanSpeed) + "%");
}

void NetworkTask(void *pvParameters) {
    network.begin();
    for(;;) {
        network.loop();
        vTaskDelay(pdMS_TO_TICKS(10)); // Yield
    }
}

void HardwareTask(void *pvParameters) {
    // Init hardware components
    pinMode(PIN_RELAY_LIGHT, OUTPUT);
    pinMode(PIN_RELAY_FAN_MAIN, OUTPUT);
    digitalWrite(PIN_RELAY_LIGHT, LOW);
    digitalWrite(PIN_RELAY_FAN_MAIN, LOW);
    
    fan.begin();
    powerMonitor.begin();
    inputManager.begin();
    
    inputManager.onLightToggle(onLightToggle);
    inputManager.onFanToggle(onFanToggle);
    inputManager.onEncoderTurn(onEncoderTurn);
    // Use encoder press for Fan Toggle as well
    inputManager.onEncoderPress(onFanToggle);

    for(;;) {
        inputManager.update();
        powerMonitor.update();
        
        vTaskDelay(pdMS_TO_TICKS(20));
    }
}

void setup() {
    Serial.begin(115200);
    Serial.println("Starting Smart Home Pro");

    // Network Task on Core 0 (Protocol Core)
    xTaskCreatePinnedToCore(
        NetworkTask,
        "NetworkTask",
        8192,
        NULL,
        1,
        &NetworkTaskHandle,
        0 
    );

    // Hardware Task on Core 1 (App Core)
    xTaskCreatePinnedToCore(
        HardwareTask,
        "HardwareTask",
        4096,
        NULL,
        2,
        &HardwareTaskHandle,
        1 
    );
}

void loop() {
    // Delete setup/loop task to free memory, as we use FreeRTOS tasks
    vTaskDelete(NULL); 
}
