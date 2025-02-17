<template>
  <div class="content" :style="{ backgroundColor: backgroundColorGameState }">
    <div class="chat-room-container">
      <!-- 标题 -->
      <el-card class="header-card" shadow="always" height="400px">
        <div>
          <el-button v-if="gameState == '' && !isUserInRoom && gameEnd != true && room" type="primary"
            @click="PlayerNameVisible = true">
            加入游戏
          </el-button>
          <el-button v-else-if="gameState == '' && gameEnd != true && room" type="danger"
            @click="LeftRoom(room.roomId, user.userId)">
            退出房间
          </el-button>
          <el-button v-if="gameState == '' && isRoomCreator && gameEnd != true && room" type="primary"
            @click="GameSettingVisible = true">
            修改设定
          </el-button>
          <el-button v-if="gameState == '' && isRoomCreator && gameEnd != true && room" type="primary"
            @click="StartGame()">
            开始游戏
          </el-button>
          <el-button v-if="gameState == '' && isUserInRoom && !Ready && gameEnd != true && room" type="primary"
            @click="doReady(true)">
            准备
          </el-button>
          <el-button v-else-if="gameState == '' && isUserInRoom && gameEnd != true && room" type="danger"
            @click="doReady(false)">
            取消准备
          </el-button>
          &nbsp;
          <el-select v-model="nowSelectPlayer" placeholder="选择玩家"
            v-if="gameState == '' && isRoomCreator && gameEnd != true && room">
            <el-option v-for="player in room.players" :key="player.roomPlayerId" :label="player.name"
              :value="player.roomPlayerId" />
          </el-select>

          <el-button v-if="gameState == '' && isRoomCreator && gameEnd != true && room" type="danger"
            :disabled="!nowSelectPlayer" @click="kickPlayer(nowSelectPlayer)">
            踢出玩家
          </el-button>
          <el-popover placement="bottom" title="游戏配置" :width="200" trigger="hover">
            <template #default>
              <div>
                <p>首日牺牲者安全性：{{ room?.gameSettings?.isFirstVictims ? "开" : "关" }}</p>
                <p>希望役职制：{{ room?.gameSettings?.isHopeMode ? "开" : "关" }}</p>
                <p>白天时间：{{ room?.gameSettings?.dayDuration }}秒</p>
                <p>夜晚时间：{{ room?.gameSettings?.nightDuration }}秒</p>
                <p>投票时间：{{ room?.gameSettings?.voteDuration }}秒</p>
                <p>黎明时间：{{ room?.gameSettings?.morningDuration }}秒</p>
                <p>n秒规则：{{ room?.gameSettings?.nSecondRule }}秒</p>
                <p>房间创建者：{{ room?.user?.username }}</p>
                <p>GM制：{{ room?.gameSettings?.gmMode ? "开" : "关" }}</p>
              </div>
            </template>

            <!-- 触发 popover 的按钮 -->
            <template #reference>
              <el-button class="m-2" @click="visible = !visible">
                查看游戏配置
              </el-button>
            </template>
          </el-popover>
          <el-popover placement="bottom" title="村规" :width="200" trigger="hover">
            <!-- 使用 slot 传入 Vue 模板内容 -->
            <template #default>
              <div>
                <p>{{ room.villageRule }}</p>
              </div>
            </template>

            <!-- 触发 popover 的按钮 -->
            <template #reference>
              <el-button class="m-2" @click="visible = !visible">
                查看村规
              </el-button>
            </template>
          </el-popover>
          <el-button v-if="gameState == '' && isRoomCreator && gameEnd != true && room" type="danger"
            @click="DestoryRoom()">
            废弃房间
          </el-button>
        </div>
        <br>

        <span style="font-size: 18px; font-weight: bold; margin-right: 10px;">
          #{{ room?.roomId }}
        </span>
        <span style="font-size: 16px; font-weight: bold; margin-right: 10px;">
          {{ room?.roomTitle }}
        </span>


        <br>
        {{ room?.roomDescription || "暂无描述" }}
        <br>
        <el-tag class="uranai-tag" :style="{ fontSize: '16px' }">当前游戏状态：{{ gameState ? gameState + dayNum :
          getRoomState()
        }}</el-tag>
        &nbsp;
        <el-tag class="uranai-tag" :style="{ fontSize: '16px' }">您的身份：{{ identityName || "暂无职业" }}</el-tag> &nbsp;
        <el-tag class="uranai-tag" :style="{ fontSize: '16px' }" v-if="gameState">剩余时间：{{ times || 0 }}秒 &nbsp;</el-tag>
        <!-- 当前配置：{{ gameSettings?.identityList }} -->
        <el-tag class="uranai-tag" :style="{ fontSize: '16px' }">配役：{{ formattedIdentityListCount }}</el-tag>
        <el-tag class="uranai-tag" :style="{ fontSize: '16px' }" v-if="partners?.length">
          同伴：
          <span v-for="(partner, index) in partners" :key="partner.roomPlayerId">
            {{ partner?.name }}<span v-if="index !== partners?.length - 1">, </span>
          </span>
        </el-tag>
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
                <div class="message-line" :class="getMessageClass(msg.messageType)">
                  <div v-if="msg.messageType !== 'SYSTEM'" class="message-user">
                    <span class="user" v-if="msg.playerName != null">{{ getMsgTitle(msg).playerName + ":" }}</span>
                  </div>
                  <div class="message-content"
                    :style="{ color: msg.fontColor, fontSize: msg.fontSize ? msg.fontSize : fontSize }">
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
            <div class="scroll-container">
              <el-row>
                <el-col v-for="(user, index) in room.players" :key="index" :span="12">
                  <el-card shadow="hover" class="player-card">
                    <div class="player-container">
                      <!-- 头像 -->
                      <el-avatar :src="defaultAvatar" size="50" shape="square" class="player-avatar" />
                      <!-- 玩家信息 -->
                      <div class="player-info">
                        <router-link :to="{ name: 'UserProfile', params: { userId: user.userId } }" class="user-link">
                          {{ user.name }}
                        </router-link>
                        <span v-if="!user.isAlive">[死亡]</span>
                        <div class="player-status">
                          <span v-if="user.isReady && gameState == '' && !gameEnd">[Ready]</span>
                          <span v-if="GM_IdentityRoom?.players">
                            {{GM_IdentityRoom.players.find(player => player.roomPlayerId ===
                              user.roomPlayerId)?.identity?.name
                              || ""}}
                          </span>
                        </div>
                      </div>
                    </div>
                  </el-card>
                </el-col>
              </el-row>
            </div>
          </el-card>
        </el-col>

      </el-row>

      <!-- 输入框 -->
      <el-row class="input-section">
        <el-card class="enter-card" shadow="always">
          <div class="control-panel">
            <!-- 固定颜色选择器 -->
            <el-select v-model="fontColor" placeholder="选择颜色" class="color-selector">
              <el-option label="默认" value="default"></el-option>
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

            <!-- 频道选择器 -->
            <el-select v-model="nowSendChannel" placeholder="发言种类" class="font-size-selector">
              <el-option v-for="channel in filteredChannels" :key="channel.value" :label="channel.label"
                :value="channel.value"></el-option>
            </el-select>

            <!-- 占卜 -->
            <el-tag v-if="needUranai" class="uranai-tag">选择需要占卜的对象</el-tag>
            <el-select v-if="needUranai" v-model="nowSelectPlayer" placeholder="占卜师的行动" class="font-size-selector">
              <el-option v-if="needUranai" v-for="player in room.players?.filter(player => player.isAlive == true)"
                :key="player.roomPlayerId" :label="player.name" :value="player.roomPlayerId"></el-option>
            </el-select>
            <el-button v-if="needUranai" type="primary"
              @click="sendGameActionBody(ConstConfig.GAME_ACTION_URANAI)">确定行动</el-button>

            <!-- 猎人 -->
            <el-tag v-if="needKariudo" class="uranai-tag">选择需要守护的对象</el-tag>
            <el-select v-if="needKariudo" v-model="nowSelectPlayer" placeholder="猎人的行动" class="font-size-selector">
              <el-option v-if="needKariudo" v-for="player in room.players?.filter(player => player.isAlive == true)"
                :key="player.roomPlayerId" :label="player.name" :value="player.roomPlayerId"></el-option>
            </el-select>
            <el-button v-if="needKariudo" type="primary"
              @click="sendGameActionBody(ConstConfig.GAME_ACTION_KARIUDO)">确定行动</el-button>

            <!-- 投票 -->
            <el-tag v-if="needVote" class="uranai-tag">选择需要投票的对象</el-tag>
            <el-select v-if="needVote" v-model="nowSelectPlayer" placeholder="请投票" class="font-size-selector">
              <el-option v-if="needVote" v-for="player in room.players?.filter(player => player.isAlive == true)"
                :key="player.roomPlayerId" :label="player.name" :value="player.roomPlayerId"></el-option>
            </el-select>
            <el-button v-if="needVote" type="primary"
              @click="sendGameActionBody(ConstConfig.GAME_ACTION_VOTE)">确定行动</el-button>

            <!-- 狼咬 -->
            <el-tag v-if="needKami" type="danger" class="uranai-tag">选择需要咬的对象</el-tag>
            <el-select v-if="needKami" v-model="nowSelectPlayer" placeholder="确定狼咬对象" class="font-size-selector">
              <el-option v-if="needKami" v-for="player in room.players?.filter(player => player.isAlive == true)"
                :key="player.roomPlayerId" :label="player.name" :value="player.roomPlayerId"></el-option>
            </el-select>
            <el-button v-if="needKami" type="danger"
              @click="sendGameActionBody(ConstConfig.GAME_ACTION_KAMI)">确定行动</el-button>

            <el-select v-if="gameState !== '' && isRoomCreator && gameEnd != true && identityName == 'GM'" v-model="nowSelectPlayer" placeholder="游戏管理" class="font-size-selector">
              <el-option v-if="gameState !== '' && isRoomCreator && gameEnd != true && identityName == 'GM'" v-for="player in GM_IdentityRoom.players?.filter(player => player.identity.name != 'GM')"
                :key="player.roomPlayerId" :label="player.name" :value="player.roomPlayerId"></el-option>
            </el-select>
            <el-button v-if="gameState !== '' && isRoomCreator && gameEnd != true && identityName == 'GM'" type="danger"
              @click="sendGameActionBody(ConstConfig.GAME_GM_KILL)">处死玩家</el-button>
            <el-button v-if="gameState !== '' && isRoomCreator && gameEnd != true && identityName == 'GM'" type="primary"
              @click="sendGameActionBody(ConstConfig.GAME_GM_REVIVE)">复活玩家</el-button>

            <!-- GM操作时间 -->
            <el-button v-if="gameState !== '' && isRoomCreator && gameEnd != true && identityName == 'GM'" type="danger"
              @click="sendGameActionBody(ConstConfig.GAME_ACTION_GM_TIME_LONG)">延长20秒</el-button>
            <el-button v-if="gameState !== '' && isRoomCreator && gameEnd != true && identityName == 'GM'" type="danger"
              @click="sendGameActionBody(ConstConfig.GAME_ACTION_GM_TIME_SHORT)">缩短20秒</el-button>
          </div>

          <!-- 下方输入框和发送按钮 -->
          <div class="message-input-container">
            <el-input v-model="messageContent" placeholder="输入你的消息..." clearable class="message-input"
              :autosize="{ minRows: 2, maxRows: 5 }" type="textarea" @keydown.enter.native="handleEnterKey"></el-input>
            <el-button type="primary" :disabled="gameState == 'SILENT'" @click="sendMessage">发送</el-button>
          </div>
        </el-card>
      </el-row>

      <!-- 职业数量控制表单 -->
      <el-dialog v-model="GameSettingVisible" title="设置职业数量">
        <el-form :model="GameSettingForm">
          <el-row>
            <el-col :span="12">
              <el-form-item label="人狼数量">
                <el-input-number v-model="GameSettingForm.jinrouCount" :min="0" label="人狼数量" />
              </el-form-item>

              <el-form-item label="占卜师数量">
                <el-input-number v-model="GameSettingForm.uranaishiCount" :min="0" label="占卜师数量" />
              </el-form-item>

              <el-form-item label="灵能者数量">
                <el-input-number v-model="GameSettingForm.reibaiCount" :min="0" label="灵能者数量" />
              </el-form-item>

              <el-form-item label="猎人数量">
                <el-input-number v-model="GameSettingForm.kairiudoCount" :min="0" label="猎人数量" />
              </el-form-item>

              <el-form-item label="共有者数量">
                <el-input-number v-model="GameSettingForm.kyouyuuCount" :min="0" label="共有者数量" />
              </el-form-item>

              <el-form-item label="狂人数量">
                <el-input-number v-model="GameSettingForm.kyoujinCount" :min="0" label="狂人数量" />
              </el-form-item>

              <el-form-item label="狂信者数量">
                <el-input-number v-model="GameSettingForm.kyoushinjyaCount" :min="0" label="狂信者数量" />
              </el-form-item>

              <el-form-item label="妖狐数量">
                <el-input-number v-model="GameSettingForm.kitsuneCount" :min="0" label="妖狐数量" />
              </el-form-item>

              <el-form-item label="背德者数量">
                <el-input-number v-model="GameSettingForm.haitokushyaCount" :min="0" label="背德者数量" />
              </el-form-item>

              <el-form-item label="猫又数量">
                <el-input-number v-model="GameSettingForm.nekomataCount" :min="0" label="猫又数量" />
              </el-form-item>

              <el-form-item label="村人数量">
                <span :style="{ fontSize: '15px' }">{{ GameSettingForm.gmMode ? room.players.length -
                  GameSettingForm.reibaiCount -
                  GameSettingForm.uranaishiCount - GameSettingForm.jinrouCount - GameSettingForm.kairiudoCount -
                  GameSettingForm.kyouyuuCount - GameSettingForm.kyoujinCount -
                  GameSettingForm.kitsuneCount - GameSettingForm.haitokushyaCount -
                  GameSettingForm.kyoushinjyaCount - GameSettingForm.nekomataCount : room.players.length -
                  GameSettingForm.reibaiCount -
                  GameSettingForm.uranaishiCount - GameSettingForm.jinrouCount - GameSettingForm.kairiudoCount -
                  GameSettingForm.kyouyuuCount - GameSettingForm.kyoujinCount -
                  GameSettingForm.kitsuneCount - GameSettingForm.haitokushyaCount -
                  GameSettingForm.kyoushinjyaCount - GameSettingForm.nekomataCount + 1 }}</span>
              </el-form-item>

              <el-form-item label="首日牺牲者安全性">
                <el-radio-group v-model="GameSettingForm.isFirstVictims">
                  <el-radio :label="true">是</el-radio>
                  <el-radio :label="false">否</el-radio>
                </el-radio-group>
              </el-form-item>


              <el-form-item label="希望役职制">
                <el-radio-group v-model="GameSettingForm.isHopeMode">
                  <el-radio :label="false">普通</el-radio>
                  <el-radio :label="true">希望制</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="GM制">
                <el-radio-group v-model="GameSettingForm.gmMode">
                  <el-radio :label="false">关闭</el-radio>
                  <el-radio :label="true">开启</el-radio>
                </el-radio-group>
              </el-form-item>

              <el-form-item label="白天时间 (秒)">
                <el-input-number v-model="GameSettingForm.dayDuration" :min="1" :max="300" label="白天时间 (秒)"
                  :step="30" />
              </el-form-item>

              <el-form-item label="夜晚时间 (秒)">
                <el-input-number v-model="GameSettingForm.nightDuration" :min="1" :max="300" label="夜晚时间 (秒)"
                  :step="30" />
              </el-form-item>

              <el-form-item label="投票时间 (秒)">
                <el-input-number v-model="GameSettingForm.voteDuration" :min="1" :max="300" label="投票时间 (秒)"
                  :step="30" />
              </el-form-item>

              <el-form-item label="黎明时间 (秒)">
                <el-input-number v-model="GameSettingForm.morningDuration" :min="1" :max="300" label="黎明时间 (秒)"
                  :step="30" />
              </el-form-item>

              <el-form-item label="n秒规则" label-wid="200px">
                <el-input-number v-model="GameSettingForm.nSecondRule" :min="0" :max="60" label="n秒规则" :step="5" />
              </el-form-item>


            </el-col>

            <el-col :span="12">
              <el-form-item label="选择默认配置">
                <el-select v-model="selectedConfig" placeholder="选择一个配置" @change="applySelectedConfig(selectedConfig)">
                  <el-option label="默认配置" value="default" />
                  <el-option label="配置A" value="A1" />
                  <el-option label="配置B" value="B2" />
                </el-select>
              </el-form-item>
            </el-col>
          </el-row>

        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="GameSettingVisible = false">取消</el-button>
            <el-button type="primary" @click="handleGameSettingConfirm(GameSettingForm)">
              确定
            </el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 加入名字弹窗 -->
      <el-dialog v-model="PlayerNameVisible" title="匿名名称"
        @keydown.enter.prevent="JoinRoom(roomId, user.userId, PlayerNameForm.playerName)">
        <el-form :model="PlayerNameForm">
          <el-form-item label="名称">
            <el-input v-model="PlayerNameForm.playerName" autocomplete="off" />
          </el-form-item>
        </el-form>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="PlayerNameVisible = false">取消</el-button>
            <el-button type="primary" @click="JoinRoom(roomId, user.userId, PlayerNameForm.playerName)">
              加入
            </el-button>
          </div>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { onMounted, onUnmounted, ref, nextTick, watch, reactive, computed } from 'vue';
