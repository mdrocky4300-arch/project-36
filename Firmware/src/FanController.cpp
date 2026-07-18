#include "FanController.h"
#include "Config.h"

FanController fan;

volatile uint32_t delayTime = 0;
volatile bool zeroCrossed = false;
hw_timer_t * timer = NULL;

void IRAM_ATTR FanController::zeroCrossInterrupt() {
    zeroCrossed = true;
    if(delayTime > 0) {
        timerAlarmWrite(timer, delayTime, false);
        timerRestart(timer);
        timerAlarmEnable(timer);
    }
}

void IRAM_ATTR FanController::timerInterrupt() {
    if(zeroCrossed) {
        digitalWrite(PIN_TRIAC_PWM, HIGH);
        delayMicroseconds(10); 
        digitalWrite(PIN_TRIAC_PWM, LOW);
        zeroCrossed = false;
    }
}

void FanController::begin() {
    pinMode(PIN_TRIAC_PWM, OUTPUT);
    digitalWrite(PIN_TRIAC_PWM, LOW);
    pinMode(PIN_ZERO_CROSS, INPUT_PULLUP);

    timer = timerBegin(0, 80, true); // 1us tick (80MHz/80)
    timerAttachInterrupt(timer, &FanController::timerInterrupt, true);
    
    attachInterrupt(digitalPinToInterrupt(PIN_ZERO_CROSS), &FanController::zeroCrossInterrupt, RISING);
}

void FanController::setSpeed(uint8_t percentage) {
    currentSpeed = percentage;
    if (percentage == 0) {
        delayTime = 0; // Off
        digitalWrite(PIN_TRIAC_PWM, LOW);
    } else if (percentage >= 100) {
        delayTime = 50; // Almost immediate firing
    } else {
        // Map 1-99% to delay time in microseconds 
        // 50Hz AC half cycle is 10000us
        delayTime = map(percentage, 1, 99, 9000, 1000); 
    }
}
