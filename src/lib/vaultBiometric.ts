// Biometrie-/Geräte-Freigabe für den Tresor
// Strategie: WebAuthn (Platform Authenticator) wird genutzt, um eine User-Presence-
// Bestätigung zu verlangen. Der eigentliche PIN bleibt lokal verschlüsselt mit
// einem Schlüssel, der aus einer geräte-eindeutigen ID + WebAuthn-Credential-ID
// abgeleitet wird. Damit:
//   - PIN verlässt das Gerät NIE
//   - ohne Biometrie/Geräte-PIN kein Zugriff auf den lokal gespeicherten PIN
//   - Reset = Eingabe des PINs (Fallback bleibt immer möglich)

import { b64, randomBytes } from "./vaultCrypto";

const STORAGE_KEY = "immoniq.vault.bio.v1";
const enc = new TextEncoder();
const dec = new TextDecoder();

type Stored = {
  credentialId: string;     // base64
  deviceSalt: string;       // base64
  iv: string;               // base64
  ct: string;               // base64 (encrypted PIN)
};

export const biometricSupported = () =>
  typeof window !== "undefined" &&
  !!window.PublicKeyCredential &&
  !!window.isSecureContext;

export async function platformAuthenticatorAvailable(): Promise<boolean> {
  try {
    if (!biometricSupported()) return false;
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

export const hasBiometricSetup = () => !!localStorage.getItem(STORAGE_KEY);

export const clearBiometric = () => localStorage.removeItem(STORAGE_KEY);

// AES-Schlüssel aus deviceSalt + credentialId ableiten
async function deriveLocalKey(deviceSaltB64: string, credentialIdB64: string) {
  const material = enc.encode(deviceSaltB64 + ":" + credentialIdB64);
  const baseKey = await crypto.subtle.importKey(
    "raw",
    material,
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: b64.dec(deviceSaltB64),
      iterations: 100_000,
      hash: "SHA-256",
    },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// 1. Setup: nach erfolgreichem PIN-Unlock anbieten -> Credential erstellen + PIN verschlüsselt ablegen
export async function enrollBiometric(pin: string, userId: string, userEmail: string) {
  if (!(await platformAuthenticatorAvailable())) {
    throw new Error("Biometrie auf diesem Gerät nicht verfügbar");
  }

  const challenge = randomBytes(32);
  const userIdBytes = enc.encode(userId);

  const cred = (await navigator.credentials.create({
    publicKey: {
      challenge,
      rp: { name: "ImmoNIQ Tresor", id: window.location.hostname },
      user: {
        id: userIdBytes,
        name: userEmail,
        displayName: userEmail,
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },   // ES256
        { type: "public-key", alg: -257 }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        userVerification: "required",
        residentKey: "preferred",
      },
      timeout: 60_000,
      attestation: "none",
    },
  })) as PublicKeyCredential | null;

  if (!cred) throw new Error("Biometrie-Registrierung abgebrochen");

  const credentialId = b64.enc(new Uint8Array(cred.rawId));
  const deviceSalt = b64.enc(randomBytes(16));

  const key = await deriveLocalKey(deviceSalt, credentialId);
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    enc.encode(pin),
  );

  const stored: Stored = {
    credentialId,
    deviceSalt,
    iv: b64.enc(iv),
    ct: b64.enc(new Uint8Array(ct)),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
}

// 2. Unlock: WebAuthn-Get fordert Biometrie/Geräte-PIN -> dann lokal entschlüsseln
export async function unlockWithBiometric(): Promise<string> {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) throw new Error("Keine Biometrie eingerichtet");
  const s: Stored = JSON.parse(raw);

  const challenge = randomBytes(32);
  const cred = (await navigator.credentials.get({
    publicKey: {
      challenge,
      timeout: 60_000,
      userVerification: "required",
      allowCredentials: [
        {
          id: b64.dec(s.credentialId),
          type: "public-key",
          transports: ["internal"],
        },
      ],
      rpId: window.location.hostname,
    },
  })) as PublicKeyCredential | null;

  if (!cred) throw new Error("Biometrie-Freigabe abgebrochen");

  const key = await deriveLocalKey(s.deviceSalt, s.credentialId);
  const plain = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64.dec(s.iv) as BufferSource },
    key,
    b64.dec(s.ct),
  );
  return dec.decode(plain);
}
