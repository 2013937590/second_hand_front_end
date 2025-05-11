<template>
  <div class="review-container">
    <div class="container">
      <div class="page-header">
        <el-button @click="router.back()">返回</el-button>
        <h2 class="page-title">订单评价</h2>
      </div>
      
      <div v-loading="loading">
        <el-empty
          v-if="!order"
          description="订单不存在"
        />
        
        <template v-else>
          <!-- 订单信息 -->
          <el-card class="order-card">
            <template #header>
              <div class="card-header">
                <span>订单信息</span>
              </div>
            </template>
            
            <div class="order-info">
              <el-image
                :src="order.product.images[0]"
                :preview-src-list="order.product.images"
                fit="cover"
                class="product-image"
              />
              <div class="product-info">
                <h3 class="product-title">{{ order.product.title }}</h3>
                <p class="product-price">¥{{ order.amount }}</p>
              </div>
            </div>
          </el-card>
          
          <!-- 评价表单 -->
          <el-card class="review-form-card">
            <template #header>
              <div class="card-header">
                <span>评价内容</span>
              </div>
            </template>
            
            <el-form
              ref="formRef"
              :model="form"
              :rules="rules"
              label-width="80px"
            >
              <el-form-item label="评分" prop="rating">
                <el-rate
                  v-model="form.rating"
                  :texts="['很差', '较差', '一般', '较好', '很好']"
                  show-text
                />
              </el-form-item>
              
              <el-form-item label="评价内容" prop="content">
                <el-input
                  v-model="form.content"
                  type="textarea"
                  :rows="4"
                  placeholder="请输入您的评价内容"
                  maxlength="500"
                  show-word-limit
                />
              </el-form-item>
              
              <el-form-item label="上传图片">
                <el-upload
                  v-model:file-list="form.images"
                  action="/api/upload"
                  list-type="picture-card"
                  :limit="6"
                  :on-preview="handlePreview"
                  :on-remove="handleRemove"
                  :before-upload="beforeUpload"
                >
                  <el-icon><Plus /></el-icon>
                </el-upload>
              </el-form-item>
              
              <el-form-item>
                <el-button
                  type="primary"
                  :loading="submitting"
                  @click="submitReview"
                >
                  提交评价
                </el-button>
                <el-button @click="router.back()">取消</el-button>
              </el-form-item>
            </el-form>
          </el-card>
        </template>
      </div>
    </div>
    
    <!-- 图片预览 -->
    <el-dialog v-model="previewVisible" title="预览">
      <img :src="previewUrl" alt="Preview" style="width: 100%" />
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { ElMessage } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

// 加载状态
const loading = ref(false)
const submitting = ref(false)

// 订单信息
const order = ref(null)

// 表单引用
const formRef = ref(null)

// 表单数据
const form = reactive({
  rating: 5,
  content: '',
  images: []
})

// 表单验证规则
const rules = {
  rating: [
    { required: true, message: '请选择评分', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入评价内容', trigger: 'blur' },
    { min: 10, max: 500, message: '评价内容长度在 10 到 500 个字符之间', trigger: 'blur' }
  ]
}

// 图片预览
const previewVisible = ref(false)
const previewUrl = ref('')

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    loading.value = true
    const res = await orderStore.getOrderDetail(route.params.id)
    order.value = res.data
    
    // 检查订单状态
    if (order.value.status !== 'COMPLETED') {
      ElMessage.error('该订单无法评价')
      router.back()
    }
  } catch (error) {
    console.error('获取订单详情失败：', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 提交评价
const submitReview = async () => {
  if (!formRef.value) return
  
  try {
    await formRef.value.validate()
    
    submitting.value = true
    const params = {
      orderId: order.value.id,
      rating: form.rating,
      content: form.content,
      images: form.images.map(file => file.url)
    }
    
    await orderStore.submitReview(params)
    ElMessage.success('评价成功')
    router.back()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('提交评价失败：', error)
      ElMessage.error('提交评价失败')
    }
  } finally {
    submitting.value = false
  }
}

// 图片上传前的处理
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

// 预览图片
const handlePreview = (file) => {
  previewUrl.value = file.url
  previewVisible.value = true
}

// 移除图片
const handleRemove = (file) => {
  const index = form.images.indexOf(file)
  if (index !== -1) {
    form.images.splice(index, 1)
  }
}

// 初始化
onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.review-container {
  padding: 20px 0;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.page-title {
  margin: 0;
  font-size: 24px;
  color: var(--text-color);
}

.order-card,
.review-form-card {
  margin-bottom: 20px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.order-info {
  display: flex;
  gap: 20px;
  align-items: center;
}

.product-image {
  width: 120px;
  height: 120px;
  border-radius: 4px;
  object-fit: cover;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-title {
  margin: 0;
  font-size: 18px;
  color: var(--text-color);
}

.product-price {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
}

:deep(.el-rate) {
  margin-top: 8px;
}

:deep(.el-upload--picture-card) {
  width: 100px;
  height: 100px;
  line-height: 100px;
}
</style> 