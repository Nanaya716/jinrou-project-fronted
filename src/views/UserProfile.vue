<template>
    <div>
      <h1>用户主页</h1>
      <p>用户 ID: {{ userId }}</p>
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
  
  const route = useRoute();
  const userId = ref(route.params.userId); // 初始 userId
  const userInfo = ref(null); // 用户信息
  
//   // 模拟获取用户信息的函数
//   const fetchUserInfo = async (id) => {
//     // 模拟一个异步 API 请求
//     userInfo.value = null; // 清空之前的数据
//     console.log('Fetching user info for ID:', id);
//     await new Promise((resolve) => setTimeout(resolve, 1000));
//     userInfo.value = {
//       id,
//       name: `用户 ${id}`,
//       description: `这是用户 ${id} 的简介。`,
//     };
//   };
  
//   // 加载初始用户信息
//   onMounted(() => {
//     fetchUserInfo(userId.value);
//   });
  
//   // 动态监听路由参数变化
//   watch(() => route.params.userId, (newUserId) => {
//     userId.value = newUserId;
//     fetchUserInfo(newUserId);
//   });
  </script>
  