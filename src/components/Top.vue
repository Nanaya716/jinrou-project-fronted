<!-- Top.vue -->
<template>
  <el-header class="top">
    <div class="logo">
      <el-icon @click="toggleSidebar" class="sidebar-button"><Fold /></el-icon>
    </div>

      <!-- <el-icon @click="toggleSubMenu"><UserFilled /></el-icon> -->
      <div v-if="store.auth.user">
        欢迎{{ store.auth.user.account }}进入到人狼平台
      </div>

  </el-header>
</template>

<script setup>
import { ref } from 'vue';
import { useStore } from '@/stores';

const store = useStore();
const subMenuVisible = ref(false);

const toggleSubMenu = () => {
  subMenuVisible.value = !subMenuVisible.value;
};

// 触发父组件的 toggle-sidebar 事件
const emit = defineEmits(['toggle-sidebar']);

const toggleSidebar = () => {
  emit('toggle-sidebar');
};
</script>

<style scoped>
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px; /* 设置固定高度 */
  background-color: rgb(34, 108, 255);
}

.sidebar-button {
  background: var(--el-color-primary);
  color: white;
  width: 25px;
  height: 25px;

  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid white; /* 添加白色边框 */
  cursor: pointer;
}
</style>
