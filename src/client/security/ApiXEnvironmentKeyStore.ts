import { ApiXKeyStore } from './ApiXKeyStore';


/**
 * An implementation of `ApiXKeyStore` that retrieves API keys and application keys
 * from environment variables.
 * 
 * This is suitable for backend environments where environment variables can be securely
 * managed. It is not recommended for frontend applications due to security concerns.
 * 
 * The API key should be stored in the `API_X_API_KEY` environment variable,
 * and the application key should be stored in the `API_X_APP_KEY` environment variable.
 */
export class ApiXEnvironmentKeyStore implements ApiXKeyStore {

  /**
   * A singleton instance of the `ApiXEnvironmentKeyStore`.
   * This is useful for ensuring that the same key store instance is used throughout the application.
   */
  public static readonly shared = new ApiXEnvironmentKeyStore();

  /**
   * Retrieves the API key from the environment variable.
   */
  public getApiKey(): string {
    const apiKey = process.env.API_X_API_KEY;
    if (!apiKey) {
      throw new Error('API_X_API_KEY environment variable is not set.');
    }
    return apiKey;
  }

  /**
   * Retrieves the application key from the environment variable.
   */
  public getAppKey(): string {
    const appKey = process.env.API_X_APP_KEY;
    if (!appKey) {
      throw new Error('API_X_APP_KEY environment variable is not set.');
    }
    return appKey;
  }

  /**
   * Retrieves both the API key and application key from the environment variables.
   */
  public getKeys(): { apiKey: string; appKey: string } {
    return {
      apiKey: this.getApiKey(),
      appKey: this.getAppKey()
    };
  }

  /**
   * A method to perform any startup tests or initializations.
   * This can be used to verify that the environment variables are set correctly.
   */
  public startupTest(): void {
    this.getApiKey();
    this.getAppKey();
  }
}
