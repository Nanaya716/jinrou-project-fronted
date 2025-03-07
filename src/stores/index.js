import { reactive } from 'vue';
import { defineStore } from 'pinia';
import { post } from '@/net';
import router from "@/router";
export const useStore = defineStore('auth', () => {
  // 定义响应式状态
  const auth = reactive({
    user: null, // 用户信息
    token: null, // Token
    nowRoomId: null // 当前房间
  });

  // 定义 getters
  const isLoggedIn = () => !!auth.token;

  // 定义 actions
  const setUser = (user) => {
    auth.user = user;
    localStorage.setItem('user', JSON.stringify(user)); // 如果 user 是 null，存储为 "null"
  };

  const setToken = (token) => {
    auth.token = token;
    if(token){
      localStorage.setItem('token', token); 
    }else{
      localStorage.removeItem('token'); // 如果 token 是 null 或 undefined，移除键
    }
    
  };

  const logout = () => {
    auth.user = null;
    auth.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const initializeAuth = async () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token') 
    const userObj = JSON.parse(user);
    setToken(token); // 保存 Token
    setUser(userObj); // 保存用户信息
    if (userObj != null && token != null) {
      // 验证 token 并获取最新用户信息
      await post('/api/user/validateUser',
        userObj, (response) => {
          // 假设后端返回的数据包含 token 和 user
          // const { token, user } = response.data;  // 注意使用 response.data
          // const { message } = response;
          // if (token && user) {
          // 将用户信息存入 Pinia 状态
          setToken(token); // 保存 Token
          setUser(userObj); // 保存用户信息
          // } else {
          //   ElMessage.error('登录成功，但未返回有效的 Token 或 用户信息！');
          // }
        }, (message) => {
          ElMessage.error(message);
          // 验证失败的处理
          logout();
          router.push("/welcome")
        });    
    }
  }
  return { auth, isLoggedIn, setUser, setToken, logout, initializeAuth };
});
