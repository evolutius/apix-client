import { ApiXHttpMethod } from './types/ApiXHttpMethod';
import { ApiXJsonObject } from './types/ApiXJsonObject';
import { ApiXKeyStore } from './security/ApiXKeyStore';
import { ApiXRequest } from './ApiXRequest';
import { ApiXResponse } from './types/ApiXResponse';

/**
 * A client for an API-X server.
 * 
 * This object serves as a vanilla client that to reach API-X-based APIs.
 * 
 * @category Making API-X Requests
 */
export class ApiXClient {

  /**
   * Creates a new instance of an API-X Client.
   * @param keyStore An object that securely retrieves API keys.
   */
  public constructor(
    private readonly keyStore: ApiXKeyStore
  ) {}

  //// Creating Request Objects ////
  /**
   * Creates a new request object that can be used to reach an API-X-based
   * API.
   * @param url The URL of the API-X endpoint.
   * @param httpMethod The HTTP Method to use.
   * @param data The request JSON Body, if any.
   * @returns An `ApiXRequest` object that can be used to make a request.
   * 
   * @category Making API-X Requests
   */
  public createRequest(
    url: URL,
    httpMethod: ApiXHttpMethod = 'GET',
    data?: ApiXJsonObject
  ): ApiXRequest {
    return new ApiXRequest({
      url,
      keyStore: this.keyStore,
      data,
      httpMethod
    });
  }

  /**
   * Creates a new GET request object that can be used to reach an API-X-based
   * API.
   * @param url The URL of the API-X endpoint.
   * @returns An `ApiXRequest` object that can be used to make a request.
   * 
   * @category Making API-X Requests
   */
  public createGetRequest(url: URL): ApiXRequest {
    return this.createRequest(url);
  }

  /**
   * Creates a new POST request object that can be used to reach an API-X-based
   * API.
   * @param url The URL of the API-X endpoint.
   * @param data The request JSON Body, if any.
   * @returns An `ApiXRequest` object that can be used to make a request.
   * 
   * @category Making API-X Requests
   */
  public createPostRequest(url: URL, data?: ApiXJsonObject): ApiXRequest {
    return this.createRequest(url, 'POST', data);
  }

  /**
   * Creates a new PUT request object that can be used to reach an API-X-based
   * API.
   * @param url The URL of the API-X endpoint.
   * @param data The request JSON Body, if any.
   * @returns An `ApiXRequest` object that can be used to make a request.
   * 
   * @category Making API-X Requests
   */
  public createPutRequest(url: URL, data?: ApiXJsonObject): ApiXRequest {
    return this.createRequest(url, 'PUT', data);
  }

  /**
   * Creates a new DELETE request object that can be used to reach an API-X-based
   * API.
   * @param url The URL of the API-X endpoint.
   * @param data The request JSON Body, if any.
   * @returns An `ApiXRequest` object that can be used to make a request.
   * 
   * @category Making API-X Requests
   */
  public createDeleteRequest(url: URL, data?: ApiXJsonObject): ApiXRequest {
    return this.createRequest(url, 'DELETE', data);
  }

  /**
   * Creates a new PATCH request object that can be used to reach an API-X-based
   * API.
   * @param url The URL of the API-X endpoint.
   * @param data The request JSON Body, if any.
   * @returns An `ApiXRequest` object that can be used to make a request.
   * 
   * @category Making API-X Requests
   */
  public createPatchRequest(url: URL, data?: ApiXJsonObject): ApiXRequest {
    return this.createRequest(url, 'PATCH', data);
  }

  //// Making Direct Requests ////
  /**
   * Makes a request to an API-X-based API.
   * @param url The URL of the API-X endpoint.
   * @param httpMethod The HTTP Method to use.
   * @param data The request JSON Body, if any.
   * @returns An `ApiXRequest` object that can be used to make a request.
   * @throws May throw errors that need to be caught.
   * 
   * @category Making API-X Requests
   */
  public async makeRequest(
    url: URL,
    httpMethod: ApiXHttpMethod = 'GET',
    data?: ApiXJsonObject
  ): Promise<ApiXResponse> {
    return await this.createRequest(url, httpMethod, data).make();
  }

  /**
   * Makes a GET request to an API-X-based API.
   * @param url The URL of the API-X endpoint.
   * @returns An `ApiXRequest` object that can be used to make a request.
   * @throws May throw errors that need to be caught.
   * 
   * @category Making API-X Requests
   */
  public async makeGetRequest(url: URL): Promise<ApiXResponse> {
    return await this.makeRequest(url);
  }

  /**
   * Makes a POST request to an API-X-based API.
   * @param url The URL of the API-X endpoint.
   * @param data The request JSON Body, if any.
   * @returns An `ApiXRequest` object that can be used to make a request.
   * @throws May throw errors that need to be caught.
   * 
   * @category Making API-X Requests
   */
  public async makePostRequest(url: URL, data?: ApiXJsonObject): Promise<ApiXResponse> {
    return await this.makeRequest(url, 'POST', data);
  }

  /**
   * Makes a PUT request to an API-X-based API.
   * @param url The URL of the API-X endpoint.
   * @param data The request JSON Body, if any.
   * @returns An `ApiXRequest` object that can be used to make a request.
   * @throws May throw errors that need to be caught.
   * 
   * @category Making API-X Requests
   */
  public async makePutRequest(url: URL, data?: ApiXJsonObject): Promise<ApiXResponse> {
    return await this.makeRequest(url, 'PUT', data);
  }

  /**
   * Makes a DELETE request to an API-X-based API.
   * @param url The URL of the API-X endpoint.
   * @param data The request JSON Body, if any.
   * @returns An `ApiXRequest` object that can be used to make a request.
   * @throws May throw errors that need to be caught.
   * 
   * @category Making API-X Requests
   */
  public async makeDeleteRequest(url: URL, data?: ApiXJsonObject): Promise<ApiXResponse> {
    return await this.makeRequest(url, 'DELETE', data);
  }

  /**
   * Makes a PATCH request to an API-X-based API.
   * @param url The URL of the API-X endpoint.
   * @param data The request JSON Body, if any.
   * @returns An `ApiXRequest` object that can be used to make a request.
   * @throws May throw errors that need to be caught.
   * 
   * @category Making API-X Requests
   */
  public async makePatchRequest(url: URL, data?: ApiXJsonObject): Promise<ApiXResponse> {
    return await this.makeRequest(url, 'PATCH', data);
  }
}
