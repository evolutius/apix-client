import { ApiXErrorResponse } from "../types/ApiXErrorResponse";

/**
 * Returns an ApiXError instance for a given error ID.
 * @param id The error ID.
 * @param message An optional error message.
 * @returns An instance of ApiXError or a subclass.
 */
export const errorForResponse = (response: ApiXErrorResponse): ApiXError => {
  const {
    message,  // Deprecated message field for backward compatibility
    error = {
      id: 'ApiXError',  // Default for backward compatibility (pre-API-X v2.1.x)
      message: message  // Default message if not provided or if API-X version is older than v2.1.x
    }
  } = response;
  switch (error.id) {
    case 'unauthorizedApp':
      return new ApiXUnauthorizedAppError(error.message);
    case 'unauthorizedRequest':
      return new ApiXUnauthorizedRequestError(error.message);
    case 'invalidRequest':
      return new ApiXInvalidRequestError(error.message);
    case 'missingRequiredHeaders':
      return new ApiXMissingRequiredHeadersError(error.message);
    case 'missingJsonBody':
      return new ApiXMissingJsonBodyError(error.message);
    case 'invalidJsonBody':
      return new ApiXInvalidJsonBodyError(error.message);
    case 'insecureProtocol':
      return new ApiXInsecureProtocolError(error.message);
    default:
      return new ApiXError(error.id, error.message);
  }
};

/**
 * An error object that can be returned by an API-X endpoint.
 */
export class ApiXError extends Error {
  /**
   * The error ID.
   */
  public readonly id: string;

  /**
   * Creates a new instance of an API-X Error.
   * @param id The error ID.
   */
  public constructor(id: string, message?: string) {
    super(message);
    this.id = id;
    this.name = id;
  }
}

/**
 * Error class for unauthorized app errors.
 * This error is thrown when an app is not authorized to make a request.
 */
export class ApiXUnauthorizedAppError extends ApiXError {
  public constructor(message?: string) {
    super('unauthorizedApp', message);
  }
}

/**
 * Error class for unauthorized request errors.
 * This error is thrown when a request is not authorized.
 */
export class ApiXUnauthorizedRequestError extends ApiXError {
  public constructor(message?: string) {
    super('unauthorizedRequest', message);
  }
}

/**
 * Error class for invalid request errors.
 * This error is thrown when a request is invalid.
 */
export class ApiXInvalidRequestError extends ApiXError {
  public constructor(message?: string) {
    super('invalidRequest', message);
  }
}

/**
 * Error class for missing required headers.
 * This error is thrown when required headers are missing from a request.
 */
export class ApiXMissingRequiredHeadersError extends ApiXError {
  public constructor(message?: string) {
    super('missingRequiredHeaders', message);
  }
}

/**
 * Error class for missing JSON body.
 * This error is thrown when a request that requires a JSON body does not have one.
 */
export class ApiXMissingJsonBodyError extends ApiXError {
  public constructor(message?: string) {
    super('missingJsonBody', message);
  }
}

/**
 * Error class for invalid JSON body.
 * This error is thrown when a request's JSON body is invalid or cannot be parsed.
 */
export class ApiXInvalidJsonBodyError extends ApiXError {
  public constructor(message?: string) {
    super('invalidJsonBody', message);
  }
}

/**
 * Error class for insecure protocol errors.
 * This error is thrown when a request is made over an insecure protocol (e.g., HTTP instead of HTTPS).
 */
export class ApiXInsecureProtocolError extends ApiXError {
  public constructor(message?: string) {
    super('insecureProtocol', message);
  }
}
