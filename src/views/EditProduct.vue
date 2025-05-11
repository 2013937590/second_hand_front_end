<template>
  <div class="edit-product-container">
    <div class="container">
      <div class="edit-form">
        <h2 class="form-title">编辑商品</h2>
        
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-width="100px"
          @submit.prevent="handleSubmit"
        >
          <!-- 商品标题 -->
          <el-form-item label="商品标题" prop="title">
            <el-input
              v-model="form.title"
              placeholder="请输入商品标题"
              maxlength="50"
              show-word-limit
            />
          </el-form-item>
          
          <!-- 商品分类 -->
          <el-form-item label="商品分类" prop="categoryId">
            <el-select
              v-model="form.categoryId"
              placeholder="请选择商品分类"
              style="width: 100%"
            >
              <el-option
                v-for="item in categories"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <!-- 商品价格 -->
          <el-form-item label="商品价格" prop="price">
            <el-input-number
              v-model="form.price"
              :min="0"
              :precision="2"
              :step="0.01"
              style="width: 200px"
            />
          </el-form-item>
          
          <!-- 商品图片 -->
          <el-form-item label="商品图片" prop="images">
            <el-upload
              v-model:file-list="fileList"
              action="/api/upload"
              list-type="picture-card"
              :on-preview="handlePictureCardPreview"
              :on-remove="handleRemove"
              :on-success="handleUploadSuccess"
              :on-error="handleUploadError"
              :before-upload="beforeUpload"
            >
              <el-icon><Plus /></el-icon>
            </el-upload>
            
            <el-dialog v-model="dialogVisible">
              <img w-full :src="dialogImageUrl" alt="Preview Image" />
            </el-dialog>
          </el-form-item>
          
          <!-- 商品描述 -->
          <el-form-item label="商品描述" prop="description">
            <el-input
              v-model="form.description"
              type="textarea"
              :rows="6"
              placeholder="请详细描述商品的成色、使用年限等信息"
              maxlength="1000"
              show-word-limit
            />
          </el-form-item>
          
          <!-- 商品成色 -->
          <el-form-item label="商品成色" prop="conditionScore">
            <el-select
              v-model="form.conditionScore"
              placeholder="请选择商品成色"
            >
              <el-option
                v-for="item in conditionScores"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <!-- 提交按钮 -->
          <el-form-item>
            <el-button type="primary" native-type="submit" :loading="loading">
              保存修改
            </el-button>
            <el-button @click="handleCancel">取消</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useUserStore } from '@/stores/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const userStore = useUserStore()

const formRef = ref(null)
const loading = ref(false)
const fileList = ref([])
const dialogVisible = ref(false)
const dialogImageUrl = ref('')

// 商品分类选项
const categories = [
  { label: '数码电子', value: 1 },
  { label: '服装鞋包', value: 2 },
  { label: '图书教材', value: 3 },
  { label: '生活用品', value: 4 },
  { label: '其他', value: 5 }
]

// 商品成色选项
const conditionScores = [
  { label: '全新', value: 1 },
  { label: '九成新', value: 2 },
  { label: '八成新', value: 3 },
  { label: '七成新', value: 4 },
  { label: '六成新', value: 5 },
  { label: '五成新', value: 6 },
  { label: '四成新', value: 7 },
  { label: '三成新', value: 8 },
  { label: '二成新', value: 9 },
  { label: '一成新', value: 10 }
]

// 表单数据
const form = reactive({
  title: '',
  categoryId: '',
  price: 0,
  images: [],
  description: '',
  conditionScore: 1
})

// 表单验证规则
const rules = {
  title: [
    { required: true, message: '请输入商品标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在 2 到 50 个字符', trigger: 'blur' }
  ],
  categoryId: [
    { required: true, message: '请选择商品分类', trigger: 'change' }
  ],
  price: [
    { required: true, message: '请输入商品价格', trigger: 'blur' },
    { type: 'number', min: 0, message: '价格必须大于 0', trigger: 'blur' }
  ],
  description: [
    { required: true, message: '请输入商品描述', trigger: 'blur' },
    { min: 10, max: 1000, message: '描述长度在 10 到 1000 个字符', trigger: 'blur' }
  ],
  conditionScore: [
    { required: true, message: '请选择商品成色', trigger: 'change' }
  ]
}

// 获取商品详情
const fetchProductDetail = async () => {
  try {
    loading.value = true
    console.log('正在获取商品ID:', route.params.id)
    const res = await productStore.fetchProductDetail(route.params.id)
    console.log('获取到的商品信息:', res.data)
    
    if (!res.data) {
      throw new Error('未获取到商品信息')
    }
    
    const product = res.data
    
    // 填充表单数据
    Object.assign(form, {
      title: product.title,
      categoryId: product.categoryId,
      price: product.price,
      description: product.description,
      conditionScore: product.conditionScore
    })
    
    // 设置图片列表
    if (product.images?.length) {
      fileList.value = product.images.map(url => ({
        name: url.split('/').pop(),
        url
      }))
      form.images = product.images
    }
  } catch (error) {
    console.error('获取商品详情失败：', error)
    ElMessage.error(error.message || '获取商品详情失败')
    router.push('/profile')
  } finally {
    loading.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    loading.value = true
    
    // 检查是否已登录
    if (!userStore.isLoggedIn) {
      ElMessage.warning('请先登录')
      router.push('/login')
      return
    }
    
    // 构造符合后端要求的数据结构
    const productData = {
      title: form.title,
      categoryId: Number(form.categoryId),
      price: Number(form.price),
      description: form.description,
      conditionScore: Number(form.conditionScore),
      images: form.images || []
    }
    
    console.log('提交的商品数据:', productData)
    await productStore.updateProduct(route.params.id, productData)
    ElMessage.success('商品更新成功')
    router.push('/profile')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交失败：', error)
      ElMessage.error(error.message || '提交失败，请重试')
    }
  } finally {
    loading.value = false
  }
}

// 取消编辑
const handleCancel = () => {
  ElMessageBox.confirm(
    '确定要取消编辑吗？未保存的修改将会丢失',
    '提示',
    {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(() => {
    router.back()
  }).catch(() => {})
}

// 图片上传相关方法
const handlePictureCardPreview = (file) => {
  dialogImageUrl.value = file.url
  dialogVisible.value = true
}

const handleRemove = (file, fileList) => {
  form.images = fileList.map(file => file.url)
}

const handleUploadSuccess = (response, file, fileList) => {
  // 确保response.data是图片URL
  const imageUrl = response.data || response.url
  form.images = fileList.map(file => file.url || imageUrl)
  ElMessage.success('图片上传成功')
}

const handleUploadError = () => {
  ElMessage.error('图片上传失败')
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件！')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB！')
    return false
  }
  return true
}

// 初始化
onMounted(async () => {
  // 检查是否已登录
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  await fetchProductDetail()
})
</script>

<style scoped>
.edit-product-container {
  padding: 20px 0;
}

.edit-form {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.form-title {
  margin: 0 0 30px;
  text-align: center;
  color: var(--text-color);
}

:deep(.el-upload--picture-card) {
  width: 120px;
  height: 120px;
  line-height: 120px;
}

:deep(.el-upload-list--picture-card .el-upload-list__item) {
  width: 120px;
  height: 120px;
}
</style> 