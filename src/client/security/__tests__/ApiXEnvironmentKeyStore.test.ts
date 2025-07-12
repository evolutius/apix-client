import { ApiXEnvironmentKeyStore } from '../ApiXEnvironmentKeyStore';

describe('ApiXEnvironmentKeyStore', () => {
  let keyStore: ApiXEnvironmentKeyStore;

  beforeEach(() => {
    keyStore = new ApiXEnvironmentKeyStore();
  });

  it('should retrieve API key from environment variable', () => {
    process.env.API_X_API_KEY = 'testApiKey';
    expect(keyStore.getApiKey()).toBe('testApiKey');
  });

  it('should throw an error if API key environment variable is not set', () => {
    delete process.env.API_X_API_KEY;
    expect(() => keyStore.getApiKey()).toThrow('API_X_API_KEY environment variable is not set.');
  });

  it('should retrieve application key from environment variable', () => {
    process.env.API_X_APP_KEY = 'testAppKey';
    expect(keyStore.getAppKey()).toBe('testAppKey');
  });

  it('should throw an error if application key environment variable is not set', () => {
    delete process.env.API_X_APP_KEY;
    expect(() => keyStore.getAppKey()).toThrow('API_X_APP_KEY environment variable is not set.');
  });

  it('should retrieve both API key and application key from environment variables', () => {
    process.env.API_X_API_KEY = 'testApiKey';
    process.env.API_X_APP_KEY = 'testAppKey';
    expect(keyStore.getKeys()).toEqual({
      apiKey: 'testApiKey',
      appKey: 'testAppKey'
    });
  });

  it('should throw an error if both API key and application key environment variables are not set', () => {
    delete process.env.API_X_API_KEY;
    delete process.env.API_X_APP_KEY;
    expect(() => keyStore.getKeys()).toThrow('API_X_API_KEY environment variable is not set.');
  });

  it('should throw an error if both API key and application key environment variables are not set on startup test', () => {
    delete process.env.API_X_API_KEY;
    process.env.API_X_APP_KEY = 'testAppKey';
    expect(() => keyStore.startupTest()).toThrow('API_X_API_KEY environment variable is not set.');

    process.env.API_X_API_KEY = 'testApiKey';
    delete process.env.API_X_APP_KEY;
    expect(() => keyStore.startupTest()).toThrow('API_X_APP_KEY environment variable is not set.');
  });
});