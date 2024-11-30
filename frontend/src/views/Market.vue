<template>
  <div class="market-container">
    <!-- 市场统计 -->
    <el-row :gutter="20" class="market-stats">
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.totalListings }}</div>
          <div class="stat-label">在售凭证</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.totalVolume }} ETH</div>
          <div class="stat-label">总交易量</div>
        </el-card>
      </el-col>
      <el-col :xs="24" :sm="8">
        <el-card class="stat-card">
          <div class="stat-value">{{ stats.floorPrice }} ETH</div>
          <div class="stat-label">地板价</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 搜索和筛选 -->
    <el-card class="filter-card">
      <el-form :inline="true" :model="filterForm" class="filter-form">
        <el-form-item label="价格范围">
          <el-input-number
            v-model="filterForm.minPrice"
            :precision="4"
            :step="0.1"
            :min="0"
            placeholder="最低价"
            class="price-input"
          />
          <span class="price-separator">-</span>
          <el-input-number
            v-model="filterForm.maxPrice"
            :precision="4"
            :step="0.1"
            :min="0"
            placeholder="最高价"
            class="price-input"
          />
        </el-form-item>

        <el-form-item label="排序">
          <el-select v-model="filterForm.sort" placeholder="排序方式">
            <el-option label="最新上架" value="listed_desc" />
            <el-option label="价格从低到高" value="price_asc" />
            <el-option label="价格从高到低" value="price_desc" />
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

    <!-- 市场列表 -->
    <el-row :gutter="20" class="market-grid">
      <el-col 
        v-for="listing in listings"
        :key="listing.id"
        :xs="24"
        :sm="12"
        :md="8"
        :lg="6"
      >
        <el-card 
          :body-style="{ padding: '0px' }"
          class="listing-card"
          @click="viewListing(listing)"
        >
          <div class="listing-image">
            <el-image
              :src="listing.metadata.image"
              fit="cover"
            >
              <template #error>
                <div class="image-placeholder">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>
          </div>

          <div class="listing-content">
            <h3 class="listing-title">{{ listing.metadata.name }}</h3>
            <p class="listing-description">{{ listing.metadata.description }}</p>
            
            <div class="listing-info">
              <span class="seller">
                <el-icon><User /></el-icon>
                {{ shortenAddress(listing.seller) }}
              </span>
              <span class="listed-time">
                {{ formatTimeAgo(listing.listedAt) }}
              </span>
            </div>

            <div class="listing-price">
              <el-tag type="warning" size="large">
                {{ formatEther(listing.price) }} ETH
              </el-tag>
            </div>
          </div>

          <div class="listing-actions">
            <el-button 
              type="primary"
              @click.stop="handleBuy(listing)"
              :disabled="listing.seller === currentAddress"
            >
              {{ listing.seller === currentAddress ? '我的挂单' : '购买' }}
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
          <span class="price">{{ selectedListing?.price }} ETH</span>
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
import { ref, reactive, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useMarketStore } from '../stores/market';
import { useWeb3Store } from '../stores/web3';
import { ethers } from 'ethers';
import { ElMessage } from 'element-plus';
import { storeToRefs } from 'pinia';

const router = useRouter();
const marketStore = useMarketStore();
const web3Store = useWeb3Store();

const currentPage = ref(1);
const pageSize = ref(12);
const total = ref(0);
const listings = ref([]);
const loading = ref(false);

const stats = reactive({
  totalListings: 0,
  totalVolume: '0.00',
  floorPrice: '0.00'
});

const filterForm = reactive({
  minPrice: null,
  maxPrice: null,
  sort: 'listed_desc'
});

const buyDialogVisible = ref(false);
const buyLoading = ref(false);
const selectedListing = ref(null);

const currentAddress = computed(() => web3Store.account);

const shortenAddress = (address) => {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatEther = (wei) => {
  return ethers.utils.formatEther(wei || '0');
};

const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const date = new Date(timestamp);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return '刚刚';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟前`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}小时前`;
  return date.toLocaleDateString();
};

const loadMarketData = async () => {
  loading.value = true;
  try {
    // 加载市场统计数据
    const marketStats = await marketStore.getMarketStats();
    stats.totalListings = marketStats.totalListings;
    stats.totalVolume = formatEther(marketStats.totalVolume);
    stats.floorPrice = formatEther(marketStats.floorPrice);

    // 加载挂单列表
    const result = await marketStore.getListings({
      page: currentPage.value,
      limit: pageSize.value,
      ...filterForm
    });

    listings.value = result.items;
    total.value = result.total;
  } catch (error) {
    ElMessage.error('加载市场数据失败');
  } finally {
    loading.value = false;
  }
};

const handleFilter = () => {
  currentPage.value = 1;
  loadMarketData();
};

const resetFilter = () => {
  filterForm.minPrice = null;
  filterForm.maxPrice = null;
  filterForm.sort = 'listed_desc';
  handleFilter();
};

const handleSizeChange = (val) => {
  pageSize.value = val;
  loadMarketData();
};

const handleCurrentChange = (val) => {
  currentPage.value = val;
  loadMarketData();
};

const viewListing = (listing) => {
  router.push(`/certificates/${listing.tokenId}`);
};

const handleBuy = (listing) => {
  if (!web3Store.account) {
    ElMessage.warning('请先连接钱包');
    return;
  }
  selectedListing.value = listing;
  buyDialogVisible.value = true;
};

const confirmBuy = async () => {
  if (!selectedListing.value) return;
  
  buyLoading.value = true;
  try {
    await marketStore.buyListing(
      selectedListing.value.tokenId,
      selectedListing.value.price
    );
    ElMessage.success('购买成功');
    buyDialogVisible.value = false;
    loadMarketData();
  } catch (error) {
    ElMessage.error('购买失败');
  } finally {
    buyLoading.value = false;
  }
};

onMounted(() => {
  loadMarketData();
});
</script>

<style scoped>
.market-container {
  padding: 20px;
}

.market-stats {
  margin-bottom: 20px;
}

.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: var(--el-color-primary);
}

.stat-label {
  color: #909399;
  margin-top: 8px;
}

.filter-card {
  margin-bottom: 20px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.price-input {
  width: 120px;
}

.price-separator {
  margin: 0 8px;
}

.market-grid {
  margin-bottom: 20px;
}

.listing-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.listing-card:hover {
  transform: translateY(-5px);
}

.listing-image {
  height: 200px;
}

.listing-image .el-image {
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

.listing-content {
  padding: 15px;
}

.listing-title {
  margin: 0 0 10px;
  font-size: 16px;
  font-weight: bold;
}

.listing-description {
  color: #666;
  font-size: 14px;
  margin-bottom: 10px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.listing-info {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #909399;
  margin-bottom: 10px;
}

.listing-info .el-icon {
  margin-right: 4px;
}

.listing-price {
  text-align: right;
  margin-bottom: 10px;
}

.listing-actions {
  padding: 10px 15px;
  border-top: 1px solid #ebeef5;
  text-align: center;
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
  .market-container {
    padding: 10px;
  }

  .filter-form {
    flex-direction: column;
  }
  
  .filter-form .el-form-item {
    margin-right: 0;
  }

  .price-input {
    width: 100%;
  }
}
</style>
