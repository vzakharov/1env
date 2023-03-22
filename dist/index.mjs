import crypto from 'crypto';
import fs from 'fs';
import { ensure } from 'vovas-utils';

function encrypt(plain, password) {
  const cipher = crypto.createCipheriv("aes-256-gcm", createKey(password), Buffer.alloc(16, 0));
  let encrypted = cipher.update(plain, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return `${encrypted}_${authTag}`;
}
function decrypt(encrypted_authTag, password) {
  const [encrypted, authTag] = encrypted_authTag.split("_");
  const decipher = crypto.createDecipheriv("aes-256-gcm", createKey(password), Buffer.alloc(16, 0));
  decipher.setAuthTag(Buffer.from(authTag, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
function createKey(password) {
  return crypto.createHash("sha256").update(password).digest();
}

function encryptSecrets(filename = ".secrets.json") {
  const secretsFilename = `${process.cwd()}/${filename}`;
  if (!fs.existsSync(secretsFilename)) {
    console.log(`\x1B[33mWarning: no ${secretsFilename} file found, skipping encryption\x1B[0m`);
    return;
  }
  const gitIgnoreFilename = `${process.cwd()}/.gitignore`;
  if (!fs.existsSync(gitIgnoreFilename)) {
    throw new Error(`${secretsFilename} has to be git-ignored, but no ${gitIgnoreFilename} file found`);
  }
  const gitIgnores = fs.readFileSync(gitIgnoreFilename, "utf8").split("\n");
  if (!gitIgnores.includes(filename)) {
    throw new Error(`${secretsFilename} has to be git-ignored, but it is not in ${gitIgnoreFilename}`);
  }
  const secrets = JSON.parse(fs.readFileSync(secretsFilename, "utf8"));
  const key = ensure(process.env.ONE_ENV_KEY);
  const encrypted = encrypt(JSON.stringify(secrets), key);
  if (process.env.ONE_ENV_ENCRYPTED !== encrypted) {
    throw new Error(`1env environment variables are not set or outdated, please update as follows:

\x1B[33mONE_ENV_ENCRYPTED=${encrypted}\x1B[0m`);
  }
  return encrypted;
}

function loadEnvs() {
  const key = ensure(process.env.ONE_ENV_KEY);
  const encrypted = ensure(process.env.ONE_ENV_ENCRYPTED);
  ensure(process.env.ONE_ENV_AUTH_TAG);
  const decrypted = decrypt(encrypted, key);
  const parsed = JSON.parse(decrypted);
  Object.assign(process.env, parsed);
}

export { decrypt, encrypt, encryptSecrets, loadEnvs };
