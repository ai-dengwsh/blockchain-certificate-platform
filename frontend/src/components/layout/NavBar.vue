<template>
  <el-menu
    :default-active="activeIndex"
    class="nav-menu"
    mode="horizontal"
    router
  >
    <el-menu-item index="/">
      <el-icon><HomeFilled /></el-icon>
      首页
    </el-menu-item>

    <el-menu-item index="/certificates">
      <el-icon><Document /></el-icon>
      凭证市场
    </el-menu-item>

    <template v-if="isAuthenticated">
      <el-menu-item index="/dashboard">
        <el-icon><Menu /></el-icon>
        控制台
      </el-menu-item>

      <div class="flex-spacer"></div>

      <el-dropdown class="user-dropdown" @command="handleCommand">
        <el-button type="primary">
          {{ shortAddress }}
          <el-icon class="el-icon--right"><ArrowDown /></el-icon>
        </el-button>
        
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="profile">
              <el-icon><User /></el-icon>个人信息
            </el-dropdown-item>
            <el-dropdown-item command="logout" divided>
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </template>

    <template v-else>
      <div class="flex-spacer"></div>
      
      <el-button type="primary" @click="connectWallet" :loading="connecting">
        <el-icon><Connection /></el-icon>
        连接钱包
      </el-button>

      <el-button type="success" @click="$router.push('/login')">
        <el-icon><Key /></el-icon>
        登录
      </el-button>
    </template>
  </el-menu>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../stores/auth';
import { useWeb3Store } from '../../stores/web3';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const web3Store = useWeb3Store();

const connecting = ref(false);
const activeIndex = computed(() => route.path);

const isAuthenticated = computed(() => authStore.isAuthenticated);
const shortAddress = computed(() => web3Store.shortAddress);

const connectWallet = async () => {
  connecting.value = true;
  try {
    const success = await web3Store.initWeb3();
    if (success) {
      ElMessage.success('钱包连接成功');
    }
  } finally {
    connecting.value = false;
  }
};

const handleCommand = async (command) => {
  switch (command) {
    case 'profile':
      router.push('/profile');
      break;
    case 'logout':
      await authStore.logout();
      router.push('/login');
      break;
  }
};
</script>

<style scoped>
.nav-menu {
  padding: 0 20px;
  display: flex;
  align-items: center;
  border-bottom: solid 1px var(--el-border-color-light);
}

.flex-spacer {
  flex-grow: 1;
}

.user-dropdown {
  margin-left: 20px;
}

.el-dropdown-menu {
  padding: 5px 0;
}

.el-dropdown-menu__item {
  display: flex;
  align-items: center;
  padding: 8px 20px;
}

.el-icon {
  margin-right: 8px;
}

.el-button + .el-button {
  margin-left: 12px;
}
</style>
