---
title: Getting Started
category: Developer Documentation
---
A client for API-X ([GitHub repository](https://github.com/evolutius/apix)). This package provides an easy-to-use interface for interacting with API-X-based servers. The client is designed to be:

- **Extensible & Modifiable**: Easily extend or modify the client for custom API-X-based servers.
- **Secure & Fast**: Built with secure request mechanisms, ensuring safe interactions with API-X endpoints while maintaining high performance.

## Features

- **Simplified API Interaction**: Convenient methods for creating and making GET, POST, PUT, DELETE, and PATCH requests.
- **Extensible Design**: Can be extended to support custom authentication, additional HTTP methods, or other functionalities.
- **Security First**: Requests are signed and timestamped, providing protection against replay attacks and unauthorized access.
- **Intuitive Usage**: Create request objects or directly make requests with ease.

## Installation

You can install this package using npm:

```bash
npm install @evlt/apix-client
```

Or using yarn:

```bash
yarn add @evlt/apix-client
```

## Usage

### Creating an API-X Client

First, create an instance of `ApiXClient` by providing your `apiKey` and `appKey`:

```typescript
import { ApiXClient } from '@evlt/apix-client';

const apiKey = 'your-api-key';
const appKey = 'your-app-key';
const client = new ApiXClient(apiKey, appKey);
```

### Making Requests

#### GET Request
```typescript
const url = new URL('https://apix.example.com/endpoint');
client.makeGetRequest(url)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

#### POST Request
```typescript
const url = new URL('https://apix.example.com/endpoint');
const data = { key: 'value' };
client.makePostRequest(url, data)
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

### Creating Request Objects

If you prefer more control over the request, you can create a request object first, modify it if needed, and then execute it:

```typescript
const request = client.createPostRequest(url, data);
request.setHeader('Authorization', 'Bearer your-token');
request.make()
  .then(response => console.log(response))
  .catch(error => console.error(error));
```

## API Reference

### `ApiXClient`

#### Constructor
```typescript
constructor(apiKey: string, appKey: string)
```
Creates a new instance of an API-X Client.

- **`apiKey`**: The API key for your application.
- **`appKey`**: The application signing key used for request signing.

#### Methods

- **`createRequest(url: URL, httpMethod: ApiXHttpMethod, data?: ApiXJsonObject): ApiXRequest`**
  - Creates a new `ApiXRequest` object.

- **`createGetRequest(url: URL): ApiXRequest`**
  - Creates a new GET request object.

- **`makeRequest(url: URL, httpMethod: ApiXHttpMethod, data?: ApiXJsonObject): Promise<ApiXResponse>`**
  - Directly makes a request and returns the response.

- **Convenience Methods**
  - **`makeGetRequest(url: URL)`**, **`makePostRequest(url: URL, data?: ApiXJsonObject)`**, **`makePutRequest(url: URL, data?: ApiXJsonObject)`**, **`makeDeleteRequest(url: URL, data?: ApiXJsonObject)`**, **`makePatchRequest(url: URL, data?: ApiXJsonObject)`**: Simplified methods for common HTTP actions.

### `ApiXRequest`

For advanced usage, `ApiXRequest` provides full control over individual requests, allowing for custom headers, cookies, and more.

## Extending or Encapsulating the Client

The `ApiXClient` can be easily extended for additional functionality, such as:

- Adding custom headers or authentication mechanisms.
- Implementing retry logic or other custom request handling features.

See examples at [_Writing a Customer API-X Client_](./Writing_a_Custom_API_X_Client.md).

## Contributing

Contributions are welcome! Feel free to open issues or submit pull requests on the [GitHub repository](https://github.com/evolutius/apix-client).
