#pragma once
#include <Arduino.h>
#include <RotaryEncoder.h>

class InputManager {
public:
    void begin();
    void update();

    typedef void (*ButtonCallback)();
    typedef void (*EncoderCallback)(int direction);
    
    void onLightToggle(ButtonCallback cb) { lightCb = cb; }
    void onFanToggle(ButtonCallback cb) { fanCb = cb; }
    void onEncoderTurn(EncoderCallback cb) { encCb = cb; }
    void onEncoderPress(ButtonCallback cb) { encPressCb = cb; }

    RotaryEncoder* getEncoder() { return encoder; }

private:
    RotaryEncoder* encoder;
    ButtonCallback lightCb = nullptr;
    ButtonCallback fanCb = nullptr;
    EncoderCallback encCb = nullptr;
    ButtonCallback encPressCb = nullptr;
    
    bool lastLightBtn = HIGH;
    bool lastFanBtn = HIGH;
    bool lastEncBtn = HIGH;
    
    unsigned long lastDebounceLight = 0;
    unsigned long lastDebounceFan = 0;
    unsigned long lastDebounceEnc = 0;
};

extern InputManager inputManager;
