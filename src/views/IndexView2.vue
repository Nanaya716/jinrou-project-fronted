<template>
  <el-container class="admin-home">
    <!-- 侧边栏 -->
    <Sidebar :style="{ width: isSidebarVisible ? '200px' : '0' }" />

    <!-- 主要内容区域 -->
    <el-container class="main-content">
      <!-- 顶部栏 -->
      <Top @toggle-sidebar="toggleSidebar" />

      <!-- 内容区域 -->
      <el-main class="content">
        <router-view />
        <Footer />
      </el-main>
      

      <!-- 页脚 -->
      
    </el-container>
  </el-container>
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
  flex-direction: row;
  width: 100%;
  /* 充满整个页面 */
  height: 100vh; /* 占满整个视口高度 */
}

.main-content {
  display: flex;
  flex: 1;
  flex-direction: column;


  /* 占满剩余空间 */
}

.content {
  padding: 1px;
  flex: 1; /* 内容区域占据剩余空间 */
}



</style>
