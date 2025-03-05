import axios from 'axios';
import JSEncrypt from 'jsencrypt';

export const USE_SSL_STORAGE_KEY = 'muip-use-ssl';

class MuipService {
  private static readonly MIN_CALL_INTERVAL: number = 50;
  private static adminKey: string | null = null;
  private static useSSL: boolean = true;
  private static port: number = 443;
  private static lastCallTimestamp: number = 0;
  private static callQueue: Promise<void> = Promise.resolve();
  private static rsaPublicKey: string = '';
  private static sessionId: string | null = null;
  private static sessionExpireTime: number = 0;

  static setUseSSL(useSSL: boolean) {
    this.useSSL = useSSL;
  }

  static setAdminKey(key: string) {
    this.adminKey = key;
  }

  static setPort(port: number) {
    this.port = port;
  }

  /**
   * Execute a command on the server.
   * @param {string} command - The unencrypted command to be executed.
   * @param {number} targetUid - The UID of the target player.
   */

  static async executeCommand(command: string, targetUid: number) {
    await this.ensureValidSession();
    const encryptedCommand = this.encryptMessage(command);
    await this.enforceCallInterval();
    try {
      const response = await axios.post(`${this.getBaseUrl()}/exec_cmd`, {
        SessionId: this.sessionId,
        Command: encryptedCommand,
        TargetUid: targetUid,
      });
      if (response.data.code !== 0) {
        throw new Error(response.data.message);
      }
      // Decode base64 message to UTF-8
      const base64Message = response.data.data.message;
      const binaryString = atob(base64Message);
      const decoder = new TextDecoder('utf-8');
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      const decodedMessage = decoder.decode(bytes);
      return { code: response.data.code, message: decodedMessage };
    } catch (error) {
      console.error('Error executing command:', error);
      throw error;
    }
  }

  /**
   * Get the server information.
   */
  static async getServerInformation() {
    await this.ensureValidSession();
    await this.enforceCallInterval();
    try {
      const response = await axios.get(`${this.getBaseUrl()}/server_information`, {
        params: { SessionId: this.sessionId },
      });
      if (response.data.code !== 0) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching server information:', error);
      throw error;
    }
  }

  /**
   * Get player information.
   * @param {number} uid - The UID of the player.
   */
  static async getPlayerInformation(uid: number) {
    await this.ensureValidSession();
    await this.enforceCallInterval();
    try {
      const response = await axios.get(`${this.getBaseUrl()}/player_information`, {
        params: { SessionId: this.sessionId, Uid: uid },
      });
      if (response.data.code !== 0) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    } catch (error) {
      console.error('Error fetching player information:', error);
      throw error;
    }
  }

  private static getBaseUrl(): string {
    const protocol = this.useSSL ? 'https' : 'http';
    return `${protocol}://127.0.0.1:${this.port}/muip`;
  }

  private static async ensureValidSession(): Promise<void> {
    const now = Date.now() / 1000;
    if (!this.sessionId || now >= this.sessionExpireTime) {
      const response = await this.createSession();
      this.sessionId = response.sessionId;
      this.sessionExpireTime = response.expireTimeStamp;
      this.rsaPublicKey = response.rsaPublicKey;
      await this.authorizeAdmin();
    }
  }

  private static async createSession(): Promise<{ sessionId: string; expireTimeStamp: number; rsaPublicKey: string }> {
    await this.enforceCallInterval();

    const tryCreateSession = async (useSSL: boolean) => {
      this.useSSL = useSSL;
      const response = await axios.post(`${this.getBaseUrl()}/create_session`, { key_type: 'PEM' });
      if (response.data.code !== 0) {
        throw new Error(response.data.message);
      }
      // Store the successful SSL setting
      localStorage.setItem(USE_SSL_STORAGE_KEY, useSSL.toString());
      return response.data.data;
    };

    try {
      // First attempt with current SSL setting
      return await tryCreateSession(this.useSSL);
    } catch (error) {
      try {
        // If first attempt fails, try with opposite SSL setting
        return await tryCreateSession(!this.useSSL);
      } catch (retryError) {
        console.error('Error creating session after retry:', retryError);
        throw retryError;
      }
    }
  }

  private static async authorizeAdmin(): Promise<any> {
    if (!this.sessionId) throw new Error('No session ID available');
    await this.enforceCallInterval();
    try {
      const response = await axios.post(`${this.getBaseUrl()}/auth_admin`, {
        session_id: this.sessionId,
        admin_key: this.encryptMessage(this.adminKey as string),
      });
      if (response.data.code !== 0) {
        throw new Error(response.data.message);
      }
      return response.data.data;
    } catch (error) {
      console.error('Error authorizing admin:', error);
      throw error;
    }
  }

  private static enforceCallInterval(): Promise<void> {
    this.callQueue = this.callQueue.then(async () => {
      const now = Date.now();
      const timeSinceLastCall = now - this.lastCallTimestamp;
      if (timeSinceLastCall < this.MIN_CALL_INTERVAL) {
        await new Promise((resolve) => setTimeout(resolve, this.MIN_CALL_INTERVAL - timeSinceLastCall));
      }
      this.lastCallTimestamp = Date.now();
    });
    return this.callQueue;
  }

  private static encryptMessage(command: string): string {
    if (!this.rsaPublicKey) {
      throw new Error('RSA public key is not set. Please create a session first.');
    }

    const encryptor = new JSEncrypt();
    encryptor.setPublicKey(this.rsaPublicKey);
    const encrypted = encryptor.encrypt(command);

    if (!encrypted) {
      throw new Error('Encryption failed. Please verify the public key.');
    }

    return encrypted;
  }
}

export default MuipService;
