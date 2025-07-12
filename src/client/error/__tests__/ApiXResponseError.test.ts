import {
  errorForResponse,
  isSpecificApiXResponseError,
  isPlainApiXResponseError,
  ApiXResponseError,
  ApiXResponseUnauthorizedAppError,
  ApiXResponseUnauthorizedRequestError,
  ApiXResponseInvalidRequestError,
  ApiXResponseMissingRequiredHeadersError,
  ApiXResponseMissingJsonBodyError,
  ApiXResponseInvalidJsonBodyError,
  ApiXResponseInsecureProtocolError,
} from '../ApiXResponseError';
import { ApiXResponse } from '../../types';
import { ApiXErrorResponse } from '../../types/ApiXErrorResponse';

describe('ApiXResponseError', () => {
  describe('Type Guards', () => {
    it('should identify plain ApiXResponseError', () => {
      const error = new Error('Test error');
      expect(isPlainApiXResponseError(error)).toBe(false);
      
      const apiXError = new ApiXResponseError('testError', 400, 'Test API-X error');
      expect(isPlainApiXResponseError(apiXError)).toBe(true);

      const specificError = new ApiXResponseUnauthorizedAppError(401, 'Unauthorized app');
      expect(isPlainApiXResponseError(specificError)).toBe(false);
    });

    it('should identify specific ApiXResponseError', () => {
      const apiXUnauthorizedAppError = new ApiXResponseUnauthorizedAppError(401, 'Unauthorized app');
      expect(isSpecificApiXResponseError(apiXUnauthorizedAppError)).toBe(true);

      const apiXInvalidRequestError = new ApiXResponseInvalidRequestError(400, 'Invalid request');
      expect(isSpecificApiXResponseError(apiXInvalidRequestError)).toBe(true);

      const genericError = new Error('Generic error');
      expect(isSpecificApiXResponseError(genericError)).toBe(false);

      const plainApiXError = new ApiXResponseError('plainError', 500, 'Plain API-X error');
      expect(isSpecificApiXResponseError(plainApiXError)).toBe(false);
    });
  });

  describe('errorForResponse', () => {
    it('should create ApiXResponseUnauthorizedAppError for unauthorizedApp error', () => {
      const response: ApiXResponse<ApiXErrorResponse> = {
        statusCode: 401,
        data: {
          success: false,
          error: {
            id: 'unauthorizedApp',
            message: 'Application is not authorized to access this resource'
          }
        }
      };

      const error = errorForResponse(response);
      expect(error).toBeInstanceOf(ApiXResponseUnauthorizedAppError);
      expect(error.id).toBe('unauthorizedApp');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Application is not authorized to access this resource');
    });

    it('should create ApiXResponseUnauthorizedRequestError for unauthorizedRequest error', () => {
      const response: ApiXResponse<ApiXErrorResponse> = {
        statusCode: 403,
        data: {
          success: false,
          error: {
            id: 'unauthorizedRequest',
            message: 'Request is not authorized'
          }
        }
      };

      const error = errorForResponse(response);
      expect(error).toBeInstanceOf(ApiXResponseUnauthorizedRequestError);
      expect(error.id).toBe('unauthorizedRequest');
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Request is not authorized');
    });

    it('should create ApiXResponseInvalidRequestError for invalidRequest error', () => {
      const response: ApiXResponse<ApiXErrorResponse> = {
        statusCode: 400,
        data: {
          success: false,
          error: {
            id: 'invalidRequest',
            message: 'The request is malformed'
          }
        }
      };

      const error = errorForResponse(response);
      expect(error).toBeInstanceOf(ApiXResponseInvalidRequestError);
      expect(error.id).toBe('invalidRequest');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('The request is malformed');
    });

    it('should create ApiXResponseMissingRequiredHeadersError for missingRequiredHeaders error', () => {
      const response: ApiXResponse<ApiXErrorResponse> = {
        statusCode: 400,
        data: {
          success: false,
          error: {
            id: 'missingRequiredHeaders',
            message: 'Required headers are missing'
          }
        }
      };

      const error = errorForResponse(response);
      expect(error).toBeInstanceOf(ApiXResponseMissingRequiredHeadersError);
      expect(error.id).toBe('missingRequiredHeaders');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Required headers are missing');
    });

    it('should create ApiXResponseMissingJsonBodyError for missingJsonBody error', () => {
      const response: ApiXResponse<ApiXErrorResponse> = {
        statusCode: 400,
        data: {
          success: false,
          error: {
            id: 'missingJsonBody',
            message: 'JSON body is required but missing'
          }
        }
      };

      const error = errorForResponse(response);
      expect(error).toBeInstanceOf(ApiXResponseMissingJsonBodyError);
      expect(error.id).toBe('missingJsonBody');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('JSON body is required but missing');
    });

    it('should create ApiXResponseInvalidJsonBodyError for invalidJsonBody error', () => {
      const response: ApiXResponse<ApiXErrorResponse> = {
        statusCode: 400,
        data: {
          success: false,
          error: {
            id: 'invalidJsonBody',
            message: 'JSON body is malformed'
          }
        }
      };

      const error = errorForResponse(response);
      expect(error).toBeInstanceOf(ApiXResponseInvalidJsonBodyError);
      expect(error.id).toBe('invalidJsonBody');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('JSON body is malformed');
    });

    it('should create ApiXResponseInsecureProtocolError for insecureProtocol error', () => {
      const response: ApiXResponse<ApiXErrorResponse> = {
        statusCode: 400,
        data: {
          success: false,
          error: {
            id: 'insecureProtocol',
            message: 'HTTPS is required'
          }
        }
      };

      const error = errorForResponse(response);
      expect(error).toBeInstanceOf(ApiXResponseInsecureProtocolError);
      expect(error.id).toBe('insecureProtocol');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('HTTPS is required');
    });

    it('should create generic ApiXResponseError for unknown error types', () => {
      const response: ApiXResponse<ApiXErrorResponse> = {
        statusCode: 500,
        data: {
          success: false,
          error: {
            id: 'customError',
            message: 'Something went wrong'
          }
        }
      };

      const error = errorForResponse(response);
      expect(error).toBeInstanceOf(ApiXResponseError);
      expect(error.constructor).toBe(ApiXResponseError);
      expect(error.id).toBe('customError');
      expect(error.statusCode).toBe(500);
      expect(error.message).toBe('Something went wrong');
    });

    it('should handle backward compatibility with deprecated message field', () => {
      const response: ApiXResponse<ApiXErrorResponse> = {
        statusCode: 400,
        data: {
          success: false,
          message: 'Deprecated error message',
          error: {
            id: 'ApiXResponseError',
            message: 'Deprecated error message'
          }
        }
      };

      const error = errorForResponse(response);
      expect(error).toBeInstanceOf(ApiXResponseError);
      expect(error.id).toBe('ApiXResponseError');
      expect(error.message).toBe('Deprecated error message');
    });

    it('should handle response with only deprecated message field (pre v2.1.x)', () => {
      const response: ApiXResponse<any> = {
        statusCode: 400,
        data: {
          success: false,
          message: 'Old format error message'
        }
      };

      const error = errorForResponse(response);
      expect(error).toBeInstanceOf(ApiXResponseError);
      expect(error.id).toBe('ApiXResponseError');
      expect(error.message).toBe('Old format error message');
    });

    it('should throw ApiXResponseError when response data is null', () => {
      const response: ApiXResponse<any> = {
        statusCode: 500,
        data: null
      };

      expect(() => errorForResponse(response)).toThrow(ApiXResponseError);
      
      try {
        errorForResponse(response);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiXResponseError);
        expect((error as ApiXResponseError).id).toBe('unknownError');
        expect((error as ApiXResponseError).statusCode).toBe(500);
      }
    });

    it('should throw ApiXResponseError when response data is not an object', () => {
      const response: ApiXResponse<any> = {
        statusCode: 500,
        data: 'invalid data'
      };

      expect(() => errorForResponse(response)).toThrow(ApiXResponseError);
      
      try {
        errorForResponse(response);
      } catch (error) {
        expect(error).toBeInstanceOf(ApiXResponseError);
        expect((error as ApiXResponseError).id).toBe('unknownError');
        expect((error as ApiXResponseError).statusCode).toBe(500);
      }
    });

    it('should handle missing error message gracefully', () => {
      const response: ApiXResponse<ApiXErrorResponse> = {
        statusCode: 401,
        data: {
          success: false,
          error: {
            id: 'unauthorizedApp',
            message: ''
          }
        }
      };

      const error = errorForResponse(response);
      expect(error).toBeInstanceOf(ApiXResponseUnauthorizedAppError);
      expect(error.message).toBe('');
    });
  });

  describe('Error Classes', () => {
    it('should create ApiXResponseError with correct properties', () => {
      const error = new ApiXResponseError('testId', 400, 'Test message');
      expect(error.id).toBe('testId');
      expect(error.name).toBe('testId');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Test message');
      expect(error).toBeInstanceOf(Error);
    });

    it('should create specific error classes with correct inheritance', () => {
      const unauthorizedApp = new ApiXResponseUnauthorizedAppError(401, 'Unauthorized app');
      expect(unauthorizedApp).toBeInstanceOf(ApiXResponseError);
      expect(unauthorizedApp).toBeInstanceOf(ApiXResponseUnauthorizedAppError);
      expect(unauthorizedApp.id).toBe('unauthorizedApp');
      expect(unauthorizedApp.statusCode).toBe(401);

      const invalidRequest = new ApiXResponseInvalidRequestError(400, 'Invalid request');
      expect(invalidRequest).toBeInstanceOf(ApiXResponseError);
      expect(invalidRequest).toBeInstanceOf(ApiXResponseInvalidRequestError);
      expect(invalidRequest.id).toBe('invalidRequest');
    });
  });
});