import { defineStore } from 'pinia';
import { ethers } from 'ethers';
import { ElMessage } from 'element-plus';
import CertificateABI from '../contracts/Certificate.json';

export const useWeb3Store = defineStore('web3', {
  state: () => ({
    provider: null,
    signer: null,
    contract: null,
    account: null,
    chainId: null,
    connected: false,
    loading: false
  }),

  getters: {
    isConnected: (state) => state.connected && !!state.account,
    shortAddress: (state) => {
      if (!state.account) return '';
      return `${state.account.slice(0, 6)}...${state.account.slice(-4)}`;
    }
  },

  actions: {
    async initWeb3() {
      try {
        if (typeof window.ethereum === 'undefined') {
          ElMessage.warning('请安装MetaMask钱包');
          return false;
        }

        // 初始化provider
        this.provider = new ethers.providers.Web3Provider(window.ethereum);
        
        // 请求连接钱包
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        
        // 获取签名者和账户
        this.signer = this.provider.getSigner();
        this.account = await this.signer.getAddress();
        
        // 获取链ID
        const network = await this.provider.getNetwork();
        this.chainId = network.chainId;
        
        // 初始化合约
        this.contract = new ethers.Contract(
          import.meta.env.VITE_CONTRACT_ADDRESS,
          CertificateABI,
          this.signer
        );

        this.connected = true;
        
        // 监听账户变化
        window.ethereum.on('accountsChanged', this.handleAccountsChanged);
        // 监听链变化
        window.ethereum.on('chainChanged', this.handleChainChanged);

        return true;
      } catch (error) {
        console.error('Web3初始化失败:', error);
        ElMessage.error('连接钱包失败');
        return false;
      }
    },

    async handleAccountsChanged(accounts) {
      if (accounts.length === 0) {
        this.disconnect();
        ElMessage.warning('请连接MetaMask钱包');
      } else if (accounts[0] !== this.account) {
        this.account = accounts[0];
        await this.initWeb3();
      }
    },

    handleChainChanged() {
      window.location.reload();
    },

    disconnect() {
      this.provider = null;
      this.signer = null;
      this.contract = null;
      this.account = null;
      this.chainId = null;
      this.connected = false;
    },

    async signMessage(message) {
      try {
        if (!this.signer) {
          throw new Error('未连接钱包');
        }
        return await this.signer.signMessage(message);
      } catch (error) {
        ElMessage.error('消息签名失败');
        throw error;
      }
    }
  }
});
