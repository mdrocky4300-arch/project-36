#include "InputManager.h"
#include "Config.h"

InputManager inputManager;

// ISR for Rotary Encoder
void IRAM_ATTR checkPosition() {
    inputManager.getEncoder()->tick();
}

void InputManager::begin() {
    pinMode(PIN_BTN_LIGHT, INPUT_PULLUP);
    pinMode(PIN_BTN_FAN, INPUT_PULLUP);
    pinMode(PIN_ENC_SW, INPUT_PULLUP);
    
    encoder = new RotaryEncoder(PIN_ENC_DT, PIN_ENC_CLK, RotaryEncoder::LatchMode::TWO03);
    
    attachInterrupt(digitalPinToInterrupt(PIN_ENC_CLK), checkPosition, CHANGE);
    attachInterrupt(digitalPinToInterrupt(PIN_ENC_DT), checkPosition, CHANGE);
}

void InputManager::update() {
    // Encoder position check is handled via ISR, but we check if position changed here
    int newPos = encoder->getPosition();
    if (newPos != 0) {
        if(encCb) encCb(newPos);
        encoder->setPosition(0);
    }

    unsigned long currentMillis = millis();

    // Debounce Light Button
    bool lightReading = digitalRead(PIN_BTN_LIGHT);
    if (lightReading != lastLightBtn) {
        if (currentMillis - lastDebounceLight > 50) {
            if (lightReading == LOW && lightCb) {
                lightCb();
            }
            lastLightBtn = lightReading;
            lastDebounceLight = currentMillis;
        }
    }

    // Debounce Fan Button
    bool fanReading = digitalRead(PIN_BTN_FAN);
    if (fanReading != lastFanBtn) {
        if (currentMillis - lastDebounceFan > 50) {
            if (fanReading == LOW && fanCb) {
                fanCb();
            }
            lastFanBtn = fanReading;
            lastDebounceFan = currentMillis;
        }
    }
    
    // Debounce Encoder Button
    bool encReading = digitalRead(PIN_ENC_SW);
    if (encReading != lastEncBtn) {
        if (currentMillis - lastDebounceEnc > 50) {
            if (encReading == LOW && encPressCb) {
                encPressCb();
            }
            lastEncBtn = encReading;
            lastDebounceEnc = currentMillis;
        }
    }
}
