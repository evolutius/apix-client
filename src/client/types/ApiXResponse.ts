import { ApiXJsonObject } from './ApiXJsonObject';

/**
 * A response object that is returned when a request is made with
 * the `ApiXRequest` object.
 * 
 * @category Making API-X Requests
 */
export interface ApiXResponse {
  readonly data?: ApiXJsonObject;
  readonly statusCode: number;
}
