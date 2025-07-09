
/**
 * A service that uses a key to encrypt and decrypt data.
 */
export interface SymmetricEncryptionService {

  /**
   * Encrypts the given data using the provided key.
   * 
   * @param data The data to encrypt.
   * @param key The key to use for encryption.
   * @returns The encrypted data as a string.
   */
  encrypt(data: string, key: string): string;

  /**
   * Decrypts the given data using the provided key.
   * 
   * @param encryptedData The data to decrypt.
   * @param key The key to use for decryption.
   * @returns The decrypted data as a string.
   */
  decrypt(encryptedData: string, key: string): string;
}
