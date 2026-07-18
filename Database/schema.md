# Firebase Database Schema

This document outlines the NoSQL structure for the Smart Home IoT Platform. We use **Firestore** for persistent, queryable data (Users, Devices, Logs, Licenses) and **Firebase Realtime Database (RTDB)** for low-latency device state synchronization.

## 1. Firestore Schema (Persistent Data)

### `users` Collection
Stores user profiles and metadata.
- Document ID: `uid` (Firebase Auth UID)
- Fields:
  - `email`: string
  - `displayName`: string
  - `role`: string ('superadmin', 'admin', 'dealer', 'customer')
  - `createdAt`: timestamp
  - `lastLogin`: timestamp

### `devices` Collection
Stores metadata and configuration for every manufactured ESP32 device.
- Document ID: `deviceId` (e.g., `SH-00000001`)
- Fields:
  - `serialNumber`: string (`SN-2026-000001`)
  - `activationCodeHash`: string (Hashed for security)
  - `secretKeyHash`: string (Hashed for security)
  - `licenseStatus`: string ('active', 'inactive', 'revoked')
  - `batchId`: string (For admin tracking)
  - `manufacturedDate`: timestamp
  - `ownerUid`: string (null if not activated)
  - `activatedAt`: timestamp (null if not activated)
  - `hardwareModel`: string
  - `firmwareVersion`: string
  - `macAddress`: string
  - `isBlacklisted`: boolean

### `rooms` Collection
Stores user-defined rooms for device organization.
- Document ID: Auto-generated
- Fields:
  - `ownerUid`: string
  - `name`: string (e.g., 'Living Room')
  - `icon`: string
  - `createdAt`: timestamp

### `device_allocations` Collection (Subcollection of `rooms`)
Links devices to rooms.
- Path: `rooms/{roomId}/devices/{deviceId}`
- Fields:
  - `addedAt`: timestamp
  - `deviceName`: string (Custom name set by user)

### `licenses` Collection
Tracks commercial licenses if using a paid tier.
- Document ID: `licenseKey`
- Fields:
  - `deviceId`: string
  - `type`: string ('lifetime', 'subscription')
  - `expiresAt`: timestamp
  - `issuedAt`: timestamp

### `logs` Collection (Audit & Security)
Enterprise audit trail.
- Document ID: Auto-generated
- Fields:
  - `timestamp`: timestamp
  - `event`: string ('ACTIVATION_FAILED', 'DEVICE_OFFLINE', 'OTA_SUCCESS', 'LOGIN')
  - `deviceId`: string (optional)
  - `uid`: string (optional)
  - `ipAddress`: string
  - `details`: map

## 2. Realtime Database (RTDB) Schema (Live Sync)

For ultra-low latency, the ESP32 devices sync directly with the RTDB.

### `devices_state` Node
- Path: `/devices/{deviceId}`
- Structure:
  ```json
  {
    "online": true,
    "lastSeen": 1690000000,
    "ip": "192.168.1.100",
    "wifiSignal": -65,
    "state": {
      "light": {
        "on": true
      },
      "fan": {
        "on": true,
        "speed": 75 // 0-100%
      }
    },
    "sensors": {
      "power": {
        "voltage": 230.5,
        "current": 1.2,
        "activePower": 276.6,
        "energy": 120.5,
        "frequency": 50.1,
        "powerFactor": 0.95
      }
    }
  }
  ```

### `devices_config` Node
Configuration synced to the device.
- Path: `/config/{deviceId}`
- Structure:
  ```json
  {
    "otaUpdate": {
      "url": "https://storage.googleapis.com/.../firmware_v2.bin",
      "version": "v2.0.0",
      "trigger": 1690001000
    },
    "settings": {
      "timezone": "Asia/Dhaka",
      "ledEnabled": true
    }
  }
  ```

## Security Rules

- **Firestore**: Only superadmins/admins can read/write all `devices`. Customers can only read/write `devices` where `ownerUid == request.auth.uid`.
- **RTDB**: ESP32 authenticates via custom tokens. Device can only read `/config/{deviceId}` and write to `/devices/{deviceId}`. Users can only read/write to their owned devices (validated via Firebase Functions or Claims).
