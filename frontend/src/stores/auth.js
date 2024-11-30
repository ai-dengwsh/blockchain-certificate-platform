import { defineStore } from 'pinia';
import axios from 'axios';
import { ElMessage } from 'element-plus';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    currentUser: (state) => state.user
  },

  actions: {
    async login(credentials) {
      try {
        const response = await axios.post('/api/auth/login', credentials);
        const { token, userInfo } = response.data.data;
        
        this.token = token;
        this.user = userInfo;
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(userInfo));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        ElMessage.success('登录成功');
        return true;
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '登录失败');
        return false;
      }
    },

    async register(userData) {
      try {
        const response = await axios.post('/api/auth/register', userData);
        const { token, userId, username } = response.data.data;
        
        this.token = token;
        this.user = { userId, username };
        
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ userId, username }));
        
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        ElMessage.success('注册成功');
        return true;
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '注册失败');
        return false;
      }
    },

    async logout() {
      this.token = null;
      this.user = null;
      
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      delete axios.defaults.headers.common['Authorization'];
      
      ElMessage.success('已退出登录');
    },

    async updateProfile(profileData) {
      try {
        const response = await axios.put('/api/auth/profile', profileData);
        const updatedUser = response.data.data;
        
        this.user = updatedUser;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        ElMessage.success('个人信息更新成功');
        return true;
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '更新失败');
        return false;
      }
    }
  }
});
