---
title: Securing API and Application Signing Keys in Node.js Apps
category: Client Security
---
# Securing API and Application Signing Keys in Node.js Apps

API keys and application signing keys are critical components that must be kept secure in any application, especially when dealing with services like `@evlt/apix-client`. This tutorial will guide you through best practices for securing these keys in Node.js applications.

## Why Securing API Keys Matters

API and application signing keys allow your app to communicate with external services securely. If exposed, these keys can be misused by attackers, leading to unauthorized access, data breaches, or loss of service. Proper security measures help prevent these threats.

## Best Practices for Securing API and Application Keys

### 1. Use Environment Variables (Backend only)

Environment variables are one of the most common and effective ways to store API keys and other sensitive information. This approach keeps keys out of your codebase, reducing the chance of accidental exposure.

#### Steps to Secure Keys with Environment Variables

1. **Create a `.env` File**: Store your keys in a `.env` file at the root of your project.

   ```env
   API_KEY=your-api-key
   APP_KEY=your-app-key
   ```

_Note: Never commit your `.env` file to a repository or you will be exposing keys and secrets._

1. **Load Environment Variables**: Use a library like `dotenv` to load the variables into your Node.js app.

   ```bash
   npm install dotenv
   ```

2. **Import and Configure `dotenv`**: Import `dotenv` at the top of your main file to load the variables.

   ```typescript
   import dotenv from 'dotenv';
   dotenv.config();

   const apiKey = process.env.API_KEY;
   const appKey = process.env.APP_KEY;
   ```

3. **Add `.env` to `.gitignore`**: Ensure the `.env` file is ignored by Git to avoid committing sensitive information.

   ```
   # .gitignore
   .env
   ```

4. **In-code Security (client-side storage)**: If the client runs on a web or browser environment, you must **not use environment variables** as these are bundled in plaintext, available for anyone to see. The best practice is to only keep the keys in a backend service, and using a proxy to reach your API-X endpoints. API-X client provides an enhancement over plain keys storage in RAM, even when keys are retrieved from a backend service. When using the API-X client, use a secure Key Store.


To use a key store securely, you can go one of two ways:
  1. Securely obtaining keys only once, and storing them securely. This is referred to as ROSS (Request once, Store Securely); or,
     * This is less secure, but a network request to obtain the keys are only done once, so it is faster.
  2. Implementing a KeyStore service to securely retrieve your keys every time they are needed. This is referred to as ARNS (Always request, Never store);
     * This is more secure (provided that the endpoint that retrieves the keys are well-secured), but it makes a network request whenever keys are required, so it is slower.

**Example of ROSS:**
```typescript
import {
  ApiXClient,
  ApiXEncryptedKeyStore,
  ApiXSymmetricEncryptionService,
  KeyProvider
} from '@evlt/apix-client';
import { createHmac, Hmac, randomUUID } from 'crypto';

/// 1. Implement a KeyProvider
class MyKeyProvider {

  private uuid: string;

  constructor(private uniqueId: string) {
    this.uuid = randomUUID(); /// Makes it unique per instance of a key provider, even if the uuid is constant
  }

  public getKey(): string {
    /// This key should be:
    /// 1. Hard to guess.
    /// 2. Unique per session / instance.
    /// 3. Derived (never stored in RAM)
    /// 4. Difficult to access outside of the environment
    const hmac = createHmac('sha256', this.uuid);
    const key = hmac
      .update(this.uniqueId, 'utf-8')  /// Different per instance since Hmac key is different.
      .digest()
      .toString('hex');  /// Key is derived every time.

    return key;
  }
}

/// Request once.
const keys = await secureRetrievalForKeys();

/// Now the keys won't be stored in RAM and are more difficult to access.
const keyStore = new ApiXEncryptedKeyStore(
  new ApiXSymmetricEncryptionService(process.env.ENC_ALGO || 'secure'),  /// Store securely
  new MyKeyProvider(process.env.SOME_UNIQUE_KEY!),
  keys.apiKey,
  keys.appKey
);

const client = ApiXClient(keyStore);
```

