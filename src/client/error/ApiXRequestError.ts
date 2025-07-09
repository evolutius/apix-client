
/**
 * ApiXRequestError class for handling API-X request errors.
 */

export class ApiXRequestError extends Error {
  /**
   * Creates a new instance of an API-X Request Error.
   * @param message Optional error message.
   */
  public constructor(message?: string) {
    super(message);
    this.name = 'ApiXRequestError';
  }
}
