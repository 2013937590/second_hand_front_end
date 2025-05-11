<template>
  <div class="product-detail-container">
    <div class="container">
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <template v-else-if="product">
        <div class="product-detail">
          <!-- 商品图片 -->
          <div class="product-images">
            <el-carousel
              v-if="product.images?.length"
              height="400px"
              :interval="4000"
              type="card"
            >
              <el-carousel-item v-for="(image, index) in product.images" :key="index">
                <el-image
                  :src="image"
                  fit="cover"
                  :preview-src-list="product.images"
                />
              </el-carousel-item>
            </el-carousel>
            <el-empty v-else description="暂无图片" />
          </div>
          
          <!-- 商品信息 -->
          <div class="product-info">
            <h1 class="product-title">{{ product.title }}</h1>
            
            <div class="product-price">
              <span class="price-label">价格</span>
              <span class="price-value">¥{{ product.price }}</span>
            </div>
            
            <div class="product-meta">
              <div class="meta-item">
                <span class="label">分类：</span>
                <span class="value">{{ product.category }}</span>
              </div>
              <div class="meta-item">
                <span class="label">发布时间：</span>
                <span class="value">{{ formatDate(product.createTime) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">卖家：</span>
                <span class="value">{{ product.seller?.username }}</span>
              </div>
            </div>
            
            <div class="product-description">
              <h3>商品描述</h3>
              <p>{{ product.description }}</p>
            </div>
            
            <!-- 操作按钮 -->
            <div class="product-actions">
              <el-button
                v-if="!isOwner"
                type="primary"
                size="large"
                @click="handleContact"
              >
                联系卖家
              </el-button>
              <el-button
                v-if="!isOwner"
                type="success"
                size="large"
                @click="handleBuy"
              >
                立即购买
              </el-button>
              <template v-else>
                <el-button
                  type="primary"
                  size="large"
                  @click="handleEdit"
                >
                  编辑商品
                </el-button>
                <el-button
                  type="danger"
                  size="large"
                  @click="handleDelete"
                >
                  删除商品
                </el-button>
              </template>
            </div>
          </div>
        </div>
      </template>
      
      <el-empty v-else description="商品不存在" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { useUserStore } from '@/stores/user'
import { ElMessageBox, ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const userStore = useUserStore()

const product = ref(null)
const loading = ref(true)

// 判断是否是商品所有者
const isOwner = computed(() => {
  return product.value?.seller?.id === userStore.user?.id
})

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取商品详情
const fetchProductDetail = async () => {
  try {
    loading.value = true
    const res = await productStore.getProductDetail(route.params.id)
    product.value = res.data
  } catch (error) {
    console.error('获取商品详情失败：', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

// 联系卖家
const handleContact = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push(`/chat/${product.value.seller.id}`)
}

// 购买商品
const handleBuy = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  router.push(`/order/create/${product.value.id}`)
}

// 编辑商品
const handleEdit = () => {
  router.push(`/product/edit/${product.value.id}`)
}

// 删除商品
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await productStore.deleteProduct(product.value.id)
    ElMessage.success('删除成功')
    router.push('/')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败：', error)
      ElMessage.error('删除商品失败')
    }
  }
}

onMounted(() => {
  fetchProductDetail()
})
</script>

<style scoped>
.product-detail-container {
  padding: 20px 0;
}

.product-detail {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.product-images {
  width: 100%;
}

.product-images :deep(.el-carousel__item) {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f7fa;
}

.product-images :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.product-title {
  margin: 0;
  font-size: 24px;
  color: var(--text-color);
}

.product-price {
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.price-label {
  font-size: 16px;
  color: var(--text-color-secondary);
}

.price-value {
  font-size: 32px;
  color: var(--danger-color);
  font-weight: bold;
}

.product-meta {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.meta-item {
  display: flex;
  gap: 10px;
}

.meta-item .label {
  color: var(--text-color-secondary);
  min-width: 80px;
}

.product-description {
  flex: 1;
}

.product-description h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: var(--text-color);
}

.product-description p {
  margin: 0;
  color: var(--text-color-regular);
  line-height: 1.6;
  white-space: pre-wrap;
}

.product-actions {
  display: flex;
  gap: 20px;
}

.loading-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
  }
}
</style> 