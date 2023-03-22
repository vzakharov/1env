import { ensure } from "vovas-utils";
import { decrypt } from "./encryption";

export function loadSecrets() {

  // 1. Reads the (secret) process.env.ONE_ENV_KEY variable for the decryption key
  // 2. Reads the (non-secret) process.env.ONE_ENV_ENCRYPTED variable for an encrypted string concealing the JSON with all our secrets
  // 3. Decrypts the string and parses it, assigning the resulting object to process.env

  const key = ensure(process.env.ONE_ENV_KEY);
  const encrypted = ensure(process.env.ONE_ENV_ENCRYPTED);
  const authTag = ensure(process.env.ONE_ENV_AUTH_TAG);
  const decrypted = decrypt(encrypted, key);
  const parsed = JSON.parse(decrypted);
  Object.assign(process.env, parsed);

};