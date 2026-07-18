import * as functions from 'firebase-functions';
import * as crypto from 'crypto';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

const db = getFirestore();

function generateRandomString(length: number): string {
    return crypto.randomBytes(Math.ceil(length / 2)).toString('hex').slice(0, length).toUpperCase();
}

function buildActivationCode(): string {
    return `ACT-${generateRandomString(4)}-${generateRandomString(4)}-${generateRandomString(4)}`;
}

function buildSerialNumber(): string {
    const year = new Date().getFullYear();
    const sequence = String(Math.floor(Math.random() * 999999)).padStart(6, '0');
    return `SN-${year}-${sequence}`;
}

async function createUniqueDeviceId(): Promise<string> {
    const candidate = `SH-${new Date().getFullYear()}-${generateRandomString(6)}`;
    const existing = await db.collection('devices').doc(candidate).get();
    if (!existing.exists) {
        return candidate;
    }
    return createUniqueDeviceId();
}

function hashValue(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
}

/**
 * generateDevice
 * Callable function for Admins to generate one or more device identities.
 */
export const generateDevice = functions.https.onCall(async (request) => {
    const data = request.data as { hardwareModel?: string; batchId?: string; quantity?: number };
    if (!request.auth || !['admin', 'superadmin'].includes(request.auth.token.role)) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can generate devices.');
    }

    const hardwareModel = data.hardwareModel || 'GENERIC-ESP32';
    const batchId = data.batchId || `BATCH-${Date.now()}`;
    const quantity = Math.max(1, Math.min(1000, Number(data.quantity || 1)));

    const generatedDevices: Array<{ deviceId: string; serialNumber: string; activationCode: string; secretKey: string }> = [];

    for (let index = 0; index < quantity; index += 1) {
        const deviceId = await createUniqueDeviceId();
        const serialNumber = buildSerialNumber();
        const activationCode = buildActivationCode();
        const secretKey = generateRandomString(24);
        const activationCodeHash = hashValue(activationCode);
        const secretKeyHash = hashValue(secretKey);

        const deviceData = {
            serialNumber,
            activationCodeHash,
            secretKeyHash,
            licenseStatus: 'inactive',
            licenseType: 'lifetime',
            licenseKeyEncrypted: hashValue(secretKey),
            batchId,
            manufacturedDate: FieldValue.serverTimestamp(),
            ownerUid: null,
            activatedAt: null,
            hardwareModel,
            firmwareVersion: 'v1.0.0',
            macAddress: '',
            status: 'inactive',
            isBlacklisted: false,
            online: false,
            createdAt: FieldValue.serverTimestamp(),
            updatedAt: FieldValue.serverTimestamp()
        };

        await db.collection('devices').doc(deviceId).set(deviceData);
        generatedDevices.push({ deviceId, serialNumber, activationCode, secretKey });
    }

    await db.collection('logs').add({
        timestamp: FieldValue.serverTimestamp(),
        event: 'DEVICE_GENERATED',
        uid: request.auth.uid,
        ipAddress: request.rawRequest?.ip || 'unknown',
        details: { batchId, hardwareModel, quantity }
    });

    return {
        success: true,
        count: generatedDevices.length,
        devices: generatedDevices
    };
});

/**
 * blacklistDevice
 * Callable function for Admins to blacklist a device.
 */
export const blacklistDevice = functions.https.onCall(async (request) => {
    const data = request.data as { deviceId?: string };
    if (!request.auth || !['admin', 'superadmin'].includes(request.auth.token.role)) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can blacklist devices.');
    }

    const deviceId = data.deviceId;
    if (!deviceId) throw new functions.https.HttpsError('invalid-argument', 'deviceId is required.');

    await db.collection('devices').doc(deviceId).update({
        isBlacklisted: true,
        updatedAt: FieldValue.serverTimestamp(),
        status: 'blacklisted'
    });

    await db.collection('logs').add({
        timestamp: FieldValue.serverTimestamp(),
        event: 'DEVICE_BLACKLISTED',
        deviceId,
        uid: request.auth.uid,
        ipAddress: request.rawRequest?.ip || 'unknown'
    });

    return { success: true };
});

export const transferDevice = functions.https.onCall(async (request) => {
    const data = request.data as { deviceId?: string; newOwnerUid?: string };
    if (!request.auth || !['admin', 'superadmin'].includes(request.auth.token.role)) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can transfer ownership.');
    }

    const { deviceId, newOwnerUid } = data;
    if (!deviceId || !newOwnerUid) {
        throw new functions.https.HttpsError('invalid-argument', 'deviceId and newOwnerUid are required.');
    }

    await db.collection('devices').doc(deviceId).update({
        ownerUid: newOwnerUid,
        transferredAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
        status: 'active'
    });

    return { success: true };
});

export const resetDevice = functions.https.onCall(async (request) => {
    const data = request.data as { deviceId?: string };
    if (!request.auth || !['admin', 'superadmin'].includes(request.auth.token.role)) {
        throw new functions.https.HttpsError('permission-denied', 'Only admins can reset devices.');
    }

    const { deviceId } = data;
    if (!deviceId) {
        throw new functions.https.HttpsError('invalid-argument', 'deviceId is required.');
    }

    await db.collection('devices').doc(deviceId).update({
        ownerUid: null,
        status: 'inactive',
        licenseStatus: 'inactive',
        activatedAt: null,
        updatedAt: FieldValue.serverTimestamp()
    });

    return { success: true };
});
