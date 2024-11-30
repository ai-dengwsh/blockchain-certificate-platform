import { createApp } from 'vue';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import 'element-plus/dist/index.css';
import App from './App.vue';
import router from './router';
import api from './services/api';

const app = createApp(App);
const pinia = createPinia();

// 注册Element Plus图标
for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

// 全局API实例
app.config.globalProperties.$api = api;

app.use(pinia)
   .use(router)
   .use(ElementPlus)
   .mount('#app');
