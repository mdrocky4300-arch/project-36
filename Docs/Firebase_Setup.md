# Firebase Setup Guide

To power the backend of your Smart Home system, you need to configure a Firebase project.

## 1. Create a Firebase Project
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Click **Add Project** and name it (e.g., "Smart Home Controller").
3. You can disable Google Analytics for this project.

## 2. Enable Authentication
1. In the left sidebar, click **Authentication** and then **Get Started**.
2. Go to the **Sign-in method** tab.
3. Enable **Email/Password**.
4. Enable **Google** (you will need to provide a support email).

## 3. Enable Firestore Database
1. In the left sidebar, click **Firestore Database** and then **Create Database**.
2. Start in **Test Mode** (we will update the rules later) and choose a location close to you.
3. Once created, go to the **Rules** tab and paste the following:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Ensure only authenticated users can read/write their own devices
       match /devices/{deviceId} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## 4. Get Web Configuration
1. Go to **Project Settings** (gear icon top left).
2. Under "Your apps", click the **Web** icon (`</>`).
3. Register the app (e.g., "Web Dashboard").
4. Copy the `firebaseConfig` object provided. You will need this for Phase 2 (Website). It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "1:123456789:web:abcdef"
   };
   ```

## 5. Firmware Configuration
You will need the `apiKey` and `projectId` from the web configuration above to configure the ESP32 firmware in Phase 3.
