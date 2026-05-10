import { webcrypto } from "node:crypto";

const cryptoApi = globalThis.crypto ?? webcrypto;

const HASH_ALGORITHM = "PBKDF2";
const HASH_ITERATIONS = 210_000;
const HASH_KEY_LENGTH_BYTES = 32;
const HASH_SEPARATOR = "$";
const HASH_VERSION = "pbkdf2-sha256";
const password = process.argv[2];

if (!password) {
  console.error("Usage: npm run hash-password -w @kth/admin -- <password>");
  process.exit(1);
}

const salt = cryptoApi.getRandomValues(new Uint8Array(16));
const passwordKey = await cryptoApi.subtle.importKey(
  "raw",
  new TextEncoder().encode(password),
  HASH_ALGORITHM,
  false,
  ["deriveBits"],
);
const bits = await cryptoApi.subtle.deriveBits(
  {
    name: HASH_ALGORITHM,
    hash: "SHA-256",
    iterations: HASH_ITERATIONS,
    salt,
  },
  passwordKey,
  HASH_KEY_LENGTH_BYTES * 8,
);
const hash = new Uint8Array(bits);

console.log(
  [
    HASH_VERSION,
    HASH_ITERATIONS,
    encodeBase64Url(salt),
    encodeBase64Url(hash),
  ].join(HASH_SEPARATOR),
);

function encodeBase64Url(bytes) {
  return Buffer.from(bytes)
    .toString("base64")
    .replaceAll("+", "-")
    .replaceAll("/", "_")
    .replace(/=+$/, "");
}
