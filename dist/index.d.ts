declare function encrypt(plain: string, password: string, updateIv?: boolean): string;
declare function decrypt(encrypted_authTag_iv: string, password: string): string;

declare function encryptSecrets(filename?: string): string | undefined;

declare function loadSecrets(): void;

export { decrypt, encrypt, encryptSecrets, loadSecrets };
