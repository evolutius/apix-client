
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

/**
 * Type guard to determine if an error is an instance of ApiXRequestError.
 * @param error The error to check.
 * @returns True if the error is an ApiXRequestError, false otherwise.
 */
export function isApiXRequestError(error: unknown): error is ApiXRequestError {
  return (
    error instanceof ApiXRequestError && error.constructor === ApiXRequestError
  );
}
