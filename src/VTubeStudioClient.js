import WebSocket from 'ws';

export class VTubeStudioClient {
  constructor(options = {}) {
    this.host = options.host || '127.0.0.1';
    this.port = options.port || 8001;
    this.ws = null;
    this.authToken = null;
    this.authKey = null;
    this.connected = false;
    this.pendingRequests = new Map();
    this.requestIdCounter = 0;
  }

  connect() {
    return new Promise((resolve, reject) => {
      const url = `ws://${this.host}:${this.port}`;
      this.ws = new WebSocket(url);

      this.ws.on('open', () => {
        this.connected = true;
        console.log(`Connected to VTube Studio at ${url}`);
        resolve();
      });

      this.ws.on('message', (data) => {
        this.handleMessage(JSON.parse(data.toString()));
      });

      this.ws.on('error', (error) => {
        console.error('WebSocket error:', error.message);
        reject(error);
      });

      this.ws.on('close', () => {
        this.connected = false;
        console.log('Disconnected from VTube Studio');
      });
    });
  }

  handleMessage(data) {
    const requestID = data.requestID;

    if (requestID && this.pendingRequests.has(requestID)) {
      const { resolve, reject } = this.pendingRequests.get(requestID);
      this.pendingRequests.delete(requestID);

      if (data.message === 'OK') {
        resolve(data.data || data);
      } else if (data.data?.errorID && data.data?.errorID !== 0) {
        reject(new Error(data.data.message || `Error ID: ${data.data.errorID}`));
      } else if (data.data?.messageType === 'APIError') {
        reject(new Error(data.data.message || `API Error`));
      } else if (data.messageType === 'APIError') {
        reject(new Error(data.data?.message || 'API Error'));
      } else {
        resolve(data);
      }
    } else {
      console.log('[VTS Message]', JSON.stringify(data, null, 2));
    }
  }

  sendRequest(messageType, data = {}) {
    return new Promise((resolve, reject) => {
      if (!this.connected) {
        reject(new Error('Not connected to VTube Studio'));
        return;
      }

      this.requestIdCounter++;
      const requestID = `req_${this.requestIdCounter}_${Date.now()}`;

      // Use requestID for matching responses
      this.pendingRequests.set(requestID, { resolve, reject });

      const request = {
        apiName: 'VTubeStudioPublicAPI',
        apiVersion: '1.0',
        requestID,
        messageType,
        data
      };

      this.ws.send(JSON.stringify(request));

      setTimeout(() => {
        if (this.pendingRequests.has(requestID)) {
          this.pendingRequests.delete(requestID);
          reject(new Error(`Request timeout: ${messageType}`));
        }
      }, messageType === 'AuthenticationTokenRequest' ? 30000 : 10000);
    });
  }

  async authenticate(pluginName, pluginDeveloper, pluginIcon = '') {
    const tokenResult = await this.sendRequest('AuthenticationTokenRequest', {
      pluginName,
      pluginDeveloper,
      ...(pluginIcon && { pluginIcon })
    });
    this.authToken = tokenResult.data?.authenticationToken || tokenResult.authenticationToken;
    console.log('Authentication token received');

    const authResult = await this.sendRequest('AuthenticationRequest', {
      pluginName,
      pluginDeveloper,
      authenticationToken: this.authToken
    });
    this.authKey = authResult.data?.authenticationKey || authResult.authenticationKey;
    console.log('Session authenticated');

    return authResult;
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.connected = false;
    }
  }
}
