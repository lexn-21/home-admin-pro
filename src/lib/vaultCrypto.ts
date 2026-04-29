// Zero-Knowledge Crypto für ImmoNIQ-Tresor
// AES-GCM 256 mit Schlüssel abgeleitet via PBKDF2-SHA256 (250.000 Iterationen) aus PIN.
// Der PIN verlässt niemals das Gerät. Der Server speichert nur einen Verifier-Ciphertext.

const ITER = 250_000;
const KEY_LEN = 256;
const VERIFIER_PLAINTEXT = "immoniq-vault-v1";

const enc = new TextEncoder();
const dec = new TextDecoder();

export const b64 = {
  enc: (buf: ArrayBuffer | Uint8Array) => {
    const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
    let s = "";
    for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
    return btoa(s);
  },
  dec: (s: string) => {
    const bin = atob(s);
    const out = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
    return out;
  },
};

export const randomBytes = (n: number) => crypto.getRandomValues(new Uint8Array(n));

export async function deriveKey(pin: string, saltB64: string): Promise<CryptoKey> {
  const salt = b64.dec(saltB64);
  const baseKey = await crypto.subtle.importKey(
    "raw", enc.encode(pin), "PBKDF2", false, ["deriveKey"]
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt, iterations: ITER, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: KEY_LEN },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptBytes(key: CryptoKey, data: ArrayBuffer) {
  const iv = randomBytes(12);
  const ct = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, data);
  return { iv: b64.enc(iv), ct };
}

export async function decryptBytes(key: CryptoKey, ivB64: string, ct: ArrayBuffer) {
  const iv = b64.dec(ivB64);
  return crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
}

// PIN setup: produce salt + verifier ciphertext
export async function buildVerifier(pin: string) {
  const salt = b64.enc(randomBytes(16));
  const key = await deriveKey(pin, salt);
  const { iv, ct } = await encryptBytes(key, enc.encode(VERIFIER_PLAINTEXT));
  return { pin_salt: salt, verifier_iv: iv, verifier_ct: b64.enc(ct) };
}

// Verify a PIN against stored verifier; returns derived key on success
export async function verifyPin(
  pin: string,
  saltB64: string,
  verIvB64: string,
  verCtB64: string,
): Promise<CryptoKey | null> {
  try {
    const key = await deriveKey(pin, saltB64);
    const plain = await decryptBytes(key, verIvB64, b64.dec(verCtB64));
    if (dec.decode(plain) === VERIFIER_PLAINTEXT) return key;
    return null;
  } catch {
    return null;
  }
}
