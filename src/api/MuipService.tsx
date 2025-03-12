import axios from 'axios';
import JSEncrypt from 'jsencrypt';

export const USE_SSL_STORAGE_KEY = 'muip-use-ssl';

class MuipService {
  private static adminKey: string = '';
  private static port: number = 443;
  // 修改默认值为 false，使用 HTTP
  private static useSSL: boolean = false;
  private static host: string = 'localhost'; // 默认主机
  
  // 添加缺少的属性
  private static sessionId: string = '';
  private static sessionExpireTime: number = 0;
  private static rsaPublicKey: string = '';
  private static lastCallTimestamp: number = 0;
  private static callQueue: Promise<void> = Promise.resolve();
  private static readonly MIN_CALL_INTERVAL: number = 100; // 100ms 最小调用间隔

  static setAdminKey(key: string) {
    this.adminKey = key;
  }

  static setPort(port: number) {
    this.port = port;
  }

  static setUseSSL(useSSL: boolean) {
    this.useSSL = useSSL;
  }

  // 添加设置主机的方法
  static setHost(host: string) {
    this.host = host;
  }

  // 修改getBaseUrl方法以使用host
  private static getBaseUrl(): string {
    const protocol = this.useSSL ? 'https' : 'http';
    return `${protocol}://${this.host}:${this.port}/muip`;
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
      try {
        const response = await axios.post(`${this.getBaseUrl()}/create_session`, { key_type: 'PEM' });
        if (response.data.code !== 0) {
          throw new Error(response.data.message);
        }
        // 存储成功的 SSL 设置
        localStorage.setItem(USE_SSL_STORAGE_KEY, useSSL.toString());
        return response.data.data;
      } catch (error) {
        console.error(`使用 ${useSSL ? 'HTTPS' : 'HTTP'} 创建会话失败:`, error);
        throw error;
      }
    };

    try {
      // 首先尝试使用 HTTP (false)
      return await tryCreateSession(false);
    } catch (error) {
      console.log('尝试使用 HTTPS 重试...');
      try {
        // 如果 HTTP 失败，尝试使用 HTTPS
        return await tryCreateSession(true);
      } catch (retryError) {
        console.error('重试后创建会话失败:', retryError);
        throw new Error(`无法连接到服务器 ${this.host}:${this.port}，请检查服务器地址和端口是否正确。`);
      }
    }
  }

  private static async authorizeAdmin(): Promise<any> {
    if (!this.sessionId) throw new Error('No session ID available');
    await this.enforceCallInterval();
    try {
      // 添加日志输出，帮助调试
      console.log(`Authorizing with host: ${this.host}, port: ${this.port}, useSSL: ${this.useSSL}`);
      console.log(`Session ID: ${this.sessionId.substring(0, 5)}...`);
      
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

// 确保这一行存在且位于文件末尾
export default MuipService;
