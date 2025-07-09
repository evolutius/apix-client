import { ApiXEncryptedKeyStore } from '../ApiXEncryptedKeyStore';
import { ApiXSymmetricEncryptionService } from '../ApiXSymmetricEncryptionService';

describe('ApiXEncryptedKeyStore', () => {
  const mockEncryptionService = new ApiXSymmetricEncryptionService('fast');
  const mockKeyProvider = {
    getKey: jest.fn().mockReturnValue('testKey12345678901234567890'), // 32 bytes key
  };
  const keyStore = new ApiXEncryptedKeyStore(mockEncryptionService, mockKeyProvider, 'testApiKey', 'testAppKey');

  it('should retrieve the stored keys', () => {
    expect(keyStore.getApiKey()).toBe('testApiKey');
    expect(keyStore.getAppKey()).toBe('testAppKey');
  });

  it('should contain encrypted keys', () => {
    const encryptedData = keyStore['encryptedKeys'];
    expect(encryptedData).toBeDefined();

    const decryptedData = mockEncryptionService.decrypt(encryptedData, mockKeyProvider.getKey());
    const keys = JSON.parse(decryptedData);
    expect(keys.apiKey).toBe('testApiKey');
    expect(keys.appKey).toBe('testAppKey');
  });
});
