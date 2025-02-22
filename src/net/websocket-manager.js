// websocket-manager.js
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client/dist/sockjs.min.js';
import { getActivePinia } from 'pinia'; // 获取 Pinia 实例

class WebSocketManager {
  constructor() {
    this.client = null;  // WebSocket 客户端
    this.token = null;    // Token
    this.isConnected = false;  // 连接状态
    this.subscriptions = new Map();  // 存储订阅的 Map
    this.sessionId = null;  // 会话 ID
  }

  // 获取当前 Token
  getToken() {
    const pinia = getActivePinia();
    if (pinia) {
      const store = pinia.state.value.auth;  // 获取当前 store
      return store?.auth?.token;  // 从 store 中获取 token
    }
    return null;
  }

  // 创建并启动 WebSocket 连接
  startConnection() {
    this.token = this.getToken();
    if (!this.token) {
      console.error('无法获取 Token');
      return;
    }

    this.client = new Client({
      webSocketFactory: () => new SockJS(`/api/wsConnect?token=${this.token}`), // 使用 SockJS 创建 WebSocket 连接
      connectHeaders: {
        Authorization: `Bearer ${this.token}`,
      },
      onConnect: () => {
        this.isConnected = true;
        console.log('连接成功');
      
        // 遍历已保存的订阅路径并重新订阅
        this.subscriptions.forEach((value, destination) => {
          this.subscribe(destination, value.callback); // 使用保存的回调重新订阅
        });
      },
      
      onStompError: (frame) => {
        console.error('STOMP 错误:', frame);
        this.isConnected = false;
      },
      debug: () => { }, // 禁用调试信息
      // debug: (str) => console.log(str),
    });

    // 启动连接
    this.client.activate();
  }

  // 关闭 WebSocket 连接
  closeConnection() {
    if (this.client) {
      this.client.deactivate();
      this.isConnected = false;
      console.log('连接关闭');
    }
  }

  // 重连机制
  reconnect() {
    if (!this.isConnected) {
      console.log('正在重连...');
      this.startConnection();
    }
  }

  sendMessage(destination, message, callback) {
    if (this.isConnected && this.client) {
      this.client.publish({
        destination: destination,  // 消息发送的目标
        body: JSON.stringify(message), // 消息内容
      });
      // 调用回调函数
      if (callback && typeof callback === 'function') {
        callback(message);
      }
    } else {
      console.error('WebSocket 尚未连接，无法发送消息');
    }


  };


  // 订阅消息
  subscribe(destination, callback) {
    if (this.isConnected) {
      // 执行订阅
      const subscription = this.client.subscribe(destination, (message) => {
        const receivedData = JSON.parse(message.body);
        callback(receivedData); // 调用回调
      });

      // 保存订阅对象和回调函数到 Map
      this.subscriptions.set(destination, { subscription, callback });
    } else {
      console.error('WebSocket 未连接，订阅失败');
    }
  }


  unsubscribe(destination) {
    const subscriptionInfo = this.subscriptions.get(destination);
    if (subscriptionInfo && subscriptionInfo.subscription) {
      subscriptionInfo.subscription.unsubscribe(); // 取消订阅
      this.subscriptions.delete(destination); // 从 Map 中删除
    } else {
      console.error(`没有找到订阅路径: ${destination}`);
    }
  }

}

export default new WebSocketManager();
