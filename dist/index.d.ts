type EncryptedData = {
    encrypted: string;
    authTag: string;
    iv: string;
};
type EncryptedDataJson = `{"encrypted":"${string}","authTag":"${string}","iv":"${string}"}`;
declare function encrypt(plain: string, password: string, updateIv?: boolean): EncryptedDataJson;
declare function decrypt(encryptedDataString: EncryptedDataJson, password: string): string;

declare function encryptSecrets(filename?: string): Promise<`{"encrypted":"${string}","authTag":"${string}","iv":"${string}"}` | undefined>;

type LoadSecretsOptions = {
    overrideExisting?: boolean;
};
declare function loadSecrets({ overrideExisting }?: LoadSecretsOptions): void;

export { EncryptedData, EncryptedDataJson, LoadSecretsOptions, decrypt, encrypt, encryptSecrets, loadSecrets };