import WebSocketManager from '@/net/websocket-manager';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from '@/stores';
import { format } from 'date-fns';
import { get, post } from '@/net';
import { preGameSettings } from '@/js/gameconfig';
import * as ConstConfig from '@/js/constant.js';


const fontColor = ref(''); // 默认黑色
const fontSize = ref('14px'); // 默认 14px
const store = useStore();
const route = useRoute();
const user = store.auth.user;
// 房间ID 判断 route.params.roomId 是否存在，不存在时使用 store 中的 auth.nowRoomId
var roomId = ref(0);
roomId.value = route.params.roomId == "none" ? store.auth.nowRoomId : route.params.roomId;
// 获取房间信息
var room = ref(0);
var player = ref();
var dayNum = ref();

store.auth.nowRoomId = roomId.value;  // 保存房间 ID 到 store
// 动态获取messages 用于渲染聊天内容
var messages = ref([]);
// 动态获取在线用户列表
var onlineUsers = ref([]);

const messageContent = ref(''); // 动态获取输入框内容
// 引用消息容器DOM
const messagesContainer = ref(null);

// 游戏系统变量 动态控制订阅频道
var GAME_SYSTEM_CHANNEL = ref(["ALL"]);
var GAME_SENDVALIABLE_CHANNEL = ref(["ALL"]);
// 当前游戏状态对象
var gameState = ref('');
var nowSendChannel = ref('');
var isUserInRoom = ref(false);
var Ready = ref(false)
var playerName = ref(user.username);
var isRoomCreator = ref(false)
const GameSettingVisible = ref(false)
const PlayerNameVisible = ref(false)
var identityListCount = reactive({

})
var identityName = ref('')
// 预设配置变量
var selectedConfig = ref('');
var times = ref(0)
//定时器，显示时间
var intervalId = null;
var gameEnd = ref(false);
var backgroundColorGameState = ref('');
var needUranai = ref(false);
var needVote = ref(false);
var needKariudo = ref(false);
var needKami = ref(false);
var nowSelectPlayer = ref('');
var GM_IdentityRoom = ref(''); //给GM存储场上职业的对象
var partners = ref();

