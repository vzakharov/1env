type EncryptedData = {
    encrypted: string;
    authTag: string;
    iv: string;
};
type EncryptedDataJson = `{"encrypted":"${string}","authTag":"${string}","iv":"${string}"}`;
declare function encrypt(plain: string, password: string, updateIv?: boolean): EncryptedDataJson;
declare function decrypt(encryptedDataString: EncryptedDataJson, password: string): string;

declare function encryptSecrets(filename?: string): `{"encrypted":"${string}","authTag":"${string}","iv":"${string}"}` | undefined;

declare function loadSecrets(): void;

export { EncryptedData, EncryptedDataJson, decrypt, encrypt, encryptSecrets, loadSecrets };
