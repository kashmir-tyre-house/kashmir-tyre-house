const HASH_ALGORITHM = "PBKDF2";
const HASH_ITERATIONS = 210_000;
const HASH_KEY_LENGTH_BYTES = 32;
const HASH_SEPARATOR = "$";
const HASH_VERSION = "pbkdf2-sha256";

export async function hashPassword(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await derivePasswordHash(password, salt);

  return [
    HASH_VERSION,
    HASH_ITERATIONS,
    encodeBase64Url(salt),
    encodeBase64Url(hash)
  ].join(HASH_SEPARATOR);
}

export async function verifyPassword(password: string, passwordHash: string) {
  const [version, iterations, salt, expectedHash] =
    passwordHash.split(HASH_SEPARATOR);

  if (version !== HASH_VERSION || Number(iterations) !== HASH_ITERATIONS) {
    return false;
  }

  if (!salt || !expectedHash) {
    return false;
  }

  const actualHash = await derivePasswordHash(password, decodeBase64Url(salt));

  return timingSafeEqual(encodeBase64Url(actualHash), expectedHash);
}

async function derivePasswordHash(password: string, salt: Uint8Array) {
  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    HASH_ALGORITHM,
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits(
    {
      name: HASH_ALGORITHM,
      hash: "SHA-256",
      iterations: HASH_ITERATIONS,
      salt: toArrayBuffer(salt)
    },
    passwordKey,
    HASH_KEY_LENGTH_BYTES * 8
  );

  return new Uint8Array(bits);
}

function encodeBase64Url(bytes: Uint8Array) {
  const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join("");

  return btoa(binary)
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}

function decodeBase64Url(value: string) {
  const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
  const binary = atob(padded);

  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

function toArrayBuffer(bytes: Uint8Array) {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);

  return buffer;
}

function timingSafeEqual(left: string, right: string) {
  if (left.length !== right.length) {
    return false;
  }

  let result = 0;

  for (let index = 0; index < left.length; index += 1) {
    result |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }

  return result === 0;
}
