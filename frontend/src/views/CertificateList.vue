<template>
  <div class="certificate-list-container">
    <!-- 搜索和过滤 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="状态">
          <el-select v-model="filterForm.status" placeholder="全部状态">
            <el-option label="全部" value="" />
            <el-option label="有效" value="valid" />
            <el-option label="已作废" value="invalid" />
          </el-select>
        </el-form-item>

        <el-form-item label="排序">
          <el-select v-model="filterForm.sort" placeholder="创建时间">
            <el-option label="最新创建" value="created_desc" />
            <el-option label="最早创建" value="created_asc" />
            <el-option label="价格从高到低" value="price_desc" />
            <el-option label="价格从低到高" value="price_asc" />
          </el-select>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleFilter">
            <el-icon><Search /></el-icon>筛选
          </el-button>
          <el-button @click="resetFilter">
            <el-icon><Refresh /></el-icon>重置
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 凭证列表 -->
    <el-row :gutter="20" class="certificate-grid">
      <el-col 
        v-for="cert in certificates"
        :key="cert.token_id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card 
          :body-style="{ padding: '0px' }"
          class="certificate-card"
          @click="viewCertificate(cert.token_id)"
        >
          <div class="certificate-image">
            <el-image
              :src="cert.metadata.image || '/placeholder.png'"
              fit="cover"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
            <div class="certificate-status">
              <el-tag :type="cert.status === 'valid' ? 'success' : 'danger'">
                {{ cert.status === 'valid' ? '有效' : '已作废' }}
              </el-tag>
            </div>
          </div>

          <div class="certificate-content">
            <h3 class="certificate-title">{{ cert.metadata.name }}</h3>
            <p class="certificate-description">{{ cert.metadata.description }}</p>
            
            <div class="certificate-info">
              <span class="owner">
                <el-icon><User /></el-icon>
                {{ shortenAddress(cert.owner_address) }}
              </span>
              <span class="created-at">
                <el-icon><Calendar /></el-icon>
                {{ formatDate(cert.created_at) }}
              </span>
            </div>

            <div class="certificate-price" v-if="cert.listing">
              <el-tag type="warning">
                {{ formatEther(cert.listing.price) }} ETH
              </el-tag>
            </div>
          </div>

          <div class="certificate-actions">
            <el-button text type="primary" @click.stop="viewCertificate(cert.token_id)">
              查看详情
            </el-button>
            <el-button 
              v-if="cert.listing && cert.owner_address !== currentAddress"
              text 
              type="success"
              @click.stop="handleBuy(cert)"
            >
              购买
            </el-button>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 分页 -->
    <div class="pagination-container">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[12, 24, 36, 48]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 购买确认对话框 -->
    <el-dialog
      v-model="buyDialogVisible"
      title="购买确认"
      width="400px"
    >
      <div class="buy-dialog-content">
        <p>您确定要购买此凭证吗？</p>
        <div class="price-info">
          <span>价格：</span>
          <span class="price">{{ selectedCertificate?.listing?.price }} ETH</span>
        </div>
      </div>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="buyDialogVisible = false">取消</el-button>
          <el-button
            type="primary"
            :loading="buyLoading"
            @click="confirmBuy"
          >
            确认购买
          </el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useCertificateStore } from '../stores/certificate';
import { useWeb3Store } from '../stores/web3';
import { ethers } from 'ethers';

const router = useRouter();
const certificateStore = useCertificateStore();
const web3Store = useWeb3Store();

const certificates = ref([]);
const total = ref(0);
const currentPage = ref(1);
const pageSize = ref(12);
const loading = ref(false);

const filterForm = ref({
  status: '',
  sort: 'created_desc'
});

const buyDialogVisible = ref(false);
const buyLoading = ref(false);
const selectedCertificate = ref(null);

const currentAddress = computed(() => web3Store.account);

const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatDate = (date) => {
  return new Date(date).toLocaleDateString();
};

const formatEther = (wei) => {
  return ethers.utils.formatEther(wei || '0');
};

const loadCertificates = async () => {
  loading.value = true;
  try {
    await certificateStore.fetchCertificates({
      page: currentPage.value,
      limit: pageSize.value,
      ...filterForm.value
    });
    certificates.value = certificateStore.certificates;
    total.value = certificateStore.total;
  } finally {
    loading.value = false;
  }
};

const handleFilter = () => {
  currentPage.value = 1;
  loadCertificates();
};

const resetFilter = () => {
  filterForm.value = {
    status: '',
    sort: 'created_desc'
  };
  handleFilter();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  loadCertificates();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadCertificates();
};

const viewCertificate = (tokenId) => {
  router.push(`/certificates/${tokenId}`);
};

const handleBuy = (certificate) => {
  selectedCertificate.value = certificate;
  buyDialogVisible.value = true;
};

const confirmBuy = async () => {
  if (!selectedCertificate.value) return;
  
  buyLoading.value = true;
  try {
    await certificateStore.buyCertificate(
      selectedCertificate.value.token_id,
      selectedCertificate.value.listing.price
    );
    buyDialogVisible.value = false;
    loadCertificates();
  } finally {
    buyLoading.value = false;
  }
};

onMounted(() => {
  loadCertificates();
});
</script>

<style scoped>
.certificate-list-container {
  padding: 20px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.certificate-grid {
  margin-bottom: 20px;
}

.certificate-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.certificate-card:hover {
  transform: translateY(-5px);
}

.certificate-image {
  position: relative;
  height: 200px;
}

.certificate-image .el-image {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
}

.image-placeholder .el-icon {
  font-size: 48px;
  color: #909399;
}

.certificate-status {
  position: absolute;
  top: 10px;
  right: 10px;
}

.certificate-content {
  padding: 15px;
}

.certificate-title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: bold;
}

.certificate-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.certificate-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.certificate-info .el-icon {
  margin-right: 4px;
}

.certificate-price {
  text-align: right;
  margin-bottom: 10px;
}

.certificate-actions {
  padding: 10px 15px;
  border-top: 1px solid #ebeef5;
  display: flex;
  justify-content: space-between;
}

.pagination-container {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

.buy-dialog-content {
  text-align: center;
}

.price-info {
  margin-top: 20px;
  font-size: 16px;
}

.price {
  color: var(--el-color-danger);
  font-weight: bold;
  font-size: 20px;
}

@media (max-width: 768px) {
  .filter-form {
    flex-direction: column;
  }
  
  .filter-form .el-form-item {
    margin-right: 0;
  }
}
</style>