var channels = ref([
  { label: '全体发言', value: 'ALL' },
  { label: '观战发言', value: 'WATCHTALK' },
  { label: '自言自语', value: 'SELFTALK' },
  { label: '白天发言', value: 'DAYTALK' },
  { label: '人狼的对话', value: 'WOLFTALK' },
  { label: '共有者的对话', value: 'KYOUYUUTALK' },
  { label: '妖狐的对话', value: 'KITSUNETALK' },
  { label: '灵界对话', value: 'UNDERTALK' }
]);

// 处理 Enter 和 Shift+Enter
const handleEnterKey = (event) => {
  if (!event.shiftKey) {
    event.preventDefault(); // 阻止默认行为（换行）
    sendMessage();
  }
};

const GameSettingForm = ref({
  jinrouCount: 0,
  uranaishiCount: 0,
  reibaiCount: 0,
  kairiudoCount: 0,
  murabitoCount: 0,
  kyouyuuCount: 0,
  kyoujinCount: 0,
  kyoushinjyaCount: 0,
  kitsuneCount: 0,
  haitokushyaCount: 0,
  nekomataCount: 0,
  isFirstVictims: false,
  isHopeMode: false,
  dayDuration: 30,
  nightDuration: 30,
  voteDuration: 30,
  morningDuration: 30,
  nSecondRule: 20,
  gmMode: false
})

