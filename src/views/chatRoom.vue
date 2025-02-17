<template>
  <div class="content">
    <div class="chat-room-container">
      <!-- 标题 -->
      <el-card class="header-card" shadow="always">
        <h2>休息室</h2>
      </el-card>

      <!-- 主体部分 -->
      <el-row class="main-content">
        <!-- 聊天消息和在线用户分两列 -->
        <el-col :span="18" class="messages-section" ref="messagesContainer">
          <el-card class="message-card" shadow="always">
            <!-- 消息列表 -->
            <div class="messages">
              <div v-for="(msg, index) in messages" :key="index" class="message">
                <!-- 每条消息是一个message-line -->
                <div class="message-line">
                  <div class="message-user">
                    <span class="user">{{ msg.playerName + ":" }}</span>
                  </div>
                  <div class="message-content" :style="{ color: msg.fontColor, fontSize: msg.fontSize }">
                    {{ msg.messageContent }}
                  </div>
                  <div class="message-time" :style="{ fontSize: '10px', userSelect: 'none' }">
                    {{ msg.messageTime }}
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>

        <!-- 在线人数列表 -->
        <el-col :span="6" class="online-users-section">

          <el-card class="online-users-card" shadow="always">
            <h3>在线用户 ({{ onlineUsers.length }})</h3>
            <el-row>
              <el-col v-for="(user, index) in onlineUsers" :key="index" :span="24">
                <el-card shadow="hover" class="player-card">
                  <div class="player-container">
                    <!-- 头像 -->
                    <el-avatar :src="defaultAvatar" size="50" shape="square" class="player-avatar" />
                    <!-- 玩家信息 -->
                    <div class="player-info">
                      <router-link :to="{ name: 'UserProfile', params: { userId: user.userId } }" class="user-link">
                        {{ user.username }}
                      </router-link>
                    </div>
                  </div>
                </el-card>
              </el-col>
            </el-row>
          </el-card>
        </el-col>
      </el-row>

      <!-- </el-card> -->


      <!-- 输入框 -->
      <el-row class="input-section">
        <el-card class="enter-card" shadow="always">
          <div class="control-panel">
            <!-- 固定颜色选择器 -->
            <el-select v-model="fontColor" placeholder="选择颜色" class="color-selector">
              <el-option label="黑色" value="#000000"></el-option>
              <el-option label="红色" value="#ff0000"></el-option>
              <el-option label="蓝色" value="#0000ff"></el-option>
              <el-option label="绿色" value="#008000"></el-option>
              <el-option label="橙色" value="#ffa500"></el-option>
            </el-select>

            <!-- 字号选择器 -->
            <el-select v-model="fontSize" placeholder="字体大小" class="font-size-selector">
              <el-option label="12px" value="12px"></el-option>
              <el-option label="14px" value="14px"></el-option>
              <el-option label="16px" value="16px"></el-option>
              <el-option label="18px" value="18px"></el-option>
              <el-option label="20px" value="20px"></el-option>
            </el-select>
          </div>


          <!-- 下方输入框和发送按钮 -->
          <div class="message-input-container">
            <el-input v-model="messageContent" placeholder="输入你的消息..." clearable class="message-input"
              :autosize="{ minRows: 2, maxRows: 5 }" type="textarea" @keydown.enter.native="handleEnterKey"></el-input>
            <el-button type="primary" @click="sendMessage">发送</el-button>
          </div>
        </el-card>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick } from 'vue';
import WebSocketManager from '@/net/websocket-manager';
import { useStore } from '@/stores';
import { format } from 'date-fns';

const fontColor = ref('#000000'); // 默认黑色
const fontSize = ref('14px'); // 默认 14px
const store = useStore();
const user = store.auth.user;
const roomId = 0; // 休息室暂时不用房间号
console.log("roomId:" + store.auth.nowRoomId)
// 动态获取messages 用于渲染聊天内容
var messages = ref([]);
// 动态获取在线用户列表
var onlineUsers = ref([]);

const messageContent = ref(''); // 动态获取输入框内容
// 引用消息容器DOM
const messagesContainer = ref(null);

// 处理 Enter 和 Shift+Enter
const handleEnterKey = (event) => {
  if (!event.shiftKey) {
    event.preventDefault(); // 阻止默认行为（换行）
    sendMessage();
  }
};

// 发送消息
const sendMessage = () => {
  const user = store.auth.user;
  WebSocketManager.sendMessage('/app/chatRoom', {
    roomId: 0, // 休息室暂时不用房间号
    userId: user.userId,
    playerName: user.username,
    messageType: "DAYTALK",
    //TODO 服务端处理index
    messageTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    messageContent: messageContent.value,
    fontColor: fontColor.value, // 发送字体颜色
    fontSize: fontSize.value    // 发送字体大小
  }, (callbackData) => {
    messageContent.value = '';
  });
};

