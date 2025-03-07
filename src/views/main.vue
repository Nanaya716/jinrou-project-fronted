<template>
  <el-container class="welcome-container">
    <el-main>
      <el-card shadow="hover" class="welcome-card">
        <template #header>
          <h2>🎉 欢迎来到狼人杀在线！</h2>
        </template>
        <p>在这里，你可以体验推理，与好友一起畅玩狼人杀！</p>
      </el-card>
      <br>
      <el-card shadow="hover" class="announcement-card">
        <template #header>
          <h3>📢 公告</h3>
        </template>
        <el-scrollbar height="150px">
          <p v-for="(lobbyMessage, index) in lobbyMessages" :key="index">
            {{ lobbyMessage.content }} | {{ lobbyMessage.publishTime }}
          </p>
        </el-scrollbar>
      </el-card>
    </el-main>
    
  </el-container>

</template>

<script setup>
import { onMounted, ref } from "vue";
import { get, post } from '@/net';
import WebSocketManager from '@/net/websocket-manager';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from '@/stores';
// 公告内容
const lobbyMessages = ref([
  "🚀 服务器已升级，性能更稳定！",
  "🎭 新角色即将上线，敬请期待！",
  "⚠️ 请勿作弊，公平游戏！",
]);

onMounted(() => {
  getLobbyMessage();
})
// 点击准备
const getLobbyMessage = async () => {
  const queryLobbyMessages = async () => {
    return new Promise((resolve, reject) => {
      post(`/api/lobbyMessage/getLobbyMessages`, {
      }, (response) => {
        const { data } = response;
        const { message } = response;
        if (message && data) {
          lobbyMessages.value = data;
          resolve(data); // 异步操作成功时调用 resolve
        }
      }, (message) => {
        ElMessage.error(`获取大厅公告失败：${message}`);
        reject(new Error(message)); // 如果请求失败，也调用 reject
      });
    });
  };

  // 逻辑处理
  try {
    await queryLobbyMessages();
  } catch (error) {
    ElMessage.error(error.message || "请重试！");
  }
};
</script>

<style scoped></style>