const PlayerNameForm = ref({
  playerName: ''
})
// 发送消息
const sendMessage = () => {
  if (messageContent.value == '') {
    ElMessage.error("消息不可为空");
    return
  }
  const user = store.auth.user;
  const messageData = {
    roomId: roomId.value,
    userId: user.userId,
    playerName: playerName.value,
    messageType: nowSendChannel.value,
    messageTime: format(new Date(), 'yyyy-MM-dd HH:mm:ss'),
    messageContent: messageContent.value,
    fontColor: fontColor.value, // 发送字体颜色
    fontSize: fontSize.value    // 发送字体大小
  };

  // 判断 nowSendChannel.value 是否在 channels 数组中
  const isValidChannel = channels.value.some(channel => channel.value === nowSendChannel.value);

  if (!isValidChannel) {
    // 如果不在频道列表中，认为是私聊
    messageData.messageGmToPlayerId = nowSendChannel.value;  // 设置为目标玩家的名字或其他标识
    messageData.messageType = "SELFTALK"
  }

  WebSocketManager.sendMessage(`/app/room/${roomId.value}/${nowSendChannel.value}`, messageData, (callbackData) => {
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
    //个人频道
    WebSocketManager.subscribe(`/user/queue/${roomId.value}/messages`, (receivedData) => {
      if (receivedData.code) {
        //1.说明是游戏状态对象GameActionBody
        handleGameActionBody(receivedData);
      } else if (Array.isArray(receivedData)) {
        // 说明是消息列表
        receivedData.forEach((msg) => {
          messages.value.push(msg);
          goToBottom();
        });
      } else {
        // 说明是单个消息
        messages.value.push(receivedData);
        goToBottom();
      }

    });

    // 获得初始聊天消息 只作通知服务端用 从个人频道收到消息
    WebSocketManager.subscribe(`/app/room/${roomId.value}`, (receivedData) => {
    });
    // 订阅GAME_SYSTEM_CHANNEL中的话题，后续watch函数监听变化后订阅
    GAME_SYSTEM_CHANNEL.value.forEach((channel) => {
      if (channel === 'SELFTALK') {
        return;  // 不订阅SELFTALK频道
      }

      const topic = `/topic/room/${roomId.value}/${channel}`;
      WebSocketManager.subscribe(topic, (receivedData) => {
        try {
          console.log(receivedData.code);
          // 根据字段特性判断
          if (receivedData.code) {
            // 处理 GameActionBody
            handleGameActionBody(receivedData);
          } else if (receivedData.messageType) {
            // 处理 Message
            handleReceivedMessage(receivedData);
          } else {
            console.warn("未知数据类型：", receivedData);
          }
        } catch (error) {
          console.error("处理订阅消息时发生错误：", error, receivedData);
        }
      });
    });

  })

});

// socket连接关闭时取消订阅
onUnmounted(() => {
  GAME_SYSTEM_CHANNEL.value.forEach((channel) => {
    const topic = `/topic/room/${roomId.value}/${channel}`;
    WebSocketManager.unsubscribe(topic);
  });
  WebSocketManager.unsubscribe(`/user/queue/${roomId.value}/messages`);
});

// 监听 GAME_SYSTEM_CHANNEL 变化，动态订阅/取消订阅
watch(GAME_SYSTEM_CHANNEL, (NEW_GAME_SYSTEM_CHANNEL, OLD_GAME_SYSTEM_CHANNEL) => {
  // 找出新增和移除的频道
  const addedChannels = NEW_GAME_SYSTEM_CHANNEL.filter((state) => !OLD_GAME_SYSTEM_CHANNEL.includes(state));
  const removedChannels = OLD_GAME_SYSTEM_CHANNEL.filter((state) => !NEW_GAME_SYSTEM_CHANNEL.includes(state));
  console.log(GAME_SYSTEM_CHANNEL)
  // 对新增频道进行订阅
  addedChannels.forEach((channel) => {
    const topic = `/topic/room/${roomId.value}/${channel}`;
    WebSocketManager.subscribe(topic, (receivedData) => {
      if (receivedData.code) {
        // 处理 GameActionBody
        handleGameActionBody(receivedData);
      } else if (receivedData.messageType) {
        // 处理 Message
        handleReceivedMessage(receivedData);
      } else {
        console.warn("未知数据类型：", receivedData);
      }
    });
  });

  // 对移除频道取消订阅
  removedChannels.forEach((channel) => {
    const topic = `/topic/room/${roomId.value}/${channel}`;
    WebSocketManager.unsubscribe(topic);
  });
});

// 监听 times 的变化
watch(times, (newVal) => {

});

// 消息显示与滚动的处理函数
const handleReceivedMessage = (receivedData) => {
  // 显示聊天消息
  messages.value.push(receivedData);
  goToBottom();
};

//处理GameActionBody
const handleGameActionBody = (receivedData) => {
  if (receivedData.code) {
    roomRefresh(receivedData)
    if (receivedData?.message?.messageContent !== undefined && receivedData.message.messageContent !== null) {
      messages.value.push(receivedData.message);
      goToBottom();
    }
    if (receivedData.code == ConstConfig.GAME_STATUS_IS_OVER) {
      gameEnd.value = true;
    }
  }
};

//加入房间
function JoinRoom(roomId, userId, name) {
  if(name.length > 8){
    ElMessage.error(`名字长度不可超过8字符`);
    return;
  }
  playerName.value = name;
  return new Promise((resolve, reject) => {
    post(`/api/rooms/joinRoom`, {
      roomId: roomId,
      userId: userId,
      name: name
    }, (response) => {
      const { data } = response;
      const { message } = response;
      if (message && data) {
        playerName.value = data
        PlayerNameVisible.value = false;
        resolve(); // 异步操作成功时调用 resolve
      } else {
        ElMessage.error(`错误：${message}`);
        reject(new Error(message)); // 异步操作失败时调用 reject
      }
    });
  });
}
//退出房间
function LeftRoom(roomId, userId) {
  return new Promise((resolve, reject) => {
    post(`/api/rooms/leftRoom`, {
      roomId: roomId,
      userId: userId,
    }, (response) => {
      const { data } = response;
      const { message } = response;
      if (message && data) {
        playerName.value = user.username;
        resolve(); // 异步操作成功时调用 resolve
      } else {
        ElMessage.error(`错误：${message}`);
        reject(new Error(message)); // 异步操作失败时调用 reject
      }
    }, (message) => {
      ElMessage.error(`获取房间失败：${message}`);
      reject(new Error(message)); // 如果请求失败，也调用 reject
    });
  });
}

