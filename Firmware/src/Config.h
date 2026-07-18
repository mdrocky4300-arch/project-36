#pragma once

#include <Arduino.h>

// ---------------------------------------------------------
// FIREBASE CONFIGURATION
// ---------------------------------------------------------
#define FIREBASE_PROJECT_ID "your-project"
#define FIREBASE_CLIENT_EMAIL "firebase-adminsdk-xxx@your-project.iam.gserviceaccount.com"
const char FIREBASE_PRIVATE_KEY[] PROGMEM = "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n";

#define FIREBASE_API_KEY "AIzaSy..."

// ---------------------------------------------------------
// PIN CONFIGURATION
// ---------------------------------------------------------

// Relays
#define PIN_RELAY_LIGHT 26
#define PIN_RELAY_FAN_MAIN 27

// Dimmer / Fan Speed (Triac)
#define PIN_TRIAC_PWM 14
#define PIN_ZERO_CROSS 12

// Rotary Encoder
#define PIN_ENC_CLK 18
#define PIN_ENC_DT 19
#define PIN_ENC_SW 23

// Push Buttons
#define PIN_BTN_LIGHT 32
#define PIN_BTN_FAN 33

// PZEM-004T
#define PIN_PZEM_RX 16
#define PIN_PZEM_TX 17

// LEDs
#define PIN_LED_WIFI 2

// ---------------------------------------------------------
// OTHER DEFINES
// ---------------------------------------------------------
#define HEARTBEAT_INTERVAL_MS 10000
