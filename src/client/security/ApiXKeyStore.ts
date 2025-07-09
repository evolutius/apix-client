
/**
 * An interface for an object that securely stores API keys and application keys.
 */
export interface ApiXKeyStore {
  /**
   * Retrieves the API key for the given application.
   */
  getApiKey(): string;

  /**
   * Retrieves the application key for the given API key.
   */
  getAppKey(): string;
};
