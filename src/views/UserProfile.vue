<template>
    <div>
      <h1>用户主页</h1>
      <!-- <p>用户 ID: {{ userId }}</p> -->
      <p>账号: {{ getedUser.account }}</p>
      <p>用户名: {{ getedUser.username }}</p>
      <p>邮箱: {{ getedUser.email }}</p>

      <p>是否公开战绩： {{ getedUser.openHistory }}</p>

      <!-- <div v-if="userInfo">
        <h2>{{ userInfo.name }}</h2>
        <p>{{ userInfo.description }}</p>
      </div>
      <div v-else>
        <p>加载中...</p>
      </div> -->
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, watch } from 'vue';
  import { useRoute } from 'vue-router';
  import { post } from '@/net';
  
  const route = useRoute();
  const userId = ref(route.params.userId); // 初始 userId
  const userInfo = ref(null); // 用户信息
  const getedUser = ref('')

  onMounted(()=>{
    getUserProfile(userId.value)
  })

  // 获取用户信息
const getUserProfile = async (userId) => {
  const doFunction = async (userId) => {
    return new Promise((resolve, reject) => {
      post(`/api/user/getUserByUserId`, {
        userId: userId
      }, (response) => {
        const { data } = response;
        const { message } = response;
        if (message && data) {
          getedUser.value = data;
          resolve(data); // 异步操作成功时调用 resolve
        }
      }, (message) => {
        ElMessage.error(`获取用户信息失败：${message}`);
        reject(new Error(message)); // 如果请求失败，也调用 reject
      });
    });
  };

  // 逻辑处理
  try {
    await doFunction(userId);
  } catch (error) {
    ElMessage.error(error.message || "请重试！");
  }
};
  </script>
  