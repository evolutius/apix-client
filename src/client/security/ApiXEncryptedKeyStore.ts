import { ApiXKeyStore } from './ApiXKeyStore';
import { KeyProvider } from './KeyProvider';
import { SymmetricEncryptionService } from './SymmetricEncryptionService';

/**
 * An encrypted key store for securely storing API keys and application keys.
 * 
 * This class uses a symmetric encryption service and key provider to encrypt and decrypt.
 * To ensure security, it is recommended to implement a good `KeyProvider`
 * that provides a secure key for the current session and isn't easily guessable
 * or accessible.
 */
export class ApiXEncryptedKeyStore implements ApiXKeyStore {

  private readonly encryptedKeys: string;

  public constructor(
    private readonly encryptionService: SymmetricEncryptionService,
    private readonly keyProvider: KeyProvider,
    apiKey: string,
    appKey: string
  ) {
    this.encryptedKeys = this.encryptionService.encrypt(
      JSON.stringify({
        apiKey,
        appKey
      }),
      this.keyProvider.getKey()
    );
  }

  public getApiKey(): string {
    const key = this.keyProvider.getKey();
    const decryptedJsonObject = JSON.parse(
        this.encryptionService.decrypt(this.encryptedKeys, key)
      );
      return decryptedJsonObject.apiKey;
  }

  public getAppKey(): string {
    const key = this.keyProvider.getKey();
    const decryptedJsonObject = JSON.parse(
      this.encryptionService.decrypt(this.encryptedKeys, key)
    );
    return decryptedJsonObject.appKey;
  }
}
