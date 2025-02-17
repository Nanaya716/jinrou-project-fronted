<template>
  <div class="common-layout">
    <el-container class="admin-home">
      <!-- 引入侧边栏组件 -->
      <Sidebar />

      <!-- 主要内容区域 -->
      <el-container direction="vertical" class="main-content">
        <!-- 引入 Top 组件 -->
        <Top />
        <el-main class="content">
          <!-- 路由展示组件 -->
          <router-view />
        </el-main>
        <!-- <Footer /> -->
      </el-container>
    </el-container>
  </div>
</template>

<script setup>
import { ref, provide, onMounted, onUnmounted } from 'vue';
import Sidebar from '@/components/Sidebar.vue';
import Top from '@/components/Top.vue';
import Footer from '@/components/Footer.vue';
import WebSocketManager from '@/net/websocket-manager';

onMounted(() => {
  WebSocketManager.startConnection(); // 启动 WebSocket 连接

});

onUnmounted(() => {
  WebSocketManager.closeConnection(); // 关闭 WebSocket 连接
});

</script>

<style scoped>
.admin-home {
  display: flex;
  height: 100vh; /* 充满整个页面 */
}

.main-content {
  display: flex;
  flex-direction: column;
  width: 100%; /* 占满剩余空间 */
}

.content {
  padding: 1px;
}
</style>
