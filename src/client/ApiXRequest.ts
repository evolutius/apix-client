import { ApiXHttpMethod } from './types/ApiXHttpMethod';
import { ApiXJsonObject } from './types/ApiXJsonObject';
import { ApiXRequestConfig } from './types/ApiXRequestConfig';
import { ApiXResponse } from './types/ApiXResponse';
import axios from 'axios';
import { createHmac } from 'crypto';

/**
 * Headers that can be set on an API-X request.
 * 
 * @category Working with HTTP Headers
 */
export enum ApiXRequestHeaders {
  Authorization = 'Authorization',
  Cookie = 'Cookie',
  ContentType = 'Content-Type',
  Date = 'Date'
}

enum ProtectedHeaders {
  Signature = 'X-Signature',
  SignatureNonce = 'X-Signature-Nonce'
}

enum WriteProtectedHeaders {
  ContentType = 'Content-Type',
  Date = 'Date',
  ApiKey = 'X-API-Key'
}

/**
 * A class that can send a request compatible with API-X servers.
 * 
 * @category Making API-X Requests
 */
export class ApiXRequest {

  //// Public Properties ////
  /**
   * The URL to which the request will be made. 
   */
  public readonly url: URL;

  /**
   * The HTTP Body to send with the request, if any.
   */
  public readonly data?: ApiXJsonObject;
  
  /**
   * The HTTP Method to use with the request.
   */
  public readonly httpMethod: ApiXHttpMethod;

  //// Private Properties ////

  /**
   * Contains the protected headers–headers that shoudn't be read nor overwritten for any reason.
   */
  private readonly protectedHeaders: Record<string, string> = {};

  /**
   * Contains the write-protected headers. These header cannot be overwritten but can be read.
   * 
   * Examples may include `Content-Type` and `Date`.
   */
  private readonly writeProtectedHeaders: Record<string, string> = {};

  /**
   * Contains headers that can be read and overwritten.
   * 
   * These may include custom headers or common headers.
   */
  private readonly unprotectedHeaders: Record<string, string> = {};

  /**
   * Contains the cookies in the request.
   */
  private cookiesStore: Record<string, string> = {};

  //// Constructor ////
  /**
   * Creates a new request object to make an API-X-compatible request.
   * @param config The configuration of the request.
   */
  public constructor(config: ApiXRequestConfig) {
    this.url = config.url;
    this.httpMethod = config.httpMethod ?? 'GET';
    this.data = config.data;
    
    this.initializeHeaders(config.apiKey, config.appKey);
  }

  private initializeHeaders(apiKey: string, appKey: string) {
    const requestDate = (new Date()).toUTCString();

    // Initialize write-protected headers
    this.writeProtectedHeaders[this.headerName(WriteProtectedHeaders.ApiKey)] = apiKey;
    this.writeProtectedHeaders[this.headerName(WriteProtectedHeaders.Date)] = requestDate;
    this.writeProtectedHeaders[this.headerName(WriteProtectedHeaders.ContentType)] = 'application/json';

    // Initialize protected headers
    const nonce = this.generateNonce(32);
    const signature = this.generateSignature(appKey, requestDate, nonce);

    this.protectedHeaders[this.headerName(ProtectedHeaders.SignatureNonce)] = nonce;
    this.protectedHeaders[this.headerName(ProtectedHeaders.Signature)] = signature;
  }

  //// Getters ////

  /**
   * The HTTP headers in the request, excluding read-protected headers.
   * 
   * These will not include any headers that contain sensitive information
   * such as request signature.
   * 
   * @category Working with HTTP Headers
   */
  public get headers(): Record<string, string> {
    return {
      ...this.unprotectedHeaders,
      [ApiXRequestHeaders.Cookie]: this.getCookieHeader(),
      ...this.writeProtectedHeaders,
    };
  }

  /**
   * Gets the current cookies as a record.
   * @returns A record of cookie name-value pairs.
   * 
   * @category Working with HTTP Cookies
   */
  public get cookies(): Record<string, string> {
    return { ...this.cookiesStore };
  }

  private get allHeaders(): Record<string, string> {
    return {
      ...this.unprotectedHeaders,
      ...this.writeProtectedHeaders,
      [ApiXRequestHeaders.Cookie]: this.getCookieHeader(),
      ...this.protectedHeaders,
    };
  }

  /**
   * Sets a header in the request. This will override any non-protected
   * header in the request.
   * @param name The header name (e.g.: X-Custom-Header). The header will
   * be set lowercased.
   * @param value The value in the header.
   * 
   * @category Working with HTTP Headers
   */
  public setHeader(name: string, value: string) {
    const headerName = this.headerName(name);
    if (this.isProtectedHeader(headerName) || this.isWriteProtectedHeader(headerName)) {
      throw new Error(`Attempting to set a protected header: ${name}!`);
    }
    this.unprotectedHeaders[headerName] = value;
  }

  /**
   * Unsets a header in the request. This will override any non-protected
   * header in the request.
   * @param name The header name (e.g.: X-Custom-Header). Case-insensitive.
   * 
   * @category Working with HTTP Headers
   */
  public unsetHeader(name: string) {
    const headerName = this.headerName(name);
    if (this.isProtectedHeader(headerName) || this.isWriteProtectedHeader(headerName)) {
      throw new Error(`Attempting to unset a protected header: ${name}!`);
    }
    delete this.unprotectedHeaders[headerName];
  }

