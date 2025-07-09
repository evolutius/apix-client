
/**
 * An interface for an object that provides an encryption key.
 * 
 * A secure key has the following properties:
 * - It is unique to the current session.
 * - It is not easily guessable or accessible.
 * - It is not stored in memory, but rather derived.
 *   - For example, it could be derived by the browser session or device in a way
 *   that one not using the browser could not access or guess.
 */
export interface KeyProvider {
  /**
   * Retrieves a key for the current session.
   * 
   * @returns A string representing the key.
   */
  getKey(): string;
}
