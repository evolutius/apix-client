import {
  ApiXRequestError,
  isApiXRequestError,
} from '../ApiXRequestError';

describe('ApiXRequestError', () => {
  describe('ApiXRequestError Class', () => {
    it('should create ApiXRequestError with message', () => {
      const error = new ApiXRequestError('Test request error');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiXRequestError);
      expect(error.message).toBe('Test request error');
      expect(error.name).toBe('ApiXRequestError');
    });

    it('should create ApiXRequestError without message', () => {
      const error = new ApiXRequestError();
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiXRequestError);
      expect(error.message).toBe('');
      expect(error.name).toBe('ApiXRequestError');
    });

    it('should create ApiXRequestError with undefined message', () => {
      const error = new ApiXRequestError(undefined);
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiXRequestError);
      expect(error.message).toBe('');
      expect(error.name).toBe('ApiXRequestError');
    });

    it('should create ApiXRequestError with empty string message', () => {
      const error = new ApiXRequestError('');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiXRequestError);
      expect(error.message).toBe('');
      expect(error.name).toBe('ApiXRequestError');
    });

    it('should have correct prototype chain', () => {
      const error = new ApiXRequestError('Test error');
      expect(Object.getPrototypeOf(error)).toBe(ApiXRequestError.prototype);
      expect(Object.getPrototypeOf(ApiXRequestError.prototype)).toBe(Error.prototype);
    });
  });

  describe('isApiXRequestError Type Guard', () => {
    it('should return true for ApiXRequestError instances', () => {
      const error = new ApiXRequestError('Test error');
      expect(isApiXRequestError(error)).toBe(true);
    });

    it('should return true for ApiXRequestError instances without message', () => {
      const error = new ApiXRequestError();
      expect(isApiXRequestError(error)).toBe(true);
    });

    it('should return false for generic Error instances', () => {
      const error = new Error('Generic error');
      expect(isApiXRequestError(error)).toBe(false);
    });

    it('should return false for other error types', () => {
      const typeError = new TypeError('Type error');
      expect(isApiXRequestError(typeError)).toBe(false);

      const rangeError = new RangeError('Range error');
      expect(isApiXRequestError(rangeError)).toBe(false);

      const syntaxError = new SyntaxError('Syntax error');
      expect(isApiXRequestError(syntaxError)).toBe(false);
    });

    it('should return false for null and undefined', () => {
      expect(isApiXRequestError(null)).toBe(false);
      expect(isApiXRequestError(undefined)).toBe(false);
    });

    it('should return false for primitive values', () => {
      expect(isApiXRequestError('string')).toBe(false);
      expect(isApiXRequestError(123)).toBe(false);
      expect(isApiXRequestError(true)).toBe(false);
      expect(isApiXRequestError(false)).toBe(false);
    });

    it('should return false for plain objects', () => {
      expect(isApiXRequestError({})).toBe(false);
      expect(isApiXRequestError({ message: 'error' })).toBe(false);
      expect(isApiXRequestError({ name: 'ApiXRequestError' })).toBe(false);
    });

    it('should return false for arrays', () => {
      expect(isApiXRequestError([])).toBe(false);
      expect(isApiXRequestError(['error'])).toBe(false);
    });

    it('should return false for functions', () => {
      expect(isApiXRequestError(() => {})).toBe(false);
      expect(isApiXRequestError(function() {})).toBe(false);
    });

    it('should return false for objects that look like ApiXRequestError', () => {
      const fakeError = {
        message: 'Fake error',
        name: 'ApiXRequestError',
        stack: 'fake stack trace'
      };
      expect(isApiXRequestError(fakeError)).toBe(false);
    });

    it('should return false for objects with Error prototype but not ApiXRequestError', () => {
      const customError = Object.create(Error.prototype);
      customError.name = 'ApiXRequestError';
      customError.message = 'Custom error';
      expect(isApiXRequestError(customError)).toBe(false);
    });
  });

  describe('Error Behavior', () => {
    it('should be throwable and catchable', () => {
      expect(() => {
        throw new ApiXRequestError('Test error');
      }).toThrow('Test error');

      expect(() => {
        throw new ApiXRequestError('Test error');
      }).toThrow(ApiXRequestError);
    });

    it('should be catchable as Error', () => {
      try {
        throw new ApiXRequestError('Test error');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(ApiXRequestError);
        expect(isApiXRequestError(error)).toBe(true);
      }
    });

    it('should have stack trace', () => {
      const error = new ApiXRequestError('Test error');
      expect(error.stack).toBeDefined();
      expect(typeof error.stack).toBe('string');
      expect(error.stack).toContain('ApiXRequestError');
    });

    it('should maintain message property', () => {
      const message = 'Request failed due to network error';
      const error = new ApiXRequestError(message);
      expect(error.message).toBe(message);
      expect(error.toString()).toContain(message);
    });
  });

  describe('Edge Cases', () => {
    it('should handle very long error messages', () => {
      const longMessage = 'A'.repeat(10000);
      const error = new ApiXRequestError(longMessage);
      expect(error.message).toBe(longMessage);
      expect(isApiXRequestError(error)).toBe(true);
    });

    it('should handle special characters in error messages', () => {
      const specialMessage = 'Error with special chars: 🚨 \n\t\r\0 "quotes" \'apostrophes\' \\backslashes\\';
      const error = new ApiXRequestError(specialMessage);
      expect(error.message).toBe(specialMessage);
      expect(isApiXRequestError(error)).toBe(true);
    });

    it('should handle unicode characters in error messages', () => {
      const unicodeMessage = 'Unicode error: 测试 éñoñ αβγ 🌟';
      const error = new ApiXRequestError(unicodeMessage);
      expect(error.message).toBe(unicodeMessage);
      expect(isApiXRequestError(error)).toBe(true);
    });
  });
});
