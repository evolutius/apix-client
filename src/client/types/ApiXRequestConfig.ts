import { ApiXHttpMethod } from './ApiXHttpMethod';
import { ApiXJsonObject } from './ApiXJsonObject';

/**
 * An object used to configure an `ApiXRequest` object.
 * 
 * @category Making API-X Requests
 */
export interface ApiXRequestConfig {
  /**
   * The URL to which the request will be made.
   */
  readonly url: URL;

  /**
   * The API Key of the application making the request.
   */
  readonly apiKey: string;

  /**
   * The application key used to sign requests.
   */
  readonly appKey: string;

  /**
   * The HTTP Method.
   */
  readonly httpMethod?: ApiXHttpMethod;

  /**
   * The HTTP JSON Body of the request.
   */
  readonly data?: ApiXJsonObject;
}