import { ApiXClient } from '../ApiXClient';
import { ApiXRequest } from '../ApiXRequest';
import { ApiXResponse } from '../types/ApiXResponse';

jest.mock('../ApiXRequest');
const MockApiXRequest = ApiXRequest as jest.MockedClass<typeof ApiXRequest>;

describe('ApiXClient', () => {
  const apiKey = 'testApiKey';
  const appKey = 'testAppKey';
  let client: ApiXClient;
  let url: URL;

  beforeEach(() => {
    client = new ApiXClient(apiKey, appKey);
    url = new URL('https://apix.example.com/endpoint/method?param=val');
    MockApiXRequest.mockClear();
  });

  it('should create a request object with correct parameters', () => {
    const request = client.createRequest(url, 'POST', { key: 'value' });
    expect(MockApiXRequest).toHaveBeenCalledWith({
      url,
      apiKey,
      appKey,
      data: { key: 'value' },
      httpMethod: 'POST',
    });
  });

  it('should create a GET request using createGetRequest method', () => {
    client.createGetRequest(url);
    expect(MockApiXRequest).toHaveBeenCalledWith({
      url,
      apiKey,
      appKey,
      httpMethod: 'GET',
      data: undefined,
    });
  });

  it('should make a request using makeRequest', async () => {
    const mockResponse: ApiXResponse = { statusCode: 200, data: { success: true } };
    MockApiXRequest.prototype.make.mockResolvedValueOnce(mockResponse);

    const response = await client.makeRequest(url, 'POST', { key: 'value' });
    expect(response).toEqual(mockResponse);
  });

  it('should handle request failures gracefully', async () => {
    MockApiXRequest.prototype.make.mockRejectedValueOnce(new Error('Network Error'));
    await expect(client.makeRequest(url, 'GET')).rejects.toThrow('Network Error');
  });

  it('should call make() for direct GET request', async () => {
    const mockResponse: ApiXResponse = { statusCode: 200, data: { success: true } };
    MockApiXRequest.prototype.make.mockResolvedValueOnce(mockResponse);

    const response = await client.makeGetRequest(url);
    expect(response).toEqual(mockResponse);
  });

  it('should call make() for direct POST request', async () => {
    const mockResponse: ApiXResponse = { statusCode: 200, data: { success: true } };
    MockApiXRequest.prototype.make.mockResolvedValueOnce(mockResponse);

    const response = await client.makePostRequest(url, { key: 'value' });
    expect(response).toEqual(mockResponse);
  });

  it('should call make() for direct PUT request', async () => {
    const mockResponse: ApiXResponse = { statusCode: 200, data: { success: true } };
    MockApiXRequest.prototype.make.mockResolvedValueOnce(mockResponse);

    const response = await client.makePutRequest(url, { key: 'value' });
    expect(response).toEqual(mockResponse);
  });

  it('should call make() for direct DELETE request', async () => {
    const mockResponse: ApiXResponse = { statusCode: 200, data: { success: true } };
    MockApiXRequest.prototype.make.mockResolvedValueOnce(mockResponse);

    const response = await client.makeDeleteRequest(url);
    expect(response).toEqual(mockResponse);
  });

  it('should call make() for direct PATCH request', async () => {
    const mockResponse: ApiXResponse = { statusCode: 200, data: { success: true } };
    MockApiXRequest.prototype.make.mockResolvedValueOnce(mockResponse);

    const response = await client.makePatchRequest(url, { key: 'value' });
    expect(response).toEqual(mockResponse);
  });
});

