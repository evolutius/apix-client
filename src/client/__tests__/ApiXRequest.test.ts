import { ApiXRequest } from '../ApiXRequest';
import { ApiXRequestConfig } from '../types/ApiXRequestConfig';

describe('ApiXRequest', () => {
  const config: ApiXRequestConfig = {
    url: new URL('https://apix.example.com/endpoint/method?param=val'),
    apiKey: 'testApiKey',
    appKey: 'testAppKey',
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

  it('should initialize headers properly', () => {
    const headers = request.headers;
    expect(headers['x-api-key']).toBe(config.apiKey);
    expect(headers['content-type']).toBe('application/json');
    expect(headers['date']).toBeDefined();
  });

  it('should throw an error when attempting to access or write to a protected header', () => {
    expect(() => request.setHeader('x-signature', 'value')).toThrow('Attempting to set a protected header: x-signature!');
    expect(() => request.unsetHeader('x-signature')).toThrow('Attempting to unset a protected header: x-signature!');
    expect(() => request.header('x-signature')).toThrow('Invalid access. x-signature is a protected header and cannot be accessed.');
  });

  it('sets and unsets unprotected headers correctly', () => {
    request.setHeader('x-custom-header', 'value')
    expect(request.header('x-custom-header')).toBe('value');
    request.unsetHeader('x-custom-header');
    expect(request.header('x-custom-header')).toBeUndefined();
  });

  it('can access write-protected headers correctly', () => {
    expect(request.header('date')).toBeDefined();
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
    await expect(ApiXRequest.makeRequest(request)).rejects.toThrow('API-X Request failed: Error: Network Error');
  });

  it('same nonce, date, and key should always generate the same signature for the same json body with differently sorted keys', async () => {
    const mockNonce = 'abc';
    jest.spyOn(ApiXRequest.prototype as any, 'generateNonce').mockReturnValue(mockNonce);

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
});