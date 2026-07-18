# Hardware & Wiring Documentation

## Bill of Materials (BOM)
1. **Microcontroller**: ESP32 ESP-32S Development Board
2. **Relays**: 2 Channel Relay Module (5V logic)
3. **Fan Dimmer**: BTA16 AC Dimmer Module with Zero-Cross Detection
4. **Power Supply**: AC-DC 220V to 5V Isolated Power Supply (HLK-PM01 or similar)
5. **Input Interface**: KY-040 Rotary Encoder
6. **Buttons**: 2x Push Buttons (for Light and Fan toggles)
7. **Protection**: 
   - MOV 14D471K (Metal Oxide Varistor for surge protection)
   - 1A Slow Blow Fuse & Fuse Holder
8. **Power Monitoring**: PZEM-004T V3 
9. **Misc**: Terminal Blocks, Status LEDs, ABS Enclosure, wires.

## Pin Mapping (ESP32)

| Component | Pin Function | ESP32 GPIO | Notes |
| :--- | :--- | :--- | :--- |
| **Relay 1 (Light)** | Digital Out | GPIO 26 | Active High/Low depends on relay module |
| **Relay 2 (Main Fan Pwr)**| Digital Out | GPIO 27 | Used to completely cut power to fan |
| **BTA16 Triac Dimmer** | PWM Out | GPIO 14 | Fires the triac |
| **BTA16 Zero-Cross** | Interrupt In | GPIO 12 | Detects AC zero-crossing |
| **KY-040 CLK** | Interrupt In | GPIO 18 | Rotary Encoder Pin A |
| **KY-040 DT** | Interrupt In | GPIO 19 | Rotary Encoder Pin B |
| **KY-040 SW** | Digital In | GPIO 23 | Rotary Push Button |
| **Light Button** | Digital In | GPIO 32 | With internal pull-up |
| **Fan Button** | Digital In | GPIO 33 | With internal pull-up |
| **PZEM-004T RX** | UART TX | GPIO 17 | Serial2 TX |
| **PZEM-004T TX** | UART RX | GPIO 16 | Serial2 RX |
| **WiFi Status LED** | Digital Out | GPIO 2 | Onboard LED or external |
| **Power Status LED** | Power | 3V3 / GND| Wire directly to 3V3 rail with resistor |

## Wiring Diagram

1. **AC Power Input (220V)**:
   - Line (L) connects to the Fuse.
   - Output of Fuse connects to one leg of MOV.
   - Neutral (N) connects to the other leg of MOV.
   - L and N connect to the AC-DC 5V Power Supply.
   - L connects to the Relay Common (COM) for the Light.
   - L connects to the Triac Module line in.
   - PZEM-004T CT Coil goes around the main L wire (or specifically the loads you want to measure).
   - PZEM-004T Voltage input connects to L and N.

2. **DC Power (5V & 3.3V)**:
   - 5V Output from Power Supply connects to ESP32 `VIN` (or `5V`) and `GND`.
   - Relay Module VCC connects to 5V.
   - PZEM-004T VCC connects to 5V.
   - Rotary Encoder VCC connects to 3.3V (to keep logic levels at 3.3V).
   
3. **Loads**:
   - Light AC Line connects to Relay 1 `NO` (Normally Open).
   - Fan AC Line connects to Triac Module output.
   - Both Fan and Light Neutral connect to main AC Neutral.
