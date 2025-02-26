<template>
  <div class="common-layout">
    <el-container class="admin-home">
      <!-- 引入侧边栏组件 -->
      <Sidebar :style="{ width: isSidebarVisible ? '200px' : '0' }" />

      <!-- 主要内容区域 -->
      <el-container direction="vertical" class="main-content">
        <!-- 引入 Top 组件 -->
        <Top @toggle-sidebar="toggleSidebar" />
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
import { checkMobile } from '@/js/base.js';

// 控制侧边栏是否可见
const isSidebarVisible = ref(true);

onMounted(() => {
  isSidebarVisible.value = !checkMobile()
  window.addEventListener('resize', checkMobile)
  WebSocketManager.startConnection(); // 启动 WebSocket 连接
});

onUnmounted(() => {
  window.removeEventListener('resize', checkMobile)
  WebSocketManager.closeConnection(); // 关闭 WebSocket 连接
});



// 切换侧边栏状态
const toggleSidebar = () => {
  isSidebarVisible.value = !isSidebarVisible.value;
};
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