// 生命周期钩子，调用websocket服务组件初始化连接和订阅
onMounted(() => {
  // 创建一个等待 WebSocketManager 连接成功的函数
  const waitForConnection = () => {
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (WebSocketManager.isConnected == true) { // 检查 WebSocket 是否连接成功
          clearInterval(interval); // 连接成功，清除定时器
          resolve(); // 继续执行订阅操作
        }
      }, 1); // 每 1ms 检查一次连接状态
    });
  };

  // 等待 WebSocketManager 初始化完成
  waitForConnection().then(() => {

    console.log("websocketManager:2");
    console.log(WebSocketManager);
    WebSocketManager.subscribe("/app/chatRoom", (receivedData) => {
      console.log(receivedData);
    });
    // 订阅话题
    WebSocketManager.subscribe("/topic/chatRoom", (receivedData) => {
      if (receivedData.messageType === "DAYTALK") {
        console.log("准备推送！！！！")
        console.log(receivedData)
        messages.value.push(receivedData);
        if (messages.value.length > 100) {
          messages.value = messages.value.slice(-100);
        }
        // 在新消息后判断是否滚动到底部
        const container = messagesContainer.value.$el;
        if (container) {
          console.log("scrollHeight:", container.scrollHeight);
          console.log("scrollTop:", container.scrollTop);
          console.log("clientHeight:", container.clientHeight);
          console.log("scrollTop + clientHeight:", container.scrollTop + container.clientHeight);

          const isAtBottom = Math.abs(container.scrollTop + container.clientHeight - container.scrollHeight) <= 1;
          if (isAtBottom) {
            nextTick(() => {
              container.scrollTop = container.scrollHeight; // 滚动到底部
            });
          }
        }

      }
      if (receivedData.messageType === "GM") {
        onlineUsers.value = JSON.parse(receivedData.messageContent);
        console.log(onlineUsers.value);
        //todo
      }
    });
    WebSocketManager.subscribe(`/user/queue/${roomId}/messages`, (receivedData) => {
      receivedData.forEach(msg => {
        messages.value.push(msg);
        if (messages.value.length > 100) {
          messages.value = messages.value.slice(-100);
        }
      });
    });
  })
});

// socket连接关闭时取消订阅
onUnmounted(() => {
  // 取消订阅话题
  WebSocketManager.unsubscribe("/topic/chatRoom");
  WebSocketManager.unsubscribe("/app/chatRoom");
  WebSocketManager.unsubscribe(`/user/queue/${roomId}/messages`);
});
</script>

<style scoped>
.message-input-container {
  display: flex;
  gap: 10px;
  /* 输入框与发送按钮的间距 */
}

.chat-room-container {
  width: 100%;
  margin: 20px auto;
}

.header-card {
  text-align: center;
  margin-bottom: 20px;
}

.main-content {
  margin-bottom: 20px;
  background-color: green;
  height: 100%;
}

.messages-section {
  height: 60vh;

  overflow-y: auto;
  overflow-x: hidden;
  /* 禁用横向滚动条 */
}

.message-card {
  width: 100%;
  min-height: 60vh;
  display: flex;
  flex-direction: column;
}

.message {
  padding-top: 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid #ddd;
}

.message:last-child {
  border-bottom: none;
}

.message-line {
  display: flex;
  align-items: flex-start;
  /* 让名字和内容顶部对齐 */
}

.user {
  flex-shrink: 0;
  /* 名字部分不被压缩 */
  margin-right: 8px;
  /* 名字和内容的间距 */
  font-weight: bold;
  color: #409eff;
}

.content {
  white-space: pre-wrap;
  /* 保留换行符 */
  word-break: break-word;
  /* 长单词自动换行 */
}


.actions-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.input-section {
  display: flex;
  gap: 10px;
  align-items: left;
  flex-direction: column;
  /* 垂直排列 */
  gap: 10px;
  /* 控制器与输入框的间距 */
}


.message-input {
  flex: 1;
}

.online-users-section {
  flex: 1;
  height: 60vh;

  border-left: 1px solid #ddd;

}

.online-users-card {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow-y: hidden;
}

.message-user {
  flex: 1;
  /* 用户名占一部分宽度 */
  max-width: 70px;
  /* 用户名的最大宽度 */
  word-wrap: break-word;
  /* 超过宽度换行 */
  overflow-wrap: break-word;
  /* 超过宽度换行 */
  flex-shrink: 0;
  /* 不允许缩小用户名的宽度 */
  font-weight: bold;
  text-align: right;
}

.message-content {
  white-space: pre-wrap;
  flex: 3;
  /* 消息内容占较大宽度 */
  padding-left: 5px;
  word-wrap: break-word;
}

.content {
  padding: 1px;
  background-color: rgb(248, 156, 19);
}
</style>