// 点击确认更改游戏设定按钮的逻辑
const handleGameSettingConfirm = async (gameSetting) => {
  const identityList = [];

  // 添加职业到 identityList
  for (let i = 0; i < gameSetting.jinrouCount; i++) {
    identityList.push("人狼");
  }
  for (let i = 0; i < gameSetting.uranaishiCount; i++) {
    identityList.push("占卜师");
  }
  for (let i = 0; i < gameSetting.reibaiCount; i++) {
    identityList.push("灵能者");
  }
  for (let i = 0; i < gameSetting.kairiudoCount; i++) {
    identityList.push("猎人");
  }
  for (let i = 0; i < gameSetting.kyouyuuCount; i++) {
    identityList.push("共有者");
  }
  for (let i = 0; i < gameSetting.kyoujinCount; i++) {
    identityList.push("狂人");
  }
  for (let i = 0; i < gameSetting.kyoushinjyaCount; i++) {
    identityList.push("狂信者");
  }
  for (let i = 0; i < gameSetting.kitsuneCount; i++) {
    identityList.push("妖狐");
  }
  for (let i = 0; i < gameSetting.haitokushyaCount; i++) {
    identityList.push("背德者");
  }
  for (let i = 0; i < gameSetting.nekomataCount; i++) {
    identityList.push("猫又");
  }

  const ChangeGameSetting = async (gameSetting, identityList) => {
    return new Promise((resolve, reject) => {
      post(`/api/rooms/changeGameSettings?roomId=${roomId.value}`, {
        isFirstVictims: gameSetting.isFirstVictims,
        isHopeMode: gameSetting.isHopeMode,
        dayDuration: gameSetting.dayDuration,
        nightDuration: gameSetting.nightDuration,
        voteDuration: gameSetting.voteDuration,
        morningDuration: gameSetting.morningDuration,
        nSecondRule: gameSetting.nSecondRule,
        hunterContinuousGuarding: gameSetting.hunterContinuousGuarding,
        gmMode: gameSetting.gmMode,
        identityList: identityList
      }, (response) => {
        const { data } = response;
        const { message } = response;
        if (message && data) {
          // getRoomAndPlayersById(roomId.value)
          resolve(data); // 异步操作成功时调用 resolve
        } else {
          ElMessage.error(`更改操作失败：${message}`);
          reject(new Error(message)); // 异步操作失败时调用 reject
        }
      }, (message) => {
        ElMessage.error(`更改失败：${message}`);
        reject(new Error(message)); // 如果请求失败，也调用 reject
      });
    });
  };

  //异步操作等待请求
  try {
    const createdRoomId = await ChangeGameSetting(GameSettingForm.value, identityList);
    GameSettingVisible.value = false;
    ElMessage.success("配置修改成功！");
    console.log("创建的房间 ID:", createdRoomId); // 调试用
  } catch (error) {
    ElMessage.error(error.message || "配置修改失败，请重试！");
  }
};

// 更新配置预设
function applySelectedConfig(value) {
  // 从 gameSettings 对象中获取对应的配置
  selectedConfig.value = value == 'default' ? null : preGameSettings[value];

  if (selectedConfig.value != null) {
    // 使用 Object.assign 将配置值更新到 GameSettingForm 中
    Object.assign(this.GameSettingForm, selectedConfig.value);
  }
}

// 点击提交游戏开始请求
const StartGame = async () => {
  if (identityListCount.value["村人"] < 0 || identityListCount.value["人狼"] == undefined) {
    ElMessage.error("配置不符合要求，请检查！")
    return;
  }
  const GameStartRequest = async (roomId) => {
    return new Promise((resolve, reject) => {
      post(`/api/game/startGame`, {
        roomId: roomId.value
      }, (response) => {
        const { data } = response;
        const { message } = response;
        if (message && data) {
          resolve(data); // 异步操作成功时调用 resolve
        }
      }, (response) => {
        reject(new Error(response.message)); // 如果请求失败，也调用 reject
      });
    });
  };

  // 逻辑处理
  try {
    await GameStartRequest(roomId);
    ElMessage.success("启动成功！");
  } catch (error) {
    ElMessage.error(error.message || "配置修改失败，请重试！");
  }
};

// 点击提交废村请求
const DestoryRoom = async () => {
  const DestoryRoomRequest = async (roomId) => {
    return new Promise((resolve, reject) => {
      post(`/api/rooms/destoryRoom`, {
        roomId: roomId.value
      }, (response) => {
        const { data } = response;
        const { message } = response;
        if (message && data) {
          resolve(data); // 异步操作成功时调用 resolve
        }
      }, (response) => {
        reject(new Error(response.message)); // 如果请求失败，也调用 reject
      });
    });
  };

  // 逻辑处理
  try {
    await DestoryRoomRequest(roomId);
    ElMessage.success("废弃成功！");
  } catch (error) {
    ElMessage.error(error.message || "失败，请重试！");
  }
};

// 点击提交踢人请求
const kickPlayer = async (roomPlayerId) => {
  const kickPlayerRequest = async (roomPlayerId) => {
    return new Promise((resolve, reject) => {
      post(`/api/rooms/kickPlayer`, {
        roomId: roomId.value,
        roomPlayerId: roomPlayerId
      }, (response) => {
        const { data } = response;
        const { message } = response;
        if (message && data) {
          resolve(data); // 异步操作成功时调用 resolve
        }
      }, (response) => {
        reject(new Error(response.message)); // 如果请求失败，也调用 reject
      });
    });
  };

  // 逻辑处理
  try {
    await kickPlayerRequest(roomPlayerId);
    ElMessage.success("踢出成功！");
    nowSelectPlayer.value = '';
  } catch (error) {
    ElMessage.error(error.message || "失败，请重试！");
  }
};


