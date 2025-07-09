import { createCipheriv, createDecipheriv, createHmac, randomBytes } from 'crypto';

import { SymmetricEncryptionService } from './SymmetricEncryptionService';

/**
 * An algorithm used for symmetric encryption.
 * 
 * - 'fast': ChaCha20-Poly1305 - Modern, fast authenticated encryption, especially efficient on mobile devices.
 * - 'balanced': AES-256-CTR - Good balance of speed and security, widely supported, requires separate authentication.
 * - 'secure': AES-256-GCM - Maximum security with built-in authenticated encryption, industry standard.
 */
export type SymmetricEncryptionAlgorithm =
  | 'fast'
  | 'balanced'
  | 'secure';


/**
 * A service that uses a key to encrypt and decrypt data.
 * 
 * Select the appropriate algorithm based on the use case:
 * - 'fast': ChaCha20-Poly1305 - Modern, fast authenticated encryption (good for high-throughput scenarios).
 * - 'balanced': AES-256-CTR - Good balance of speed and security (needs separate HMAC for authentication).
 * - 'secure': AES-256-GCM - Maximum security with built-in authentication (recommended for sensitive data).
 * 
 * Note: The key should be exactly 32 bytes for all algorithms.
 * If the key is shorter, it will be padded with zeros; if longer, it will be truncated to 32 bytes.
 */
export class ApiXSymmetricEncryptionService implements SymmetricEncryptionService {

  private readonly encryptionHandler: SymmetricEncryptionService;

  constructor(algorithm: SymmetricEncryptionAlgorithm) {
    switch (algorithm) {
      case 'fast':
        this.encryptionHandler = new ChaChaEncryptionHandler();
        break;
      case 'balanced':
        this.encryptionHandler = new AESCTREncryptionHandler();
        break;
      case 'secure':
        this.encryptionHandler = new AESGCMEncryptionHandler();
        break;
      default:
        throw new Error('Invalid symmetric encryption algorithm specified.');
    }
  }

  encrypt(data: string, key: string): string {
    return this.encryptionHandler.encrypt(data, key);
  }

  decrypt(data: string, key: string): string {
    return this.encryptionHandler.decrypt(data, key);
  }
}

/**
 * ChaCha20-Poly1305 encryption handler
 */
class ChaChaEncryptionHandler implements SymmetricEncryptionService {
  encrypt(data: string, key: string): string {
    const keyBuffer = Buffer.from(key.padEnd(32, '0').slice(0, 32));
    const nonce = randomBytes(12);
    const cipher = createCipheriv('chacha20-poly1305', keyBuffer, nonce);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      nonce: nonce.toString('hex'),
      authTag: authTag.toString('hex')
    });
  }

  decrypt(encryptedData: string, key: string): string {
    const { encrypted, nonce, authTag } = JSON.parse(encryptedData);
    const keyBuffer = Buffer.from(key.padEnd(32, '0').slice(0, 32));
    const decipher = createDecipheriv('chacha20-poly1305', keyBuffer, Buffer.from(nonce, 'hex'));
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

/**
 * AES-256-CTR encryption handler with HMAC authentication
 */
class AESCTREncryptionHandler implements SymmetricEncryptionService {
  encrypt(data: string, key: string): string {
    const keyBuffer = Buffer.from(key.padEnd(32, '0').slice(0, 32));
    const iv = randomBytes(16);
    const cipher = createCipheriv('aes-256-ctr', keyBuffer, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    // Add HMAC for authentication
    const hmac = createHmac('sha256', keyBuffer);
    hmac.update(iv);
    hmac.update(Buffer.from(encrypted, 'hex'));
    const authTag = hmac.digest('hex');
    
    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag
    });
  }

  decrypt(encryptedData: string, key: string): string {
    const { encrypted, iv, authTag } = JSON.parse(encryptedData);
    const keyBuffer = Buffer.from(key.padEnd(32, '0').slice(0, 32));
    
    // Verify HMAC
    const hmac = createHmac('sha256', keyBuffer);
    hmac.update(Buffer.from(iv, 'hex'));
    hmac.update(Buffer.from(encrypted, 'hex'));
    const expectedAuthTag = hmac.digest('hex');
    
    if (authTag !== expectedAuthTag) {
      throw new Error('Authentication failed: Data may have been tampered with');
    }
    
    const decipher = createDecipheriv('aes-256-ctr', keyBuffer, Buffer.from(iv, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}

/**
 * AES-256-GCM encryption handler
 */
class AESGCMEncryptionHandler implements SymmetricEncryptionService {
  encrypt(data: string, key: string): string {
    const keyBuffer = Buffer.from(key.padEnd(32, '0').slice(0, 32));
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', keyBuffer, iv);
    
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    
    return JSON.stringify({
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    });
  }

  decrypt(encryptedData: string, key: string): string {
    const { encrypted, iv, authTag } = JSON.parse(encryptedData);
    const keyBuffer = Buffer.from(key.padEnd(32, '0').slice(0, 32));
    const decipher = createDecipheriv('aes-256-gcm', keyBuffer, Buffer.from(iv, 'hex'));
    
    decipher.setAuthTag(Buffer.from(authTag, 'hex'));
    
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}