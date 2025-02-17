import { reactive } from 'vue';
import { defineStore } from 'pinia';

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
    localStorage.setItem('user', JSON.stringify(user));
  };

  const setToken = (token) => {
    auth.token = token;
    localStorage.setItem('token', token);
  };

  const logout = () => {
    auth.user = null;
    auth.token = null;
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const initializeAuth = () => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (user && token) {
      auth.user = JSON.parse(user);
      auth.token = token;
    }
  };

  return { auth, isLoggedIn, setUser, setToken, logout, initializeAuth };
});
