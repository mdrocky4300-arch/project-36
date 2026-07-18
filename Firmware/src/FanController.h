#pragma once
#include <Arduino.h>

class FanController {
public:
    void begin();
    void setSpeed(uint8_t percentage); // 0 - 100
    uint8_t getSpeed() const { return currentSpeed; }

    static void IRAM_ATTR zeroCrossInterrupt();
    static void IRAM_ATTR timerInterrupt();

private:
    uint8_t currentSpeed = 0;
};

extern FanController fan;
