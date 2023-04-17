'use strict';

const crypto = require('crypto');
const fs = require('fs');
const vovasUtils = require('vovas-utils');

function encrypt(plain, password, updateIv = false) {
  const encryptedData = (() => {
    try {
      return JSON.parse(process.env.ONE_ENV_ENCRYPTED);
    } catch (e) {
      return {};
    }
  })();
  const ivString = encryptedData.iv;
  const iv = ivString && !updateIv ? Buffer.from(ivString, "hex") : crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", createKey(password), iv);
  let encrypted = cipher.update(plain, "utf8", "hex");
  encrypted += cipher.final("hex");
  const authTag = cipher.getAuthTag().toString("hex");
  return JSON.stringify({ encrypted, authTag, iv: iv.toString("hex") });
}
function decrypt(encryptedDataString, password) {
  const { encrypted, authTag, iv } = JSON.parse(encryptedDataString);
  const decipher = crypto.createDecipheriv("aes-256-gcm", createKey(password), Buffer.from(iv, "hex"));
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
  const key = vovasUtils.$if(process.env.ONE_ENV_SECRET, vovasUtils.is.defined, vovasUtils.give.itself).else(() => {
    const key2 = crypto.randomBytes(32).toString("hex");
    console.log(`\x1B[33mONE_ENV_SECRET=${key2}\x1B[0m`);
    console.log(`\x1B[31mSet the ONE_ENV_SECRET environment variable to the above value, then run the command again. IMPORTANT: THIS VALUE IS SECRET AND SHOULD NOT BE SHARED\x1B[0m`);
    throw new Error(`ONE_ENV_SECRET environment variable is not set`);
  });
  let encrypted = encrypt(JSON.stringify(secrets), key);
  if (process.env.ONE_ENV_ENCRYPTED !== encrypted) {
    encrypted = encrypt(JSON.stringify(secrets), key, true);
    console.log(`\x1B[33mONE_ENV_ENCRYPTED=${encrypted}\x1B[0m`);
    console.log(`\x1B[31mSet the ONE_ENV_ENCRYPTED environment variable to the above value, then run the command again. Note: this value is public and can be shared\x1B[0m`);
    throw new Error(`ONE_ENV_ENCRYPTED environment variable is not set`);
  }
  return encrypted;
}

function loadSecrets() {
  const key = vovasUtils.ensure(process.env.ONE_ENV_SECRET);
  const encrypted = vovasUtils.ensure(process.env.ONE_ENV_ENCRYPTED);
  const decrypted = decrypt(encrypted, key);
  const parsed = JSON.parse(decrypted);
  Object.assign(process.env, parsed);
}

exports.decrypt = decrypt;
exports.encrypt = encrypt;
exports.encryptSecrets = encryptSecrets;
exports.loadSecrets = loadSecrets;
