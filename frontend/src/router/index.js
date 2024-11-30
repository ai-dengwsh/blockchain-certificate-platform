import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';
import Dashboard from '../views/Dashboard.vue';
import CertificateList from '../views/CertificateList.vue';
import CertificateCreate from '../views/CertificateCreate.vue';
import CertificateDetail from '../views/CertificateDetail.vue';
import Profile from '../views/Profile.vue';

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/certificates',
    name: 'CertificateList',
    component: CertificateList
  },
  {
    path: '/certificates/create',
    name: 'CertificateCreate',
    component: CertificateCreate,
    meta: { requiresAuth: true }
  },
  {
    path: '/certificates/:id',
    name: 'CertificateDetail',
    component: CertificateDetail
  },
  {
    path: '/profile',
    name: 'Profile',
    component: Profile,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  if (to.matched.some(record => record.meta.requiresAuth) && !token) {
    next('/login');
  } else {
    next();
  }
});

export default router;