**Example of ARNS:**
```typescript
import {
  ApiXClient,
  ApiXKeys,
  ApiXKeyStore
} from '@evlt/apix-client';
import { createHmac, Hmac, randomUUID } from 'crypto';

/// 1. Implement your key store sevice
class KeyStoreService implements ApiXKeyStore {
  constructor(...) {
    this.secureKeysClient = ...;
  }

  async getApiKey(): Promise<string> {
    const keys = await getKeys();
    return keys.apiKey;
  }

  async getAppKey(): Promise<string> {
    const keys = await getKeys();
    return keys.appKey;
  }

  async getKeys(): Promise<ApiXKeys> {
    const response = this.secureKeysClient.getKeys(...);

    /// TODO: Check if there are errors and handle. If this method throws, you will
    /// be able to catch it when you make requests, so you may choose to not do anything
    /// about errors here.

    return response.keys;
  }
} 

/// Whenever keys are needed, they'll be requested.
const keyStore = new KeyStoreService(
  ...
);

/// Knows how to request keys efficients.
/// Only one network request will be made to retrieve both keys (unless you implement your KeyStore in such a way that it'd require multiple).
/// The will never store your keys.
const client = ApiXClient(keyStore);
```

_Note: Browser environments are naturally less secure, _

### 2. Use Secure Environment Management Tools

For production environments, consider using secret management services to handle environment variables more securely. Some popular options include:

- **AWS Secrets Manager**: AWS provides a managed service to store and retrieve application secrets securely.
- **Azure Key Vault**: Microsoft Azure's solution for managing application secrets.
- **Google Secret Manager**: A secure and convenient way to store API keys and passwords in Google Cloud.
- **HashiCorp Vault**: An open-source solution for managing secrets, encryption keys, and access.

These tools provide additional layers of security, such as encryption at rest, access control, and auditing.

### 3. Limit Access and Permissions

To minimize risk, follow the principle of least privilege. Only allow access to your API keys to the parts of your application that truly need it.

- **Role-Based Access Control (RBAC)**: Assign roles with specific permissions to services or users who need access to secrets.
- **Environment-Specific Keys**: Use separate keys for development, staging, and production environments. This prevents development keys from being used in production and vice versa.

### 4. Rotate Keys Regularly

Regularly rotating API and application keys helps reduce the impact of key exposure. If a key is compromised, having a rotation policy in place will limit the damage that can be done.

- **Automated Rotation**: Use secret management tools that support automated key rotation.
- **Deprecation Policy**: Ensure there is a deprecation period for old keys, allowing services to switch to the new keys without downtime.

### 5. Avoid Hardcoding Keys

Never hardcode API keys or secrets directly in your codebase. Hardcoding keys makes them more susceptible to being leaked, especially in open-source projects or shared environments.

- **Configuration Files**: Store sensitive keys in configuration files that are not committed to version control.
- **Environment Variables**: Use environment variables to provide keys at runtime, avoiding the need to include them in your code.

### 6. Monitor and Audit Key Usage

Monitoring and auditing the usage of your API and application keys helps detect suspicious activities early.

- **Logging**: Log every time a key is accessed, used, or modified.
- **Alerts**: Set up alerts for unusual or unauthorized usage patterns, such as an unexpected number of requests or requests from unfamiliar IP addresses.

### 7. Use Encryption

Encrypt sensitive data, including API keys, both at rest and in transit. Encryption ensures that even if data is accessed by unauthorized individuals, it remains unreadable without the proper decryption key.

- **TLS/SSL**: Use HTTPS to encrypt data in transit between clients and servers.
- **Database Encryption**: Encrypt any sensitive information stored in your databases, including API keys.

## Example: Securing Keys in a Node.js App

Here is a complete example of how to use `dotenv` to secure API and application keys in a Node.js app:

1. **Install `dotenv`**:
   ```bash
   npm install dotenv
   ```

2. **Create a `.env` File**:
   ```env
   API_KEY=your-api-key
   APP_KEY=your-app-key
   ```

3. **Load Environment Variables**:
   ```typescript
   import dotenv from 'dotenv';
   dotenv.config();

   const apiKey = process.env.API_KEY;
   const appKey = process.env.APP_KEY;

   if (!apiKey || !appKey) {
     throw new Error('Missing API or Application key. Please check your environment variables.');
   }

   // Use the keys securely in your application
   console.log('API Key and App Key loaded successfully');
   ```

## Conclusion

Securing API and application signing keys is crucial for maintaining the security of your Node.js applications. By following best practices like using environment variables, employing secret management tools, limiting access, rotating keys, and avoiding hardcoding, you can significantly reduce the risk of key exposure and unauthorized access. Implement these strategies to ensure your application stays secure and reliable.
