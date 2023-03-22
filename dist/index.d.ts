declare function encrypt(plain: string, password: string): string;
declare function decrypt(encrypted_authTag: string, password: string): string;

declare function encryptSecrets(filename?: string): string | undefined;

declare function loadEnvs(): void;

export { decrypt, encrypt, encryptSecrets, loadEnvs };
