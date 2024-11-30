<template>
  <div class="register-container">
    <el-card class="register-card">
      <template #header>
        <h2 class="card-title">注册</h2>
      </template>

      <el-form
        ref="registerForm"
        :model="formData"
        :rules="rules"
        label-position="top"
      >
        <el-form-item label="用户名" prop="username">
          <el-input
            v-model="formData.username"
            placeholder="请输入用户名"
            prefix-icon="User"
          />
        </el-form-item>

        <el-form-item label="邮箱" prop="email">
          <el-input
            v-model="formData.email"
            placeholder="请输入邮箱"
            prefix-icon="Message"
          />
        </el-form-item>

        <el-form-item label="密码" prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="请输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input
            v-model="formData.confirmPassword"
            type="password"
            placeholder="请再次输入密码"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>

        <el-form-item label="钱包地址" prop="walletAddress">
          <el-input
            v-model="formData.walletAddress"
            placeholder="请输入钱包地址"
            prefix-icon="Wallet"
            :readonly="true"
          >
            <template #append>
              <el-button @click="connectWallet" :loading="connecting">
                连接钱包
              </el-button>
            </template>
          </el-input>
        </el-form-item>

        <el-form-item>
          <el-button
            type="primary"
            :loading="loading"
            class="submit-btn"
            @click="handleRegister"
          >
            注册
          </el-button>
        </el-form-item>

        <div class="form-footer">
          <router-link to="/login">已有账号？立即登录</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { useWeb3Store } from '../stores/web3';

const router = useRouter();
const authStore = useAuthStore();
const web3Store = useWeb3Store();
const registerForm = ref(null);
const loading = ref(false);
const connecting = ref(false);

const formData = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  walletAddress: ''
});

// 自动填充钱包地址
formData.walletAddress = computed(() => web3Store.account || '');

const validatePass = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请输入密码'));
  } else {
    if (formData.confirmPassword !== '') {
      registerForm.value?.validateField('confirmPassword');
    }
    callback();
  }
};

const validatePass2 = (rule, value, callback) => {
  if (value === '') {
    callback(new Error('请再次输入密码'));
  } else if (value !== formData.password) {
    callback(new Error('两次输入密码不一致!'));
  } else {
    callback();
  }
};

const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少为3个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ],
  walletAddress: [
    { required: true, message: '请连接钱包', trigger: 'blur' },
    { pattern: /^0x[a-fA-F0-9]{40}$/, message: '无效的钱包地址', trigger: 'blur' }
  ]
};

const connectWallet = async () => {
  connecting.value = true;
  try {
    await web3Store.initWeb3();
  } finally {
    connecting.value = false;
  }
};

const handleRegister = async () => {
  if (!registerForm.value) return;
  
  await registerForm.value.validate(async (valid) => {
    if (valid) {
      loading.value = true;
      try {
        const { confirmPassword, ...registerData } = formData;
        const success = await authStore.register(registerData);
        if (success) {
          router.push('/dashboard');
        }
      } finally {
        loading.value = false;
      }
    }
  });
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: calc(100vh - 200px);
  padding: 20px;
}

.register-card {
  width: 100%;
  max-width: 400px;
}

.card-title {
  margin: 0;
  text-align: center;
  font-size: 24px;
  color: var(--el-text-color-primary);
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
}

.form-footer {
  margin-top: 20px;
  text-align: center;
}

.form-footer a {
  color: var(--el-color-primary);
  text-decoration: none;
}

.form-footer a:hover {
  text-decoration: underline;
}
</style>
