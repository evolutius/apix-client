/**
 * A response data object that is returned when a request is made with
 * the `ApiXRequest` object.
 * 
 * @category Making API-X Requests
 */
export interface ApiXResponseData {
  /**
   * A Boolean value indicating whether the request was successful.
   */
  readonly success: boolean;
}

/**
 * A response object that is returned when a request is made with
 * the `ApiXRequest` object.
 * 
 * @category Making API-X Requests
 */
export interface ApiXResponse<DataType extends ApiXResponseData = ApiXResponseData> {

  /**
   * The JSON data returned by the API-X endpoint.
   * This is optional because some endpoints may not return any data.
   */
  readonly data?: DataType;

  /**
   * The HTTP status code returned by the API-X endpoint.
   */
  readonly statusCode: number;
}