function roomRefresh(gameActionBody) {
  // 最基础的房间信息初始化
  room.value = gameActionBody.room
  if (gameActionBody.code == ConstConfig.ROOM_INITIAL
    || gameActionBody.code == ConstConfig.GAME_SELF_IDENTITY) {
    if (gameActionBody.identityName == "GM" || room.value.roomState == "ENDED" || room.value.roomState == "DISCARDED") {
      GM_IdentityRoom.value = gameActionBody.room;
    } else {
      GM_IdentityRoom.value = '';
    }
    if (gameActionBody.partners != null || gameActionBody.partners != undefined) {
      partners.value = room.value.players.filter(player =>
        gameActionBody.partners.includes(player.roomPlayerId)
      );
    }
  }
  if ((gameActionBody.code == ConstConfig.GAME_WOLF_HAS_KAMI)) {
    needKami.value = false;
  }
  if (gameActionBody.code == ConstConfig.GAME_STATUS_IS_OVER || room.value.roomState == "ENDED" || room.value.roomState == "DISCARDED") {
    gameEnd.value = true;
  }
  player.value = gameActionBody.room.players.find(player => player.userId == user.userId)
  // 对gamesetting的职业列表进行计数
  identityListCount.value = room.value.gameSettings.identityList.reduce((acc, value) => {
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
  // 计算 "村人" 数量
  var totalPlayers = gameActionBody.room.players.length;
  if (gameActionBody.gameStarted && gameActionBody.room.gameSettings.gmMode || (gameActionBody.room.gameSettings.gmMode && gameEnd.value)) {   //GM不算玩家
    totalPlayers = totalPlayers - 1;
  } else if (!gameActionBody.gameStarted && !gameActionBody.room.gameSettings.gmMode && !gameEnd.value) {   //GM需要游玩的时候 开始前计算时加上初日牺牲者
    totalPlayers = totalPlayers + 1;
  }
  const jinrouCount = identityListCount.value["人狼"] || 0;
  const uranaishiCount = identityListCount.value["占卜师"] || 0;
  const reibaiCount = identityListCount.value["灵能者"] || 0;
  const kairiudoCount = identityListCount.value["猎人"] || 0;
  const kyouyuuCount = identityListCount.value["共有者"] || 0;
  const kyoujinCount = identityListCount.value["狂人"] || 0;
  const kyoushinjyaCount = identityListCount.value["狂信者"] || 0;
  const kitsuneCount = identityListCount.value["妖狐"] || 0;
  const haitokushyaCount = identityListCount.value["背德者"] || 0;
  const nekomataCount = identityListCount.value["猫又"] || 0;
  const murabitoCount = totalPlayers - jinrouCount - uranaishiCount - reibaiCount - kairiudoCount - kyouyuuCount - kyoujinCount - kitsuneCount - haitokushyaCount - kyoushinjyaCount - nekomataCount;
  identityListCount.value["村人"] = murabitoCount;

  //是房主
  if (user.userId == room.value.roomCreatorId) {
    isRoomCreator.value = true;
    //对房主-刷新修改配置列表
    GameSettingForm.value.jinrouCount = identityListCount.value["人狼"] ? identityListCount.value["人狼"] : 0;
    GameSettingForm.value.uranaishiCount = identityListCount.value["占卜师"] ? identityListCount.value["占卜师"] : 0;
    GameSettingForm.value.reibaiCount = identityListCount.value["灵能者"] ? identityListCount.value["灵能者"] : 0;
    GameSettingForm.value.kairiudoCount = identityListCount.value["猎人"] ? identityListCount.value["猎人"] : 0;
    GameSettingForm.value.kyouyuuCount = identityListCount.value["共有者"] ? identityListCount.value["共有者"] : 0;
    GameSettingForm.value.kyoujinCount = identityListCount.value["狂人"] ? identityListCount.value["狂人"] : 0;
    GameSettingForm.value.kyoushinjyaCount = identityListCount.value["狂信者"] ? identityListCount.value["狂信者"] : 0;
    GameSettingForm.value.kitsuneCount = identityListCount.value["妖狐"] ? identityListCount.value["妖狐"] : 0;
    GameSettingForm.value.haitokushyaCount = identityListCount.value["背德者"] ? identityListCount.value["背德者"] : 0;
    GameSettingForm.value.nekomataCount = identityListCount.value["猫又"] ? identityListCount.value["猫又"] : 0;
    GameSettingForm.value.isFirstVictims = room.value.gameSettings["isFirstVictims"] ? room.value.gameSettings["isFirstVictims"] : false;
    GameSettingForm.value.isHopeMode = room.value.gameSettings["isHopeMode"] ? room.value.gameSettings["isHopeMode"] : false;
    GameSettingForm.value.dayDuration = room.value.gameSettings["dayDuration"] ? room.value.gameSettings["dayDuration"] : 30;
    GameSettingForm.value.nightDuration = room.value.gameSettings["nightDuration"] ? room.value.gameSettings["nightDuration"] : 30;
    GameSettingForm.value.voteDuration = room.value.gameSettings["voteDuration"] ? room.value.gameSettings["voteDuration"] : 30;
    GameSettingForm.value.morningDuration = room.value.gameSettings["morningDuration"] ? room.value.gameSettings["morningDuration"] : 30;
    GameSettingForm.value.nSecondRule = room.value.gameSettings["nSecondRule"] ? room.value.gameSettings["nSecondRule"] : 0;
    GameSettingForm.value.hunterContinuousGuarding = room.value.gameSettings["hunterContinuousGuarding"] ? room.value.gameSettings["hunterContinuousGuarding"] : 0;
    GameSettingForm.value.gmMode = room.value.gameSettings["gmMode"] ? room.value.gameSettings["gmMode"] : false;
  }
  // 检测当前用户是否在房间中
  isUserInRoom.value = room.value.players.some(player => player.userId === user.userId);

  // 如果用户在房间中，获取当前玩家的名字并赋值
  if (isUserInRoom.value) {
    const currentPlayer = room.value.players.find(player => player.userId === user.userId);
    if (currentPlayer) {
      // 存储玩家名字以便发言调用
      Ready.value = currentPlayer.isReady;
      playerName.value = currentPlayer.name;
    }
  } else {
    Ready.value = false;
  }

  //对游戏是否已开始进行初始化
  if (gameActionBody.gameStarted) {
    gameState.value = gameActionBody.dayOrNightOrVote;
    dayNum.value = gameActionBody.dayNum;
    identityName.value = gameActionBody.identityName == null || gameActionBody.identityName == undefined ? identityName.value : gameActionBody.identityName;
    times.value = gameActionBody.seconds;
    //初始化发送频道
    if (gameActionBody.code == ConstConfig.ROOM_INITIAL) {
      if (identityName.value != "GM") {
        if (player.value.isAlive == true) {
          switch (gameActionBody.dayOrNightOrVote) {
            case "DAY":
              nowSendChannel.value = "DAYTALK";
              break;
            case "NIGHT":
              if (identityName.value == "人狼") {
                nowSendChannel.value = "DAYTALK";
              } else if (identityName == "共有者") {
                nowSendChannel.value = "KYOUYUUTALK";
              } else if (identityName == "妖狐") {
                nowSendChannel.value = "KISUNETALK";
              }
              break;
            case "VOTE":
            case "MORNING":
            case "SUSPEND":
              nowSendChannel.value = "SELFTALK";
              break;
          }
        } else {
          nowSendChannel == "SELFTALK"
        }
      } else {
        nowSendChannel.value = "ALL";
      }
    }
    switch (gameActionBody.dayOrNightOrVote) {
      case "DAY":
        backgroundColorGameState.value = "#ffa01e";
        break;
      case "SILENT":
        backgroundColorGameState.value = "#b3a8a8";
        break;
      case "VOTING":
      case "SUSPEND":
        backgroundColorGameState.value = "#ffa01e";
        break;
      case "NIGHT":
        backgroundColorGameState.value = "#1f1c6d";
        break;
      case "MORNING":
        backgroundColorGameState.value = "#c2a152";
        break;
      case null:
        backgroundColorGameState.value = "#ffffff";
        break;
      case undefined:
        backgroundColorGameState.value = "#ffffff";
        break;
    }
    if (player?.value?.isAlive == false) {
      backgroundColorGameState.value = "#ffffff";
    }
    //关于职业操作
    if (isUserInRoom.value == true && player.value.isAlive == true) {
      switch (gameActionBody.code) {
        case ConstConfig.GAME_STATUS_NOT_OVER_TIE:
        case ConstConfig.GAME_STATUS_VOTE:
          if (identityName.value !== "GM" && identityName.value !== "观战者") {
            needVote.value = true;
          }
          needKami.value = false;
          needUranai.value = false;
          needKariudo.value = false;
          break;
        case ConstConfig.GAME_STATUS_NIGHT:
          if (identityName.value == "人狼" && gameActionBody.dayNum != 1) {
            needKami.value = true;
          }
          if (identityName.value == "占卜师") {
            needUranai.value = true;
          }
          if (identityName.value == "猎人" && gameActionBody.dayNum != 1) {
            needKariudo.value = true;
          }
          needVote.value = false;
          break;
        case ConstConfig.GAME_STATUS_DAY:
          needKami.value = false;
          needUranai.value = false;
          needVote.value = false;
          needKariudo.value = false;
          break;
        case ConstConfig.ROOM_INITIAL:
          needKami.value = gameActionBody.needKami;
          needUranai.value = gameActionBody.needUranai;
          needVote.value = gameActionBody.needVote;
          needKariudo.value = gameActionBody.needKariudo;
          break;
        case ConstConfig.GAME_STATUS_IS_OVER:
          needKami.value = false;
          needUranai.value = false;
          needVote.value = false;
          needKariudo.value = false;
          break;
      }
    } else {
      needKami.value = false;
      needUranai.value = false;
      needVote.value = false;
      needKariudo.value = false;
    }
    switch (identityName.value) {
      case "人狼":
        GAME_SYSTEM_CHANNEL.value = ["ALL", "SYSTEM", "DAYTALK", "WOLFTALK", "SELFTALK"];
        if (player.value.isAlive == false) {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK", "UNDERTALK"];
          GAME_SYSTEM_CHANNEL.value.push("UNDERTALK")
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "UNDERTALK";
          break;
        }
        if (gameActionBody.dayOrNightOrVote == "DAY") {
          GAME_SENDVALIABLE_CHANNEL.value = ["DAYTALK", "SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "DAYTALK";
        } else if (gameActionBody.dayOrNightOrVote == "NIGHT") {
          GAME_SENDVALIABLE_CHANNEL.value = ["WOLFTALK", "SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "WOLFTALK";
        } else if (gameActionBody.dayOrNightOrVote == "VOTING") {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "SELFTALK";
        } else if (gameActionBody.dayOrNightOrVote == "SUSPEND") {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "SELFTALK";
        } else {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK"];
          nowSendChannel.value = "SELFTALK"
        }
        break;
      case "占卜师":
      case "村人":
      case "狂人":
      case "狂信者":
      case "猫又":
      case "背德者":
      case "灵能者":
      case "猎人":
        GAME_SYSTEM_CHANNEL.value = ["ALL", "SYSTEM", "DAYTALK", "SELFTALK"];
        if (player.value.isAlive == false) {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK", "UNDERTALK"];
          GAME_SYSTEM_CHANNEL.value.push("UNDERTALK")
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "UNDERTALK";
          break;
        }
        if (gameActionBody.dayOrNightOrVote == "DAY") {
          GAME_SENDVALIABLE_CHANNEL.value = ["DAYTALK", "SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "DAYTALK";
        } else if (gameActionBody.dayOrNightOrVote == "NIGHT") {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "SELFTALK";
        } else if (gameActionBody.dayOrNightOrVote == "VOTING") {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "SELFTALK";
        } else if (gameActionBody.dayOrNightOrVote == "SUSPEND") {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "SELFTALK";
        } else {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK"];
          nowSendChannel.value = "SELFTALK"
        }
        break;
      case "共有者":
        GAME_SYSTEM_CHANNEL.value = ["ALL", "SYSTEM", "DAYTALK", "KYOUYUUTALK", "SELFTALK"];
        if (player.value.isAlive == false) {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK", "UNDERTALK"];
          GAME_SYSTEM_CHANNEL.value.push("UNDERTALK")
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "UNDERTALK";
          break;
        }
        if (gameActionBody.dayOrNightOrVote == "DAY") {
          GAME_SENDVALIABLE_CHANNEL.value = ["DAYTALK", "SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "DAYTALK";
        } else if (gameActionBody.dayOrNightOrVote == "NIGHT") {
          GAME_SENDVALIABLE_CHANNEL.value = ["KYOUYUUTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "KYOUYUUTALK";
        } else if (gameActionBody.dayOrNightOrVote == "VOTING") {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "SELFTALK";
        } else if (gameActionBody.dayOrNightOrVote == "SUSPEND") {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "SELFTALK";
        } else {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK"];
          nowSendChannel.value = "SELFTALK"
        }

        break;
      case "妖狐":
        GAME_SYSTEM_CHANNEL.value = ["ALL", "SYSTEM", "DAYTALK", "KITSUNETALK", "SELFTALK"];
        if (player.value.isAlive == false) {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK", "UNDERTALK"];
          GAME_SYSTEM_CHANNEL.value.push("UNDERTALK")
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "UNDERTALK";
          break;
        }
        if (gameActionBody.dayOrNightOrVote == "DAY") {
          GAME_SENDVALIABLE_CHANNEL.value = ["DAYTALK", "SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "DAYTALK";
        } else if (gameActionBody.dayOrNightOrVote == "NIGHT") {
          GAME_SENDVALIABLE_CHANNEL.value = ["KITSUNETALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "KITSUNETALK";
        } else if (gameActionBody.dayOrNightOrVote == "VOTING") {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "SELFTALK";
        } else if (gameActionBody.dayOrNightOrVote == "SUSPEND") {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK"];
          nowSendChannel.value = GAME_SENDVALIABLE_CHANNEL.value.includes(nowSendChannel) ? nowSendChannel.value : "SELFTALK";
        } else {
          GAME_SENDVALIABLE_CHANNEL.value = ["SELFTALK"];
          nowSendChannel.value = "SELFTALK"
        }
        break;
      case "GM":
        GAME_SYSTEM_CHANNEL.value = ["ALL", "SYSTEM", "DAYTALK", "WOLFTALK", "KYOUYUUTALK", "KITSUNETALK", "WATCHTALK", "SELFTALK", "UNDERTALK"];
        GAME_SENDVALIABLE_CHANNEL.value = GAME_SYSTEM_CHANNEL.value;
        break;
      case "观战者":
        GAME_SYSTEM_CHANNEL.value = ["ALL", "SYSTEM", "DAYTALK", "WATCHTALK", "SELFTALK"];
        GAME_SENDVALIABLE_CHANNEL.value = ["WATCHTALK"];
        nowSendChannel.value = "WATCHTALK";
        break;
      //TODO
      default:
        GAME_SYSTEM_CHANNEL.value = ["ALL", "SYSTEM", "DAYTALK", "WOLFTALK", "KYOUYUUTALK", "KITSUNETALK", "WATCHTALK", "SELFTALK", "UNDERTALK"];
        GAME_SENDVALIABLE_CHANNEL.value = "SELFTALK";
    }
  } else { // 说明游戏没开始 或者已结束
    GAME_SYSTEM_CHANNEL.value = ["ALL"];
    GAME_SENDVALIABLE_CHANNEL.value = ["ALL"];
    identityName.value = gameActionBody.identityName == null || gameActionBody.identityName == undefined ? identityName.value : gameActionBody.identityName;
    nowSendChannel.value = "ALL";
    gameState.value = ''
    times.value = 0;
    needKami.value = false;
    needUranai.value = false;
    needVote.value = false;
    needKariudo.value = false;
    //TODO-结束前后不同色背景
  }

  // 如果值大于0并且游戏状态已定义，且定时器尚未启动，则开始定时器
  if (times.value > 0 && gameState.value !== undefined && intervalId === null) {
    intervalId = setInterval(() => {
      if (times.value > 0) {
        times.value -= 1;  // 每秒减少 1
      } else {
        // clearInterval(intervalId);  // 值为 0 时停止定时器
      }
    }, 1000);  // 每秒执行一次
  } else if (times.value <= 0 && intervalId !== null) {
    // 如果值变为 0 或以下，且定时器已启动，清除定时器
    // clearInterval(intervalId);
  }
}

function goToBottom() {
  // 判断是否滚动到底部
  const container = messagesContainer.value?.$el;
  if (container) {
    const isAtBottom =
      Math.abs(container.scrollTop + container.clientHeight - container.scrollHeight) <= 100;
    if (isAtBottom) {
      nextTick(() => {
        container.scrollTop = container.scrollHeight; // 滚动到底部
      });
    }
  }
}


// 点击准备
const doReady = async (doOrCancel) => {
  const readyRequest = async (doOrCancel) => {
    return new Promise((resolve, reject) => {
      post(`/api/rooms/ready`, {
        roomId: roomId.value,
        userId: user.userId,
        isReady: doOrCancel
      }, (response) => {
        const { data } = response;
        const { message } = response;
        if (message && data) {
          resolve(data); // 异步操作成功时调用 resolve
        }
      }, (message) => {
        ElMessage.error(`准备失败：${message}`);
        reject(new Error(message)); // 如果请求失败，也调用 reject
      });
    });
  };

  // 逻辑处理
  try {
    await readyRequest(doOrCancel);
    ElMessage.success("准备成功");
  } catch (error) {
    ElMessage.error(error.message || "请重试！");
  }
};

function getMessageClass(messageType) {
  switch (messageType) {
    case 'SYSTEM':
      return 'SYSTEM';
    case 'ALL':
      return 'ALL';
    case 'DAYTALK':
      return 'DAYTALK';
    case 'WOLFTALK':
      return 'WOLFTALK';
    case 'KYOUYUUTALK':
      return 'KYOUYUUTALK';
    case 'KITSUNETALK':
      return 'KITSUNETALK';
    case 'WATCHTALK':
      return 'WATCHTALK';
    case 'SELFTALK':
      return 'SELFTALK';
  }
}

function getRoomState() {
  if (room.value != null || room.value != undefined) {
    switch (room.value.roomState) {
      case 'NORMAL':
        return '开始前';
      case 'ENDED':
        return '已结束';
      case 'DISCARDED':
        return '已废村';
      case 'WOLFTALK':
        return 'WOLFTALK';
      case 'KYOUYUUTALK':
        return 'KYOUYUUTALK';
      case 'KITSUNETALK':
        return 'KITSUNETALK';
      case 'WATCHTALK':
        return 'WATCHTALK';
      case 'SELFTALK':
        return 'SELFTALK';
    }
  }

}


const sendGameActionBody = (code) => {
  if (code == ConstConfig.GAME_ACTION_GM_TIME_SHORT && times.value < 20) {
    ElMessage.error("时间不能再缩短！");
    return;
  }
  if (code !== ConstConfig.GAME_ACTION_GM_TIME_LONG && code !== ConstConfig.GAME_ACTION_GM_TIME_SHORT) {
    if (nowSelectPlayer.value === ''
      || nowSelectPlayer.value == null
      || nowSelectPlayer.value == undefined) {
      ElMessage.error("需要选择玩家");
      return;
    }
  }
  if (code == ConstConfig.GAME_ACTION_KAMI) {
    if (partners.value.some(partner => partner.roomPlayerId == nowSelectPlayer.value)) {
      ElMessage.error("不可选择同伴");
      return;
    }
  }
  if (code == ConstConfig.GAME_GM_KILL) {
    if (nowSelectPlayer.value.isAlive == false) {
      ElMessage.error("该玩家已死亡");
      return;
    }
  }
  if (code == ConstConfig.GAME_GM_REVIVE) {
    if (nowSelectPlayer.value.isAlive == true) {
      ElMessage.error("该玩家仍存活");
      return;
    }
  }

  const user = store.auth.user;
  room.value.players.filter(player => player.userId == user.getUserId)
  WebSocketManager.sendMessage(`/app/room/${roomId.value}/${nowSendChannel.value}/gameAction`, {
    code: code,
    roomId: roomId.value,
    operatorOfPlayerId: player.value.roomPlayerId,
    targetOfPlayerId: nowSelectPlayer.value
  }, (callbackData) => {
    switch (code) {
      case ConstConfig.GAME_ACTION_URANAI:
        needUranai.value = false;
      case ConstConfig.GAME_ACTION_VOTE:
        needVote.value = false;
      case ConstConfig.GAME_ACTION_KAMI:
        needKami.value = false;
      case ConstConfig.GAME_ACTION_KARIUDO:
        needKariudo.value = false;
    }
  });
  nowSelectPlayer.value = '';
};

// 过滤后的 channels
const filteredChannels = computed(() => {
  let availableChannels = channels.value.filter(channel =>
    GAME_SENDVALIABLE_CHANNEL.value.includes(channel.value)
  );

  if (identityName.value == "GM") {
    room.value.players.forEach(player => {
      if (player.userId != user.userId) {
        availableChannels.push({ label: `-> ${player.name}`, value: `${player.roomPlayerId}` })
      }
    })
  }
  return availableChannels;
}
);

const formattedIdentityListCount = computed(() => {
  if (identityListCount.value) {
    return Object.entries(identityListCount.value)
      .map(([role, count]) => `${role}${count}`)
      .join(" ");
  } else {
    return null;
  }

});

function getMsgTitle(msg) {
  if (msg.messageType == "SELFTALK") {
    if (msg.messageGmToPlayerId == player?.value?.roomPlayerId) {
      //是GM对自己的私聊
      msg.playerName = "GM->你"
    } else if (msg.userId == player?.value?.userId) {
      //自己是GM 发送给玩家
      var toPlayerName = room.value.players.find(player => player.roomPlayerId == msg.messageGmToPlayerId).name;
      msg.playerName = "你->" + toPlayerName;
    }
  }
  return msg;
  msg.messageGmToPlayerId ? msg.messageGmToPlayerId == player?.value?.roomPlayerId ? 'GM→你:' : msg.playerName + ":" : msg.messageType == 'SELFTALK' ? msg.playerName + ":" : msg.playerName + "的自言自语:"
}
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
  margin-bottom: 20px;
  min-height: 160px;
  /* 控制高度 */
}

.main-content {
  margin-bottom: 20px;

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
  --el-card-padding: 0px;
  display: flex;
  flex-direction: column;
  min-height: 59.5vh;
}

.message {
  border-bottom: 1px solid #ddd;
}

.message:last-child {
  border-bottom: none;
}

.message-line {
  display: flex;
  align-items: flex-start;
  padding-top: 5px;
  padding-bottom: 5px;
  padding-right: 10px;
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
  --el-card-padding: 0px;
}

.message-user {
  flex: 1;
  /* 用户名占一部分宽度 */
  max-width: 130px;
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

.message-line.SYSTEM {
  background-color: #5d606f;
  color: #ffffff;
}

.message-line.ALL {
  background-color: #ffffff;
}

.message-line.DAYTALK {
  background-color: #ffdd31;
}

.message-line.WOLFTALK {
  background-color: #13049f;
  color: #ffffff;
}

.message-line.KYOUYUUTALK {
  background-color: #0c8444;
  color: #ffffff;
}

.message-line.KITSUNETALK {
  background-color: #c31bd2;
  color: #ffefef;
}

.message-line.WATCHTALK {
  background-color: #21f2bd;
}

.message-line.SELFTALK {
  background-color: #434350;
  color: #ffefef;
}

.content {
  flex-grow: 1;
  /* 使内容区域自适应剩余空间 */
  padding: 5px;
  width: 100%;
  height: 100%;
}

.player-container {
  align-items: center;
  height: 80px;
}

.scroll-container {
  flex-grow: 1;
  overflow-y: auto;
  /* 允许垂直滚动 */
  max-height: 60vh;
  /* 适当减少，留点空间避免溢出 */
}
</style>
