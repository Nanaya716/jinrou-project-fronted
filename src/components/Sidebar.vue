<template>
  <el-aside width="200px">
    <el-scrollbar class="scrollbar">
      <el-menu
        :default-active="activeMenu"
        :default-openeds="openMenus"
        class="menu"
        router
        @open="handleOpen"
        @close="handleClose"
      >
      <el-menu-item index="/main">首页</el-menu-item>
        <el-sub-menu index="game" v-if="showManagement">
          <template #title>游戏页面</template>
          <el-menu-item index="/lobby">村子大厅</el-menu-item>
          <el-menu-item :index="`/room/${roomId}`">当前参与</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="infomation" v-if="showManagement">
          <template #title>相关知识</template>
          <el-menu-item index="/chatRoom">休息室</el-menu-item>
          <el-menu-item index="/KnowledgePage">日式人狼知识手册</el-menu-item>
        </el-sub-menu>
        <el-sub-menu index="system" v-if="showSystem">
          <template #title>系统功能</template>
          <el-menu-item index="/userPage">个人资料</el-menu-item>
          <el-menu-item index="/villageHistory">战绩统计</el-menu-item>
          <el-menu-item index="/about">关于</el-menu-item>
        </el-sub-menu>
        <div>
            <el-button @click="logout" type="danger" plain>退出登录</el-button>
        </div>
          
      </el-menu>
    </el-scrollbar>
  </el-aside>
</template>

<script setup>
import { ref, watch } from 'vue';
import { useStore } from '@/stores';
import { useRouter, useRoute } from 'vue-router';
import { post } from '@/net';
import { ElMessage } from 'element-plus';

const store = useStore();
const router = useRouter();
const route = useRoute();

const showManagement = ref(true);
const showSystem = ref(true);
var roomId = ref(store.auth.nowRoomId == null? 'none' : store.auth.nowRoomId)

// 监听 store.auth.nowRoomId 的变化，并同步更新 roomId
watch(
  () => store.auth.nowRoomId,  // 观察 store.auth.nowRoomId 的变化
  (newRoomId) => {
    if(store.auth.nowRoomId!= null){
      roomId.value = newRoomId;  // 更新 roomId
    }
  },
  { immediate: true }  // 立即执行一次，确保初始化时也同步
);
// 当前激活的菜单
const activeMenu = ref(route.path);

// 保存展开的子菜单
const openMenus = ref([]);

// 监听路由变化，更新 activeMenu 和展开的菜单
watch(
  () => route.path,
  (newPath) => {
    activeMenu.value = newPath;
    // 根据路由更新展开的菜单逻辑
    if (newPath.startsWith('/game')) {
      if (!openMenus.value.includes('game')) openMenus.value.push('game');
    } else if (newPath.startsWith('/infomation')) {
      if (!openMenus.value.includes('infomation')) openMenus.value.push('infomation');
    } else if (newPath.startsWith('/system')) {
      if (!openMenus.value.includes('system')) openMenus.value.push('system');
    }
  },
  { immediate: true }
);

// 手动打开和关闭菜单时更新 openMenus
const handleOpen = (index) => {
  if (!openMenus.value.includes(index)) {
    openMenus.value.push(index);
    console.log("open", index)
    console.log("menus", openMenus)
  }
};

const handleClose = (index) => {
  const idx = openMenus.value.indexOf(index);
  if (idx !== -1) {
    openMenus.value.splice(idx, 1);
    console.log("close", index)
    console.log("menus", openMenus)

  }
};

const logout = () => {
  post(
    '/api/user/logout',
    {},
    (response) => {
      const message = response.message;
      ElMessage.success(message);
      store.logout();
      router.push('/welcome');
    },
    (failure) => {
      ElMessage.error(failure.message);
    },
    (error) => {
      ElMessage.error(error.message);
    }
  );
};
</script>

<style scoped>
.menu {
  width: 100%;
}   

.scrollbar{
  height:100%;
}
</style>
