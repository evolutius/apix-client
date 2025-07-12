
/**
 * An interface that defines the keys used in the API-X key store.
 */
export interface ApiXKeys {
  /**
   * The API key for the application.
   */
  readonly apiKey: string;

  /**
   * The application key for the API.
   */
  readonly appKey: string;
}

/**
 * An interface for an object that securely stores API keys and application keys.
 */
export interface ApiXKeyStore {
  /**
   * Retrieves the API key for the given application.
   */
  getApiKey(): string | Promise<string>;

  /**
   * Retrieves the application key for the given API key.
   */
  getAppKey(): string | Promise<string>;

  /**
   * Retrieves both API and application keys as an object.
   */
  getKeys(): ApiXKeys | Promise<ApiXKeys>;
};
