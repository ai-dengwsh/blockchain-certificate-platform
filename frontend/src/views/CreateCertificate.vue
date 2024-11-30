<template>
  <div class="create-certificate-container">
    <el-card class="create-form-card">
      <template #header>
        <div class="card-header">
          <h2>创建数字凭证</h2>
        </div>
      </template>

      <el-form
        ref="certificateForm"
        :model="formData"
        :rules="rules"
        label-position="top"
      >
        <!-- 基本信息 -->
        <h3 class="section-title">基本信息</h3>
        <el-form-item label="凭证名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入凭证名称" />
        </el-form-item>

        <el-form-item label="凭证描述" prop="description">
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="请输入凭证描述"
          />
        </el-form-item>

        <!-- 凭证图片 -->
        <h3 class="section-title">凭证图片</h3>
        <el-form-item label="上传图片" prop="image">
          <el-upload
            class="certificate-uploader"
            :http-request="handleImageUpload"
            :show-file-list="false"
            accept="image/*"
            :before-upload="beforeImageUpload"
          >
            <img v-if="imageUrl" :src="imageUrl" class="uploaded-image" />
            <el-icon v-else class="upload-icon"><Plus /></el-icon>
          </el-upload>
          <div class="upload-tip">支持 JPG、PNG 格式，建议尺寸 800x800px</div>
        </el-form-item>

        <!-- 属性信息 -->
        <h3 class="section-title">属性信息</h3>
        <div class="attributes-section">
          <div v-for="(attr, index) in formData.attributes" :key="index" class="attribute-item">
            <el-row :gutter="10">
              <el-col :span="10">
                <el-form-item
                  :prop="'attributes.' + index + '.trait_type'"
                  :rules="{ required: true, message: '请输入属性名称', trigger: 'blur' }"
                >
                  <el-input v-model="attr.trait_type" placeholder="属性名称" />
                </el-form-item>
              </el-col>
              <el-col :span="10">
                <el-form-item
                  :prop="'attributes.' + index + '.value'"
                  :rules="{ required: true, message: '请输入属性值', trigger: 'blur' }"
                >
                  <el-input v-model="attr.value" placeholder="属性值" />
                </el-form-item>
              </el-col>
              <el-col :span="4">
                <el-button type="danger" @click="removeAttribute(index)">
                  <el-icon><Delete /></el-icon>
                </el-button>
              </el-col>
            </el-row>
          </div>
        </div>

        <el-button type="primary" plain @click="addAttribute" class="add-attribute-btn">
          <el-icon><Plus /></el-icon>添加属性
        </el-button>

        <!-- 发行设置 -->
        <h3 class="section-title">发行设置</h3>
        <el-form-item label="是否立即上架" prop="listForSale">
          <el-switch v-model="formData.listForSale" />
        </el-form-item>

        <el-form-item v-if="formData.listForSale" label="售价 (ETH)" prop="price">
          <el-input-number
            v-model="formData.price"
            :precision="4"
            :step="0.1"
            :min="0"
          />
        </el-form-item>

        <!-- 提交按钮 -->
        <el-form-item>
          <el-button
            type="primary"
            :loading="creating"
            class="submit-btn"
            @click="handleCreate"
          >
            创建凭证
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { useCertificateStore } from '../stores/certificate';
import { useWeb3Store } from '../stores/web3';
import { ElMessage } from 'element-plus';
import { storeToRefs } from 'pinia';

const router = useRouter();
const certificateStore = useCertificateStore();
const web3Store = useWeb3Store();

const certificateForm = ref(null);
const creating = ref(false);
const imageUrl = ref('');
const imageFile = ref(null);

const formData = reactive({
  name: '',
  description: '',
  image: '',
  attributes: [],
  listForSale: false,
  price: 0.1
});

const rules = {
  name: [
    { required: true, message: '请输入凭证名称', trigger: 'blur' },
    { min: 3, message: '名称长度至少为3个字符', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入凭证描述', trigger: 'blur' },
    { min: 10, message: '描述长度至少为10个字符', trigger: 'blur' }
  ],
  image: [
    { required: true, message: '请上传凭证图片', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入售价', trigger: 'blur' },
    { type: 'number', min: 0, message: '售价必须大于0', trigger: 'blur' }
  ]
};

// 添加属性
const addAttribute = () => {
  formData.attributes.push({
    trait_type: '',
    value: ''
  });
};

// 删除属性
const removeAttribute = (index) => {
  formData.attributes.splice(index, 1);
};

// 图片上传前的验证
const beforeImageUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  const isLt2M = file.size / 1024 / 1024 < 2;

  if (!isImage) {
    ElMessage.error('只能上传图片文件!');
    return false;
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!');
    return false;
  }
  return true;
};

// 处理图片上传
const handleImageUpload = async ({ file }) => {
  try {
    imageFile.value = file;
    imageUrl.value = URL.createObjectURL(file);
    formData.image = file;
  } catch (error) {
    ElMessage.error('图片上传失败');
  }
};

// 创建凭证
const handleCreate = async () => {
  if (!certificateForm.value) return;

  await certificateForm.value.validate(async (valid) => {
    if (valid) {
      if (!web3Store.account) {
        ElMessage.warning('请先连接钱包');
        return;
      }

      creating.value = true;
      try {
        // 1. 上传图片到 IPFS
        const imageHash = await certificateStore.uploadToIPFS(imageFile.value);
        
        // 2. 准备元数据
        const metadata = {
          name: formData.name,
          description: formData.description,
          image: `ipfs://${imageHash}`,
          attributes: formData.attributes
        };

        // 3. 上传元数据到 IPFS
        const metadataHash = await certificateStore.uploadMetadataToIPFS(metadata);

        // 4. 创建 NFT
        const tokenId = await certificateStore.mintCertificate(metadataHash);

        // 5. 如果需要上架，创建市场挂单
        if (formData.listForSale) {
          await certificateStore.listCertificateForSale(
            tokenId,
            ethers.utils.parseEther(formData.price.toString())
          );
        }

        ElMessage.success('凭证创建成功');
        router.push('/certificates');
      } catch (error) {
        console.error('创建凭证失败:', error);
        ElMessage.error('创建凭证失败');
      } finally {
        creating.value = false;
      }
    }
  });
};
</script>

<style scoped>
.create-certificate-container {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.create-form-card {
  margin-bottom: 20px;
}

.section-title {
  margin: 20px 0 10px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-light);
  color: var(--el-text-color-primary);
}

.certificate-uploader {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration);
}

.certificate-uploader:hover {
  border-color: var(--el-color-primary);
}

.upload-icon {
  font-size: 28px;
  color: #8c939d;
  width: 200px;
  height: 200px;
  line-height: 200px;
  text-align: center;
}

.uploaded-image {
  width: 200px;
  height: 200px;
  object-fit: cover;
  display: block;
}

.upload-tip {
  font-size: 12px;
  color: #909399;
  margin-top: 8px;
}

.attribute-item {
  margin-bottom: 10px;
}

.add-attribute-btn {
  margin: 10px 0 20px;
}

.submit-btn {
  width: 100%;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .create-certificate-container {
    padding: 10px;
  }
}
</style>
