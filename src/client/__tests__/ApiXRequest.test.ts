import { ApiXRequest } from '../ApiXRequest';
import { ApiXResponseInvalidRequestError } from '../error';
import { ApiXRequestConfig } from '../types/ApiXRequestConfig';
import { createHmac } from 'crypto';

describe('ApiXRequest', () => {
  const keyStore = {
    getApiKey: jest.fn().mockReturnValue('testApiKey'),
    getAppKey: jest.fn().mockReturnValue('testAppKey'),
    getKeys: jest.fn().mockReturnValue({
      apiKey: 'testApiKey',
      appKey: 'testAppKey'
    })
  }
  const config: ApiXRequestConfig = {
    url: new URL('https://apix.example.com/endpoint/method?param=val'),
    keyStore,
    httpMethod: 'POST',
    data: { key: 'value' },
  };

  let request: ApiXRequest;

  beforeEach(() => {
    jest.restoreAllMocks(); // Reset mocks before each test
    jest.clearAllMocks();

    // Mock Date to ensure consistent headers
    const mockDate = 'Wed, 13 Nov 2024 15:00:00 GMT';
    jest.spyOn(Date.prototype, 'toUTCString').mockReturnValue(mockDate);

    request = new ApiXRequest(config);
  });

  it('should initialize with correct URL and HTTP method', () => {
    expect(request.url.toString()).toBe('https://apix.example.com/endpoint/method?param=val');
    expect(request.httpMethod).toBe('POST');
  });

  it('protected headers must be cleared after making request', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ success: true })
    });

    await request.make();

    const protectedHeaders = (request as any).protectedHeaders;
    expect(protectedHeaders['x-api-key']).toBeUndefined();
    expect(protectedHeaders['x-signature']).toBeUndefined();
    expect(protectedHeaders['x-signature-nonce']).toBeUndefined();
  });

  it('should initialize read-only headers properly.', async () => {
    /// Ensure that protected headers are not unset after making the request for testing purposes
    jest.spyOn(ApiXRequest.prototype as any, 'unsetProtectedHeaders').mockImplementation(() => {});
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ success: true })
    });

    await request.make();
    const headers = request.headers;
    expect(headers['content-type']).toBe('application/json');
    expect(headers['date']).toBeDefined();
  });

  it('should throw an error when attempting to access or write to a protected header', () => {
    expect(() => request.setHeader('x-signature', 'value')).toThrow('Attempting to set a protected header: x-signature!');
    expect(() => request.unsetHeader('x-signature')).toThrow('Attempting to unset a protected header: x-signature!');
    expect(() => request.header('x-signature')).toThrow('Invalid access. x-signature is a protected header and cannot be accessed.');
  });

  it('should throw an error when attempting to send a request that was already sent', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ success: true })
    });
    await request.make();

    await expect(request.make()).rejects.toThrow('This request has already been sent. API-X does not allow attempting to send the same request multiple times.');
  });

  it('should throw an error when receiving an error response from the API-X endpoint', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false, // Simulating an error status (e.g., 400 Bad Request)
      status: 400,
      json: jest.fn().mockResolvedValue({
        success: false,
        message: 'The request is invalid.',
        error: {
          id: 'invalidRequest',
          message: 'The request is invalid.'
        }
      })
    });
    await expect(request.make()).rejects.toThrow(
      new ApiXResponseInvalidRequestError(400, 'The request is invalid.')
    );
  });

  it('sets and unsets unprotected headers correctly', () => {
    request.setHeader('x-custom-header', 'value')
    expect(request.header('x-custom-header')).toBe('value');
    request.unsetHeader('x-custom-header');
    expect(request.header('x-custom-header')).toBeUndefined();
  });

  it('can access read-only headers correctly', () => {
    expect(request.header('date')).toBeDefined();
    expect(request.header('content-type')).toBe('application/json');
  });

  it('should set and get cookies properly', () => {
    request.setCookies({ session: '12345', token: 'abcdef' });
    expect(request.getCookie('session')).toBe('12345');
    expect(request.getCookie('token')).toBe('abcdef');
    expect(request.cookies).toEqual({
      session: '12345',
      token: 'abcdef'
    });

    request.addCookie('user', 'Alice');
    expect(request.getCookie('user')).toBe('Alice');

    request.removeCookie('session');
    expect(request.getCookie('session')).toBeUndefined();
  });

  it('should correctly generate nonce', () => {
    const nonce = (request as any).generateNonce(16);
    expect(nonce).toHaveLength(16);
  });

  it('should successfully make a request', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: jest.fn().mockResolvedValue({ success: true })
    });

    const response = await request.make();
    expect(response.statusCode).toBe(200);
    expect(response.data).toEqual({ success: true });
  });

  it('should handle request failure gracefully with API-X error response', async () => {
    global.fetch = jest.fn().mockResolvedValueOnce({
      ok: false, // Simulating an error status (e.g., 400 Bad Request)
      status: 400,
      json: jest.fn().mockResolvedValue({
        success: false,
        message: 'Bad Request'
      })
    });

    const response = await request.make();
    expect(response.statusCode).toBe(400);
    expect(response.data).toEqual({ success: false, message: 'Bad Request' });
  });

  it('should throw error for unexpected network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network Error'));

    await expect(request.make()).rejects.toThrow('API-X Request failed: Error: Network Error');
    request['sent'] = false; // Reset state to test other function.
    await expect(ApiXRequest.makeRequest(request)).rejects.toThrow('API-X Request failed: Error: Network Error');
  });

  it('same nonce, date, and key should always generate the same signature for the same json body with differently sorted keys', async () => {
    const mockNonce = 'abc';
    jest.spyOn(ApiXRequest.prototype as any, 'generateNonce').mockReturnValue(mockNonce);
    jest.spyOn(ApiXRequest.prototype as any, 'unsetProtectedHeaders').mockImplementation(() => {});
    global.fetch = jest.fn().mockResolvedValue({
      status: 200,
      json: jest.fn().mockResolvedValue({ success: true })
    });

    const requestA = new ApiXRequest({
      ...config,
      data: {
        key: 'value',
        key2: {
          z: 'z',
          y: 'y'
        }
      }
    });

    const requestB = new ApiXRequest({
      ...config,
      data: {
        key2: {
          y: 'y',
          z: 'z'
        },
        key: 'value'
      }
    });

    /// send requests so that headers are initialized
    await (async () => {
      await requestA.make();
      await requestB.make();
    })();

    expect(
      requestA['allHeaders']['x-signature-nonce']
    ).toBe('abc');

    expect(
      requestB['allHeaders']['x-signature-nonce']
    ).toBe('abc');

    expect(
      requestA['allHeaders']['x-signature']
    ).toBe(
      requestB['allHeaders']['x-signature']
    )
  });

  it('should correctly generate signature when body contains non-ASCII characters', () => {
    const dataWithUnicode = { message: 'こんにちは世界' };
    const nonce = 'unicodeNonce';
    const date = 'Wed, 13 Nov 2024 15:00:00 GMT';
    const unicodeRequest = new ApiXRequest({
      ...config,
      data: dataWithUnicode
    });

    const expectedBody = JSON.stringify((unicodeRequest as any).sortedObjectKeys(dataWithUnicode));
    const expectedBase64 = Buffer.from(expectedBody, 'utf-8').toString('base64');
    const pathWithQueries = `${unicodeRequest.url.pathname}${unicodeRequest.url.search}`;
    const message = `${pathWithQueries}.${unicodeRequest.httpMethod}.${nonce}.${date}.${expectedBase64}`;
    const expectedSignature = createHmac('sha256', 'testAppKey')
      .update(message, 'utf-8')
      .digest('hex');

    const actualSignature = (unicodeRequest as any).generateSignature('testAppKey', date, nonce);

    expect(actualSignature).toBe(expectedSignature);
  });
});