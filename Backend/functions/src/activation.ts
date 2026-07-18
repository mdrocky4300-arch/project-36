import * as functions from 'firebase-functions';
import * as crypto from 'crypto';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

const db = getFirestore();
const auth = getAuth();

export function hashValue(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * activateDevice
 * Called by the customer via the mobile app / web portal after scanning the QR code.
 * Binds the device to their account if the activation code and secret match.
 */
export const activateDevice = functions.https.onCall(async (request) => {
    const data = request.data as { deviceId?: string; activationCode?: string; secretKey?: string };
    const { deviceId, activationCode, secretKey } = data;

    if (!request.auth) {
        throw new functions.https.HttpsError('unauthenticated', 'User must be logged in to activate a device.');
    }

    if (!deviceId || !activationCode || !secretKey) {
        throw new functions.https.HttpsError('invalid-argument', 'deviceId, activationCode and secretKey are required.');
    }

    const deviceRef = db.collection('devices').doc(deviceId);
    const deviceSnap = await deviceRef.get();

    if (!deviceSnap.exists) {
        throw new functions.https.HttpsError('not-found', 'Invalid Device ID.');
    }

    const deviceData = deviceSnap.data()!;

    if (deviceData.isBlacklisted) {
        throw new functions.https.HttpsError('permission-denied', 'This device has been blacklisted.');
    }

    if (deviceData.ownerUid) {
        throw new functions.https.HttpsError('already-exists', 'This device is already bound to an account.');
    }

    const activationHash = hashValue(activationCode!);
    const secretHash = hashValue(secretKey!);

    if (activationHash !== deviceData.activationCodeHash || secretHash !== deviceData.secretKeyHash) {
        await db.collection('logs').add({
            timestamp: FieldValue.serverTimestamp(),
            event: 'ACTIVATION_FAILED',
            deviceId,
            uid: request.auth.uid,
            ipAddress: request.rawRequest?.ip || 'unknown',
            details: { reason: 'Invalid activation credentials' }
        });

        throw new functions.https.HttpsError('invalid-argument', 'Invalid activation credentials.');
    }

    const deviceCustomToken = await auth.createCustomToken(deviceId, { device: true });

    await deviceRef.update({
        ownerUid: request.auth.uid,
        activatedAt: FieldValue.serverTimestamp(),
        activationDate: FieldValue.serverTimestamp(),
        ownerEmail: request.auth.token.email || 'unknown',
        status: 'active',
        licenseStatus: 'active',
        firmwareVersion: deviceData.firmwareVersion || 'v1.0.0',
        warrantyStartDate: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp()
    });

    await db.collection('logs').add({
        timestamp: FieldValue.serverTimestamp(),
        event: 'DEVICE_ACTIVATED',
        deviceId,
        uid: request.auth.uid,
        ipAddress: request.rawRequest?.ip || 'unknown'
    });

    return {
        success: true,
        deviceToken: deviceCustomToken,
        device: {
            deviceId,
            status: 'active',
            firmwareVersion: deviceData.firmwareVersion || 'v1.0.0',
            deviceModel: deviceData.hardwareModel || 'GENERIC-ESP32'
        }
    };
});
