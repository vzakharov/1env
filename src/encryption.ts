import crypto from 'crypto';

export function encrypt(plain: string, password: string, updateIv = false) {
  const ivString = process.env.ONE_ENV_ENCRYPTED?.split('_')[2];
  const iv = ( ivString && !updateIv ) ? Buffer.from(ivString, 'hex') : crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', createKey(password), iv);
  let encrypted = cipher.update(plain, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${encrypted}_${authTag}_${iv.toString('hex')}`;
}

export function decrypt(encrypted_authTag_iv: string, password: string) {
  const [ encrypted, authTag, iv ] = encrypted_authTag_iv.split('_');
  const decipher = crypto.createDecipheriv('aes-256-gcm', createKey(password), Buffer.from(iv, 'hex'));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

function createKey(password: string) {
  return crypto.createHash('sha256').update(password).digest();
}