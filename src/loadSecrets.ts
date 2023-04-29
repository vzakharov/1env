import { ensure } from "vovas-utils";
import { EncryptedDataJson, decrypt } from "./encryption";

export type LoadSecretsOptions = {
  overrideExisting?: boolean
}

export function loadSecrets({
  overrideExisting
}: LoadSecretsOptions = {}) {

  // 1. Reads the (secret) process.env.ONE_ENV_SECRET variable for the decryption key
  // 2. Reads the (non-secret) process.env.ONE_ENV_ENCRYPTED variable for an encrypted string concealing the JSON with all our secrets
  // 3. Decrypts the string and parses it, assigning the resulting object to process.env

  const key = ensure(process.env.ONE_ENV_SECRET);
  const encrypted = ensure(process.env.ONE_ENV_ENCRYPTED) as EncryptedDataJson;
  const decrypted = decrypt(encrypted, key);
  const parsed = JSON.parse(decrypted);
  if ( overrideExisting )
    Object.assign(process.env, parsed)
  else
    Object.assign(process.env, Object.fromEntries(Object.entries(parsed).filter(([ key ]) => !process.env[key])));

};