<template>
  <el-container class="app-container">
    <el-header>
      <nav-bar />
    </el-header>
    
    <el-main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </el-main>

    <el-footer>
      <footer-bar />
    </el-footer>
  </el-container>
</template>

<script setup>
import { onMounted } from 'vue';
import { useWeb3Store } from './stores/web3';
import NavBar from './components/layout/NavBar.vue';
import FooterBar from './components/layout/FooterBar.vue';

const web3Store = useWeb3Store();

onMounted(async () => {
  // 初始化Web3
  if (window.ethereum) {
    await web3Store.initWeb3();
  }
});
</script>

<style>
.app-container {
  min-height: 100vh;
}

.el-header {
  padding: 0;
  height: auto;
}

.el-main {
  padding: 20px;
  background-color: #f5f7fa;
}

.el-footer {
  padding: 20px;
  background-color: #fff;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
