import { ApiXResponseData } from './ApiXResponse';

/**
 * Information about an error returned by the API-X service.
 */
export interface ApiXErrorInfo {
  /**
   * The unique identifier for the error.
   * This can be used to reference the error in documentation or support requests.
   */
  readonly id: string;

  /**
   * A human-readable description of the error.
   */
  readonly message: string;
}

/**
 * An interface representing an error returned by the API-X service.
 */
export interface ApiXErrorResponse extends ApiXResponseData {

  /**
   * A Boolean value indicating whether the request was successful.
   * This will always be `false` for an error response.
   */
  readonly success: false;

  /**
   * An optional message providing additional information about the error.
   * 
   * @deprecated
   * This field is deprecated and will be removed in future versions. Use the `error` object instead.
   */
  readonly message?: string;

  /**
   * The error object containing details about the error.
   * 
   * Available after API-X v2.1.x.
   */
  readonly error: ApiXErrorInfo;
}

/**
 * Type guard to check if the given data is an `ApiXErrorResponse`.
 * 
 * @param data The data to check.
 * @returns `true` if the data is an `ApiXErrorResponse`, otherwise `false`.
 */
export const isApiXErrorResponse = (data: unknown): data is ApiXErrorResponse => {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  const response = data as ApiXErrorResponse;
  return (
    typeof response.success === 'boolean' &&
    response.success === false &&
    typeof response.error === 'object' &&
    response.error !== null &&
    typeof response.error.id === 'string' &&
    typeof response.error.message === 'string'
  );
}
