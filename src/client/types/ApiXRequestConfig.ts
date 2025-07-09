import { ApiXHttpMethod } from './ApiXHttpMethod';
import { ApiXJsonObject } from './ApiXJsonObject';
import { ApiXKeyStore } from '../security/ApiXKeyStore';

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
   * An object that allows you to securely retrieve API keys and application keys.
   */
  readonly keyStore: ApiXKeyStore;

  /**
   * The HTTP Method.
   */
  readonly httpMethod?: ApiXHttpMethod;

  /**
   * The HTTP JSON Body of the request.
   */
  readonly data?: ApiXJsonObject;
}