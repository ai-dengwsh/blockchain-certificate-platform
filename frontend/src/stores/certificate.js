import { defineStore } from 'pinia';
import axios from 'axios';
import { ElMessage } from 'element-plus';

export const useCertificateStore = defineStore('certificate', {
  state: () => ({
    certificates: [],
    currentCertificate: null,
    loading: false,
    total: 0,
    page: 1,
    limit: 10
  }),

  getters: {
    getCertificateById: (state) => (id) => {
      return state.certificates.find(cert => cert.token_id === id);
    }
  },

  actions: {
    async fetchCertificates({ page = 1, limit = 10 } = {}) {
      try {
        this.loading = true;
        const response = await axios.get('/api/certificates', {
          params: { page, limit }
        });
        
        this.certificates = response.data.data.items;
        this.total = response.data.data.total;
        this.page = page;
        this.limit = limit;
      } catch (error) {
        ElMessage.error('获取凭证列表失败');
      } finally {
        this.loading = false;
      }
    },

    async fetchMyCertificates({ page = 1, limit = 10 } = {}) {
      try {
        this.loading = true;
        const response = await axios.get('/api/certificates/my-certificates', {
          params: { page, limit }
        });
        
        this.certificates = response.data.data.items;
        this.total = response.data.data.total;
        this.page = page;
        this.limit = limit;
      } catch (error) {
        ElMessage.error('获取我的凭证失败');
      } finally {
        this.loading = false;
      }
    },

    async fetchCertificateDetails(tokenId) {
      try {
        this.loading = true;
        const response = await axios.get(`/api/certificates/${tokenId}`);
        this.currentCertificate = response.data.data;
        return this.currentCertificate;
      } catch (error) {
        ElMessage.error('获取凭证详情失败');
        return null;
      } finally {
        this.loading = false;
      }
    },

    async createCertificate(metadata) {
      try {
        this.loading = true;
        const response = await axios.post('/api/certificates', { metadata });
        ElMessage.success('凭证创建成功');
        return response.data.data;
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '凭证创建失败');
        return null;
      } finally {
        this.loading = false;
      }
    },

    async transferCertificate(tokenId, toAddress) {
      try {
        this.loading = true;
        const response = await axios.post('/api/certificates/transfer', {
          tokenId,
          toAddress
        });
        ElMessage.success('凭证转移成功');
        return response.data.data;
      } catch (error) {
        ElMessage.error(error.response?.data?.message || '凭证转移失败');
        return null;
      } finally {
        this.loading = false;
      }
    },

    async verifyCertificate(tokenId) {
      try {
        this.loading = true;
        const response = await axios.get(`/api/certificates/${tokenId}/verify`);
        return response.data.data;
      } catch (error) {
        ElMessage.error('凭证验证失败');
        return null;
      } finally {
        this.loading = false;
      }
    }
  }
});
