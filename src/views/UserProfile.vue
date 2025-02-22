<template>
    <div>
      <h1>用户主页</h1>
      <p>用户 ID: {{ userId }}</p>
      <p>账号: {{  }}</p>

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

  </script>
  