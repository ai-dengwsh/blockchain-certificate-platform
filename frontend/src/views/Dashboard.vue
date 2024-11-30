<template>
  <div class="dashboard-container">
    <el-row :gutter="20">
      <!-- 统计卡片 -->
      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <el-icon><Document /></el-icon>
              <span>我的凭证</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.certificateCount }}</div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <el-icon><Shop /></el-icon>
              <span>市场挂单</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.listingCount }}</div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <el-icon><Wallet /></el-icon>
              <span>账户余额</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.balance }} ETH</div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="12" :md="6">
        <el-card class="stat-card">
          <template #header>
            <div class="card-header">
              <el-icon><Money /></el-icon>
              <span>交易总额</span>
            </div>
          </template>
          <div class="stat-value">{{ stats.totalValue }} ETH</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 快捷操作 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>快捷操作</span>
            </div>
          </template>
          <div class="quick-actions">
            <el-button type="primary" @click="$router.push('/certificates/create')">
              <el-icon><Plus /></el-icon>创建凭证
            </el-button>
            <el-button type="success" @click="$router.push('/certificates')">
              <el-icon><List /></el-icon>浏览市场
            </el-button>
            <el-button type="info" @click="$router.push('/profile')">
              <el-icon><Setting /></el-icon>账户设置
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近凭证 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近凭证</span>
              <el-button text @click="$router.push('/certificates')">
                查看全部
              </el-button>
            </div>
          </template>
          
          <el-table
            v-loading="loading"
            :data="recentCertificates"
            style="width: 100%"
          >
            <el-table-column prop="token_id" label="ID" width="80" />
            <el-table-column prop="metadata.name" label="名称" />
            <el-table-column prop="created_at" label="创建时间">
              <template #default="scope">
                {{ new Date(scope.row.created_at).toLocaleString() }}
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态">
              <template #default="scope">
                <el-tag :type="scope.row.status === 'valid' ? 'success' : 'danger'">
                  {{ scope.row.status === 'valid' ? '有效' : '已作废' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column fixed="right" label="操作" width="120">
              <template #default="scope">
                <el-button
                  link
                  type="primary"
                  @click="$router.push(`/certificates/${scope.row.token_id}`)"
                >
                  查看
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最近交易 -->
    <el-row :gutter="20" class="mt-4">
      <el-col :span="24">
        <el-card>
          <template #header>
            <div class="card-header">
              <span>最近交易</span>
            </div>
          </template>
          
          <el-timeline>
            <el-timeline-item
              v-for="tx in recentTransactions"
              :key="tx.tx_hash"
              :timestamp="new Date(tx.created_at).toLocaleString()"
              :type="getTransactionType(tx.type)"
            >
              <h4>{{ getTransactionTitle(tx) }}</h4>
              <p>交易哈希: {{ tx.tx_hash }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useCertificateStore } from '../stores/certificate';
import { useWeb3Store } from '../stores/web3';
import { ethers } from 'ethers';

const certificateStore = useCertificateStore();
const web3Store = useWeb3Store();
const loading = ref(false);

const stats = ref({
  certificateCount: 0,
  listingCount: 0,
  balance: '0.00',
  totalValue: '0.00'
});

const recentCertificates = ref([]);
const recentTransactions = ref([]);

const getTransactionType = (type) => {
  const types = {
    'mint': 'success',
    'transfer': 'warning',
    'burn': 'danger',
    'list': 'info',
    'buy': 'primary',
    'cancel': 'info'
  };
  return types[type] || 'info';
};

const getTransactionTitle = (tx) => {
  const titles = {
    'mint': '创建凭证',
    'transfer': '转移凭证',
    'burn': '销毁凭证',
    'list': '挂单出售',
    'buy': '购买凭证',
    'cancel': '取消挂单'
  };
  return titles[tx.type] || '未知操作';
};

const loadDashboardData = async () => {
  loading.value = true;
  try {
    // 加载统计数据
    const [certificates, balance] = await Promise.all([
      certificateStore.fetchMyCertificates(),
      web3Store.provider?.getBalance(web3Store.account)
    ]);

    stats.value.certificateCount = certificateStore.total;
    stats.value.balance = ethers.utils.formatEther(balance || '0');

    // 加载最近凭证
    recentCertificates.value = certificateStore.certificates.slice(0, 5);

    // TODO: 加载最近交易和其他统计数据
  } catch (error) {
    console.error('加载控制台数据失败:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>

<style scoped>
.dashboard-container {
  padding: 20px;
}

.mt-4 {
  margin-top: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-card {
  margin-bottom: 20px;
}

.stat-card .card-header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
  text-align: center;
  margin-top: 10px;
}

.quick-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.el-icon {
  margin-right: 4px;
}

@media (max-width: 768px) {
  .quick-actions {
    flex-direction: column;
  }
  
  .quick-actions .el-button {
    width: 100%;
  }
}
</style>
