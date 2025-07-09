import { ApiXSymmetricEncryptionService } from '../ApiXSymmetricEncryptionService';

describe('ApiXSymmetricEncryptionService', () => {
  it('should encrypt and decrypt data using fast algorithm', () => {
    const encryptionService = new ApiXSymmetricEncryptionService('fast');
    const key = 'testKey12345678901234567890'; // 32 bytes key
    const data = 'Hello, World!';
    
    const encryptedData = encryptionService.encrypt(data, key);
    const decryptedData = encryptionService.decrypt(encryptedData, key);
    
    expect(decryptedData).toBe(data);
  });

  it('should encrypt and decrypt data using balanced algorithm', () => {
    const encryptionService = new ApiXSymmetricEncryptionService('balanced');
    const key = 'testKey12345678901234567890'; // 32 bytes key
    const data = 'Hello, World!';

    const encryptedData = encryptionService.encrypt(data, key);
    const decryptedData = encryptionService.decrypt(encryptedData, key);

    expect(decryptedData).toBe(data);
  });


  it('should encrypt and decrypt data using secure algorithm', () => {
    const encryptionService = new ApiXSymmetricEncryptionService('secure');
    const key = 'testKey12345678901234567890'; // 32 bytes key
    const data = 'Hello, World!';

    const encryptedData = encryptionService.encrypt(data, key);
    const decryptedData = encryptionService.decrypt(encryptedData, key);

    expect(decryptedData).toBe(data);
  });

  it('should not decrypt data with incorrect key', () => {
    const encryptionService = new ApiXSymmetricEncryptionService('fast');
    const key = 'testKey12345678901234567890'; // 32 bytes key
    const data = 'Hello, World!';
    const encryptedData = encryptionService.encrypt(data, key);

    const wrongKey = 'wrongKey12345678901234567890'; // 32 bytes key
    expect(() => {
      encryptionService.decrypt(encryptedData, wrongKey);
    }).toThrow();
  });

  it('should throw an error for invalid algorithm', () => {
    expect(() => new ApiXSymmetricEncryptionService('invalid' as any)).toThrow('Invalid symmetric encryption algorithm specified.');
  });
});