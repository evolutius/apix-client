import { ApiXRequest } from '../ApiXRequest';
import { ApiXRequestConfig } from '../types/ApiXRequestConfig';
import axios, { AxiosError, AxiosResponse } from 'axios';

jest.mock('axios', () => {
  const actualModule = jest.requireActual('axios');
  return {
    ...actualModule,
    default: {
      // ...actualModule,
      request: jest.fn(),
    }
  };
});

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
    axios.request = jest.fn().mockResolvedValueOnce({
      data: { success: true },
      status: 200,
    });

    const response = await request.make();
    expect(response.statusCode).toBe(200);
    expect(response.data).toEqual({ success: true });
  });

  it('should handle request failure gracefully', async () => {
    axios.request = jest.fn().mockRejectedValueOnce(
      new AxiosError(`AxiosError`, undefined, undefined, undefined, {
        status: 400,
        data: {
          success: false,
          message: 'Bad Request'
        }
      } as AxiosResponse)
    );

    const response = await request.make();
    expect(response.statusCode).toBe(400);
    expect(response.data).toEqual({ success: false, message: 'Bad Request' });
  });

  it('should throw error for unexpected request failure', async () => {
    axios.request = jest.fn().mockRejectedValue(new Error('Network Error'));

    await expect(request.make()).rejects.toThrow('Network Error');
    await expect(ApiXRequest.makeRequest(request)).rejects.toThrow('Network Error');
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