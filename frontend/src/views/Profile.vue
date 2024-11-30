<template>
  <div class="profile-container">
    <el-row :gutter="20">
      <el-col :xs="24" :md="8">
        <!-- 个人信息卡片 -->
        <el-card class="profile-card">
          <template #header>
            <div class="card-header">
              <span>个人信息</span>
              <el-button type="primary" @click="editMode = true" v-if="!editMode">
                编辑资料
              </el-button>
            </div>
          </template>

          <el-form
            ref="profileForm"
            :model="profileData"
            :rules="rules"
            label-position="top"
            :disabled="!editMode"
          >
            <el-form-item label="用户名" prop="username">
              <el-input v-model="profileData.username" />
            </el-form-item>

            <el-form-item label="邮箱" prop="email">
              <el-input v-model="profileData.email" />
            </el-form-item>

            <el-form-item label="钱包地址">
              <el-input v-model="walletAddress" readonly>
                <template #append>
                  <el-button @click="copyAddress">
                    <el-icon><CopyDocument /></el-icon>
                  </el-button>
                </template>
              </el-input>
            </el-form-item>

            <div v-if="editMode" class="form-actions">
              <el-button @click="cancelEdit">取消</el-button>
              <el-button type="primary" @click="saveProfile" :loading="saving">
                保存
              </el-button>
            </div>
          </el-form>
        </el-card>

        <!-- 修改密码卡片 -->
        <el-card class="password-card">
          <template #header>
            <div class="card-header">
              <span>修改密码</span>
            </div>
          </template>

          <el-form
            ref="passwordForm"
            :model="passwordData"
            :rules="passwordRules"
            label-position="top"
          >
            <el-form-item label="当前密码" prop="currentPassword">
              <el-input
                v-model="passwordData.currentPassword"
                type="password"
                show-password
              />
            </el-form-item>

            <el-form-item label="新密码" prop="newPassword">
              <el-input
                v-model="passwordData.newPassword"
                type="password"
                show-password
              />
            </el-form-item>

            <el-form-item label="确认新密码" prop="confirmPassword">
              <el-input
                v-model="passwordData.confirmPassword"
                type="password"
                show-password
              />
            </el-form-item>

            <el-button
              type="primary"
              @click="changePassword"
              :loading="changingPassword"
              class="change-password-btn"
            >
              修改密码
            </el-button>
          </el-form>
        </el-card>
      </el-col>

      <el-col :xs="24" :md="16">
        <!-- 账户统计卡片 -->
        <el-card class="stats-card">
          <template #header>
            <div class="card-header">
              <span>账户统计</span>
            </div>
          </template>

          <el-row :gutter="20">
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ stats.certificateCount }}</div>
                <div class="stat-label">持有凭证</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ stats.transactionCount }}</div>
                <div class="stat-label">交易次数</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="stat-item">
                <div class="stat-value">{{ stats.listingCount }}</div>
                <div class="stat-label">在售凭证</div>
              </div>
            </el-col>
          </el-row>
        </el-card>

        <!-- 最近活动卡片 -->
        <el-card class="activity-card">
          <template #header>
            <div class="card-header">
              <span>最近活动</span>
            </div>
          </template>

          <el-timeline>
            <el-timeline-item
              v-for="activity in recentActivities"
              :key="activity.id"
              :timestamp="activity.timestamp"
              :type="activity.type"
            >
              <h4>{{ activity.title }}</h4>
              <p>{{ activity.description }}</p>
            </el-timeline-item>
          </el-timeline>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useWeb3Store } from '../stores/web3';
import { ElMessage } from 'element-plus';

const authStore = useAuthStore();
const web3Store = useWeb3Store();

const editMode = ref(false);
const saving = ref(false);
const changingPassword = ref(false);

const profileForm = ref(null);
const passwordForm = ref(null);

const profileData = reactive({
  username: '',
  email: '',
});

const passwordData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
});

const stats = reactive({
  certificateCount: 0,
  transactionCount: 0,
  listingCount: 0,
});

const recentActivities = ref([]);

const walletAddress = computed(() => web3Store.account || '未连接钱包');

// 表单验证规则
const rules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, message: '用户名长度至少为3个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入邮箱地址', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
  ]
};

const passwordRules = {
  currentPassword: [
    { required: true, message: '请输入当前密码', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度至少为6个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== passwordData.newPassword) {
          callback(new Error('两次输入的密码不一致'));
        } else {
          callback();
        }
      },
      trigger: 'blur'
    }
  ]
};

// 加载用户资料
const loadProfile = async () => {
  try {
    const profile = await authStore.getProfile();
    profileData.username = profile.username;
    profileData.email = profile.email;
  } catch (error) {
    ElMessage.error('加载用户资料失败');
  }
};

// 加载统计数据和活动
const loadStats = async () => {
  try {
    // TODO: 从后端获取统计数据和活动记录
    stats.certificateCount = 10;
    stats.transactionCount = 5;
    stats.listingCount = 2;

    recentActivities.value = [
      {
        id: 1,
        type: 'primary',
        timestamp: '2024-01-20 10:00:00',
        title: '创建凭证',
        description: '创建了新的数字凭证 #123'
      },
      {
        id: 2,
        type: 'success',
        timestamp: '2024-01-19 15:30:00',
        title: '完成交易',
        description: '购买了凭证 #456'
      }
    ];
  } catch (error) {
    ElMessage.error('加载统计数据失败');
  }
};

// 保存个人资料
const saveProfile = async () => {
  if (!profileForm.value) return;

  await profileForm.value.validate(async (valid) => {
    if (valid) {
      saving.value = true;
      try {
        await authStore.updateProfile(profileData);
        editMode.value = false;
        ElMessage.success('保存成功');
      } catch (error) {
        ElMessage.error('保存失败');
      } finally {
        saving.value = false;
      }
    }
  });
};

// 取消编辑
const cancelEdit = () => {
  editMode.value = false;
  loadProfile();
};

// 修改密码
const changePassword = async () => {
  if (!passwordForm.value) return;

  await passwordForm.value.validate(async (valid) => {
    if (valid) {
      changingPassword.value = true;
      try {
        await authStore.changePassword(passwordData);
        ElMessage.success('密码修改成功');
        passwordForm.value.resetFields();
      } catch (error) {
        ElMessage.error('密码修改失败');
      } finally {
        changingPassword.value = false;
      }
    }
  });
};

// 复制钱包地址
const copyAddress = () => {
  navigator.clipboard.writeText(walletAddress.value)
    .then(() => ElMessage.success('地址已复制'))
    .catch(() => ElMessage.error('复制失败'));
};

onMounted(() => {
  loadProfile();
  loadStats();
});
</script>

<style scoped>
.profile-container {
  padding: 20px;
}

.profile-card,
.password-card,
.stats-card,
.activity-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.change-password-btn {
  width: 100%;
  margin-top: 20px;
}

.stat-item {
  text-align: center;
  padding: 20px 0;
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

@media (max-width: 768px) {
  .profile-container {
    padding: 10px;
  }
}
</style>
