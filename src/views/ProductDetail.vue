<template>
  <div class="product-detail-container">
    <div class="container">
      <!-- 添加返回按钮 -->
      <div class="back-button">
        <el-button @click="handleBack" icon="ArrowLeft">返回</el-button>
      </div>

      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <template v-else-if="product">
        <div class="product-detail">
          <!-- 左侧商品图片 -->
          <div class="product-images">
            <el-carousel v-if="product.images?.length" height="400px">
              <el-carousel-item v-for="image in product.images" :key="image">
                <img :src="image" :alt="product.title" class="product-image" />
              </el-carousel-item>
            </el-carousel>
            <div v-else class="no-image">
              <el-empty description="暂无图片" />
            </div>
          </div>
          
          <!-- 右侧商品信息 -->
          <div class="product-info">
            <h1 class="product-title">{{ product.title }}</h1>
            
            <div class="product-meta">
              <div class="meta-item">
                <span class="label">商品分类：</span>
                <span class="value">{{ getCategoryName(product.categoryId) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">商品成色：</span>
                <span class="value">{{ getConditionScoreText(product.conditionScore) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">发布时间：</span>
                <span class="value">{{ formatDate(product.createdAt) }}</span>
              </div>
              <div class="meta-item">
                <span class="label">浏览次数：</span>
                <span class="value">{{ product.viewCount }}</span>
              </div>
            </div>
            
            <div class="product-price">
              <span class="price-label">价格</span>
              <span class="price-value">¥{{ product.price }}</span>
            </div>
            
            <div class="product-description">
              <h3>商品描述</h3>
              <p>{{ product.description }}</p>
            </div>
            
            <!-- 操作按钮 -->
            <div class="product-actions">
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
import { ArrowLeft } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const productStore = useProductStore()
const userStore = useUserStore()

const product = ref(null)
const loading = ref(true)

// 判断是否是商品所有者
const isOwner = computed(() => {
  return product.value?.userId === userStore.user?.id
})

// 商品分类映射
const categoryMap = {
  1: '数码电子',
  2: '服装鞋包',
  3: '图书教材',
  4: '生活用品',
  5: '其他'
}

// 获取分类名称
const getCategoryName = (categoryId) => {
  return categoryMap[categoryId] || '未知分类'
}

// 获取成色描述
const getConditionScoreText = (score) => {
  const scoreMap = {
    1: '全新',
    2: '九成新',
    3: '八成新',
    4: '七成新',
    5: '六成新',
    6: '五成新',
    7: '四成新',
    8: '三成新',
    9: '二成新',
    10: '一成新'
  }
  return scoreMap[score] || '未知成色'
}

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取商品详情
const fetchProductDetail = async () => {
  try {
    loading.value = true
    const res = await productStore.fetchProductDetail(route.params.id)
    product.value = res.data
  } catch (error) {
    console.error('获取商品详情失败：', error)
    ElMessage.error('获取商品详情失败')
  } finally {
    loading.value = false
  }
}

// 返回上一页
const handleBack = () => {
  router.back()
}

// 购买商品
const handleBuy = () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录')
    router.push('/login')
    return
  }
  
  // 检查是否是自己的商品
  if (isOwner.value) {
    ElMessage.warning('不能购买自己的商品')
    return
  }
  
  // 检查商品状态
  if (product.value.status !== 'available') {
    ElMessage.warning('该商品已售出或下架')
    return
  }
  
  // 跳转到创建订单页面
  router.push({
    path: `/order/create/${product.value.id}`,
    query: {
      productTitle: product.value.title,
      price: product.value.price
    }
  })
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

.product-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.no-image {
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 8px;
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

.product-meta {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  padding: 20px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.meta-item .label {
  font-size: 14px;
  color: var(--text-color-secondary);
}

.meta-item .value {
  font-size: 16px;
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
  font-weight: bold;
  color: var(--primary-color);
}

.product-description {
  padding: 20px 0;
  border-top: 1px solid var(--border-color);
}

.product-description h3 {
  margin: 0 0 10px;
  font-size: 18px;
  color: var(--text-color);
}

.product-description p {
  margin: 0;
  font-size: 16px;
  color: var(--text-color);
  line-height: 1.6;
  white-space: pre-wrap;
}

.product-actions {
  display: flex;
  gap: 10px;
  margin-top: auto;
}

.loading-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.back-button {
  margin-bottom: 20px;
}

@media (max-width: 768px) {
  .product-detail {
    grid-template-columns: 1fr;
  }
}
</style> 