  /**
   * Returns the value of any unprotected or write-protected header in the request.
   * 
   * This will not get the `Cookie` unless it's set with `setHeader`. To get a cookie,
   * use `getCookie` or `cookies`.
   * @param name The case-insensitive name of the header.
   * @returns The value of the header or undefined.
   * @throws `Error` error if attempting to access a protected header.
   * 
   * @category Working with HTTP Headers
   */
  public header(name: string): string | undefined {
    const headerName = this.headerName(name);
    if (this.isProtectedHeader(headerName)) {
      throw new Error(`Invalid access. ${name} is a protected header and cannot be accessed.`);
    }
    return this.unprotectedHeaders[headerName] || this.writeProtectedHeaders[headerName];
  }

  /**
   * Sets multiple cookies at once. This method will overwrite cookies
   * if needed, but it will keep existing ones that don't conflict with
   * newly set ones.
   * @param cookies - A record of cookie name-value pairs to set.
   * 
   * @category Working with HTTP Cookies
   */
  public setCookies(cookies: Record<string, string>): void {
    this.cookiesStore = { ...this.cookiesStore, ...cookies };
  }

  /**
   * Adds a single cookie.
   * @param name - The name of the cookie.
   * @param value - The value of the cookie.
   * 
   * @category Working with HTTP Cookies
   */
  public addCookie(name: string, value: string): void {
    this.cookiesStore[name] = value;
  }

  /**
   * Removes a cookie by name.
   * @param name - The name of the cookie to remove.
   * 
   * @category Working with HTTP Cookies
   */
  public removeCookie(name: string): void {
    delete this.cookiesStore[name];
  }

  /**
   * Gets the value of a cookie.
   * @param name - The name of the cookie (case-sensitive).
   * @returns The value of the cookie or `undefined`.
   * 
   * @category Working with HTTP Cookies
   */
  public getCookie(name: string): string | undefined {
    return this.cookiesStore[name];
  }

  //// API Methods ////

  /**
   * Sends the request to an API-X API server.
   * @returns The response of the request.
   * @throws Instances of `Error` if the request fails and the API-X
   * backend does not have a response object.
   * 
   * _Note: Sending the same request more than once will cause it to
   * fail as API-X backends do not accept repeat requests. Additionally,
   * if the request is 'too old', it may fail. The API-X server determines
   * what 'too old' means. This is to deter keeping request objects for too
   * long as they should be destroyed quickly for security reasons._
   * 
   * @category Making API-X Requests
   */
  public async make(): Promise<ApiXResponse> {
    try {
      const response = await axios.request({
        url: this.url.toString(),
        method: this.httpMethod,
        data: this.data,
        headers: this.allHeaders
      });

      return {
        data: response.data,
        statusCode: response.status
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        return {
          data: error.response?.data,
          statusCode: error.response?.status ?? 500
        };
      } else {
        throw error;
      }
    }
  }

  /**
   * Sends a request to an API-X API server.
   * @param request The request that is sent to the server.
   * @returns The response of the request.
   * @throws Instances of `Error` if the request fails and the API-X
   * backend does not have a response object.
   * 
   * _Note: Sending the same request more than once will cause it to
   * fail as API-X backends do not accept repeat requests. Additionally,
   * if the request is 'too old', it may fail. The API-X server determines
   * what 'too old' means. This is to deter keeping request objects for too
   * long as they should be destroyed quickly for security reasons._
   * 
   * @category Making API-X Requests
   */
  public static async makeRequest(request: ApiXRequest): Promise<ApiXResponse> {
    return await request.make();
  }

  //// Helper Methods ////
  private isProtectedHeader(name: string): boolean {
    return this.isHeaderInRecord(name, this.protectedHeaders);
  }

  private isWriteProtectedHeader(name: string): boolean {
    return this.isHeaderInRecord(name, this.writeProtectedHeaders);
  }

  private isHeaderInRecord(name: string, record: Record<string, string>) {
    const headerNames = new Set([
      ...Object.keys(record).map(name => this.headerName(name)),
    ]);
    return headerNames.has(this.headerName(name));
  }

  private getCookieHeader(): string {
    return Object.entries(this.cookiesStore)
        .map(([key, value]) => `${key}=${value}`)
        .join('; ');
  }

  private headerName(name: string): string {
    return name.trim().toLowerCase();
  }

  private generateNonce(length: number = 16): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
      let nonce = '';
      for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        nonce += characters[randomIndex];
      }
      return nonce;
  }

  private generateSignature(appKey: string, dateString: string, nonce: string) {
    const httpBody = this.data ?? {};
    const hmac = createHmac('sha256', appKey);
    const stringifiedJsonBody = Object.keys(httpBody).length > 0
      ? JSON.stringify(this.sortedObjectKeys(httpBody))
      : '';
    const httpBodyBase64 = stringifiedJsonBody.length > 0
      ? Buffer.from(stringifiedJsonBody, 'binary').toString('base64')
      : '';
    const pathWithQueries = `${this.url.pathname}${this.url.search}`;
    const message = `${pathWithQueries}.${this.httpMethod}.${nonce}.${dateString}.${httpBodyBase64}`;
    return hmac
      .update(message, 'utf-8')
      .digest()
      .toString('hex');
  }

  /**
   * Sorts all the keys in an object recursively.
   * @param obj The object whose key are to be sorted.
   * @returns The object with its keys recursively sorted.
   */
  private sortedObjectKeys(obj: ApiXJsonObject): ApiXJsonObject {
    const sortedObj: ApiXJsonObject = {};
    Object.keys(obj).sort().forEach(key => {
      const value = obj[key];
      sortedObj[key] = value !== null && typeof value === 'object' && !Array.isArray(value)
        ? this.sortedObjectKeys(value as ApiXJsonObject)
        : value;
    });
    return sortedObj;
  }
}
