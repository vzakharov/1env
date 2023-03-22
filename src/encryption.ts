import crypto from 'crypto';

export function encrypt(plain: string, password: string) {
  const cipher = crypto.createCipheriv('aes-256-gcm', createKey(password), Buffer.alloc(16, 0));
  let encrypted = cipher.update(plain, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${encrypted}_${authTag}`;
}

export function decrypt(encrypted_authTag: string, password: string) {
  const [ encrypted, authTag ] = encrypted_authTag.split('_');
  const decipher = crypto.createDecipheriv('aes-256-gcm', createKey(password), Buffer.alloc(16, 0));
  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
};

function createKey(password: string) {
  return crypto.createHash('sha256').update(password).digest();
}