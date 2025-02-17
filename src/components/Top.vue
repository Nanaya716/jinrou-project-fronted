<!-- Top.vue -->
<template>
  <el-header class="top">
    <div class="logo">
      <el-icon><Fold /></el-icon>
    </div>
    <el-icon @click="toggleSubMenu"><UserFilled /></el-icon><div class="user-info" >
      <!-- <el-icon @click="toggleSubMenu"><UserFilled /></el-icon> -->
      <div v-if="store.auth.user">
        欢迎{{ store.auth.user.account }}进入到人狼平台
      </div>
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
</script>

<style scoped>
.top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 40px; /* 设置固定高度 */
  background-color: red;
}
</style>
