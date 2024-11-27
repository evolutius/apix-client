---
title: Writing a Custom API-X Client
category: Developer Documentation
---
# Writing a Custom API-X Client

In this tutorial, we'll create a custom API-X client called `MovifyClient` that interacts with a hypothetical movie API, `Movify`, using `ApiXClient` and `ApiXRequest` for secure, customizable requests. This custom client will encapsulate the `ApiXClient` while adding custom behavior, such as setting an `Authorization` header with a JWT token and transforming the response data to match a `Movie` interface.

## Prerequisites

Before starting, make sure you have installed the `@evlt/apix-client` package:

```bash
npm install @evlt/apix-client
```

You'll also need `typescript` set up in your project.

## Scenario Overview

We'll create a class called `MovifyClient` that provides an easy interface for interacting with the `Movify` API. The `MovifyClient` will:

1. Handle authentication (login) by obtaining a JWT token.
2. Add an `Authorization` header to each subsequent request.
3. Transform the raw API response into a custom `Movie` object.

Here’s what usage looks like:

```typescript
import { MovifyClient } from './MovifyClient';
import { Movie } from './types/Movie';

(async () => {
  const client = new MovifyClient(); // or MovieClient.shared

  try {
    await client.login('username', 'password');
    const movie: Movie = await client.getMovie('my-movie-id');
    console.log(`Got movie: ${JSON.stringify(movie)}`);
  } catch (error) {
    console.error(`An error has occurred: ${error}.`);
    process.exit(1);
  }
})();
```

## Implementing `MovifyClient`

Let's dive into implementing the `MovifyClient` class.

### Step 1: Define the `Movie` Interface

First, let's define what a `Movie` object looks like:

```typescript
// src/types/Movie.ts
export interface Movie {
  id: string;
  title: string;
  director: string;
  releaseYear: number;
  genre: string;
  description?: string;
}
```

### Step 2: Create `MovifyClient`

Here's the implementation of `MovifyClient` that encapsulates `ApiXClient`:

```typescript
// src/MovifyClient.ts
import {
  ApiXClient,
  ApiXRequest,
  ApiXRequestHeaders,
  ApiXJsonObject
} from '@evlt/apix-client';
import { Movie } from './types/Movie';

export class MovifyClient {
  private static _shared: MovifyClient;
  private client: ApiXClient;
  private token?: string;

  constructor() {
    const apiKey = process.env.API_KEY || 'your-api-key';
    const appKey = process.env.APP_KEY || 'your-app-key';
    this.client = new ApiXClient(apiKey, appKey);
  }

  // Singleton instance
  static get shared(): MovifyClient {
    if (!MovifyClient._shared) {
      MovifyClient._shared = new MovifyClient();
    }
    return MovifyClient._shared;
  }

  // Login method to obtain JWT token
  public async login(username: string, password: string): Promise<void> {
    const url = new URL('https://movify.example.com/auth/login');
    const data = { username, password };
    
    const request = this.client.createPostRequest(url, data);
    const response = await request.make();

    if (response.statusCode === 200 && response.data.token) {
      this.token = response.data.token;
    } else {
      throw new Error('Failed to authenticate. Please check your credentials.');
    }
  }

  // Method to get a movie by ID
  public async getMovie(movieId: string): Promise<Movie> {
    if (!this.token) {
      throw new Error('You must be logged in to fetch movie details.');
    }

    const url = new URL(`https://movify.example.com/movies/${movieId}`);
    const request = this.client.createGetRequest(url);
    request.setHeader(ApiXRequestHeaders.Authorization, `Bearer ${this.token}`);
    
    const response = await request.make();

    if (response.statusCode === 200) {
      return this.transformToMovie(response.data);
    } else {
      throw new Error(`Failed to fetch movie with ID: ${movieId}`);
    }
  }

  // Helper method to transform the response data into a Movie object
  private transformToMovie(data: ApiXJsonObject): Movie {
    return {
      id: data.id,
      title: data.title,
      director: data.director,
      releaseYear: data.releaseYear,
      genre: data.genre,
      description: data.description,
    };
  }
}
```

### Key Concepts

1. **Login Method**: The `login` method sends a `POST` request to authenticate the user. If successful, it stores the JWT token, which is then used in subsequent requests to authorize the user.

2. **JWT Authorization**: After logging in, the `token` is stored in the client, and it's attached to the `Authorization` header in subsequent requests using the `Bearer` scheme.

3. **Transforming the Response**: The `transformToMovie` method converts the raw response into the desired `Movie` type, allowing the client code to work with well-defined TypeScript types.

## Usage Example

Here's how you can use the `MovifyClient` in a script:

```typescript
import { MovifyClient } from './MovifyClient';
import { Movie } from './types/Movie';

(async () => {
  const client = new MovifyClient();  // or MovieClient.shared

  try {
    await client.login('username', 'password');
    const movie: Movie = await client.getMovie('my-movie-id');
    console.log(`Got movie: ${JSON.stringify(movie)}`);
  } catch (error) {
    console.error(`An error has occurred: ${error}.`);
    process.exit(1);
  }
})();
```

## Conclusion

In this tutorial, you learned how to create a custom API-X client that extends the capabilities of `ApiXClient` to fit a specific use case. The `MovifyClient` class makes it simple to interact with the `Movify` API while adding custom behavior, such as handling authentication and response transformation.

You can further extend this approach by adding more features, such as caching responses, retry logic, or handling different types of requests.

Feel free to experiment and adapt `MovifyClient` to suit your application needs!
