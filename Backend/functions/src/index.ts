import * as admin from 'firebase-admin';

// Initialize Firebase Admin App
admin.initializeApp();

// Export Cloud Functions
export { generateDevice, blacklistDevice, transferDevice, resetDevice } from './admin';
export { activateDevice } from './activation';
