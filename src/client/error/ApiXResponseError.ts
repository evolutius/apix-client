import { ApiXErrorResponse } from "../types/ApiXErrorResponse";
import { ApiXResponse } from "../types";

/**
 * Returns an ApiXError instance for a given error ID.
 * @param id The error ID.
 * @param message An optional error message.
 * @returns An instance of ApiXError or a subclass.
 */
export const errorForResponse = (response: ApiXResponse<ApiXErrorResponse>): ApiXResponseError => {
  const responseData = response.data;

  if (!responseData || typeof responseData !== 'object') {
    throw new ApiXResponseError('unknownError', response.statusCode);
  }

  const {
    message,  // Deprecated message field for backward compatibility
    error = {
      id: 'ApiXResponseError',  // Default for backward compatibility (pre-API-X v2.1.x)
      message: message          // Default message if not provided or if API-X version is older than v2.1.x
    }
  } = responseData;

  switch (error.id) {
    case 'unauthorizedApp':
      return new ApiXResponseUnauthorizedAppError(response.statusCode, error.message);
    case 'unauthorizedRequest':
      return new ApiXResponseUnauthorizedRequestError(response.statusCode, error.message);
    case 'invalidRequest':
      return new ApiXResponseInvalidRequestError(response.statusCode, error.message);
    case 'missingRequiredHeaders':
      return new ApiXResponseMissingRequiredHeadersError(response.statusCode, error.message);
    case 'missingJsonBody':
      return new ApiXResponseMissingJsonBodyError(response.statusCode, error.message);
    case 'invalidJsonBody':
      return new ApiXResponseInvalidJsonBodyError(response.statusCode, error.message);
    case 'insecureProtocol':
      return new ApiXResponseInsecureProtocolError(response.statusCode, error.message);
    default:
      return new ApiXResponseError(error.id, response.statusCode, error.message);
  }
};

/**
 * Type guard to determine if an error is a specific API-X response error. This
 * function will return false for plain ApiXResponseError instances.
 * @param error The error to check.
 * @returns True if the error is a specific API-X response error, false otherwise.
 */
export function isSpecificApiXResponseError(error: unknown): error is ApiXResponseError {
  return error instanceof ApiXResponseUnauthorizedAppError ||
         error instanceof ApiXResponseUnauthorizedRequestError ||
         error instanceof ApiXResponseInvalidRequestError ||
         error instanceof ApiXResponseMissingRequiredHeadersError ||
         error instanceof ApiXResponseMissingJsonBodyError ||
         error instanceof ApiXResponseInvalidJsonBodyError ||
         error instanceof ApiXResponseInsecureProtocolError;
}

/**
 * Type guard to determine if an error is a plain ApiXResponseError.
 * This function will return true for any ApiXResponseError that is not a specific API-X response error.
 * @param error The error to check.
 * @returns True if the error is a plain ApiXResponseError, false otherwise.
 */
export function isPlainApiXResponseError(error: unknown): error is ApiXResponseError {
  return error instanceof ApiXResponseError && error.constructor === ApiXResponseError;
}

/**
 * An error object that can be returned by an API-X endpoint.
 */
export class ApiXResponseError extends Error {
  /**
   * The error ID.
   */
  public readonly id: string;

  /**
   * The HTTP status code associated with the error.
   * This is optional and can be used to provide additional context.
   */
  public readonly statusCode: number;

  /**
   * Creates a new instance of an API-X Error.
   * @param id The error ID.
   */
  public constructor(id: string, statusCode: number, message?: string) {
    super(message);
    this.id = id;
    this.name = id;
    this.statusCode = statusCode;
  }
}

/**
 * Error class for unauthorized app errors.
 * This error is thrown when an app is not authorized to make a request.
 */
export class ApiXResponseUnauthorizedAppError extends ApiXResponseError {
  public constructor(statusCode: number, message?: string) {
    super('unauthorizedApp', statusCode, message);
  }
}

/**
 * Error class for unauthorized request errors.
 * This error is thrown when a request is not authorized.
 */
export class ApiXResponseUnauthorizedRequestError extends ApiXResponseError {
  public constructor(statusCode: number, message?: string) {
    super('unauthorizedRequest', statusCode, message);
  }
}

/**
 * Error class for invalid request errors.
 * This error is thrown when a request is invalid.
 */
export class ApiXResponseInvalidRequestError extends ApiXResponseError {
  public constructor(statusCode: number, message?: string) {
    super('invalidRequest', statusCode, message);
  }
}

/**
 * Error class for missing required headers.
 * This error is thrown when required headers are missing from a request.
 */
export class ApiXResponseMissingRequiredHeadersError extends ApiXResponseError {
  public constructor(statusCode: number, message?: string) {
    super('missingRequiredHeaders', statusCode, message);
  }
}

/**
 * Error class for missing JSON body.
 * This error is thrown when a request that requires a JSON body does not have one.
 */
export class ApiXResponseMissingJsonBodyError extends ApiXResponseError {
  public constructor(statusCode: number, message?: string) {
    super('missingJsonBody', statusCode, message);
  }
}

/**
 * Error class for invalid JSON body.
 * This error is thrown when a request's JSON body is invalid or cannot be parsed.
 */
export class ApiXResponseInvalidJsonBodyError extends ApiXResponseError {
  public constructor(statusCode: number, message?: string) {
    super('invalidJsonBody', statusCode, message);
  }
}

/**
 * Error class for insecure protocol errors.
 * This error is thrown when a request is made over an insecure protocol (e.g., HTTP instead of HTTPS).
 */
export class ApiXResponseInsecureProtocolError extends ApiXResponseError {
  public constructor(statusCode: number, message?: string) {
    super('insecureProtocol', statusCode, message);
  }
}
