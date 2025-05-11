<template>
  <div class="order-detail-container">
    <div class="container">
      <div class="page-header">
        <el-button @click="router.back()">返回</el-button>
        <h2 class="page-title">订单详情</h2>
      </div>
      
      <div v-loading="loading">
        <el-empty
          v-if="!order"
          description="订单不存在"
        />
        
        <template v-else>
          <!-- 订单状态 -->
          <el-card class="status-card">
            <div class="status-header">
              <el-tag :type="getOrderStatusType(order.status)" size="large">
                {{ getOrderStatusText(order.status) }}
              </el-tag>
              <div class="status-actions">
                <template v-if="order.status === 'PENDING'">
                  <el-button
                    type="primary"
                    @click="handlePay"
                  >
                    立即付款
                  </el-button>
                  <el-button
                    @click="handleCancel"
                  >
                    取消订单
                  </el-button>
                </template>
                
                <template v-if="order.status === 'PAID' && order.isSeller">
                  <el-button
                    type="primary"
                    @click="handleShip"
                  >
                    发货
                  </el-button>
                </template>
                
                <template v-if="order.status === 'SHIPPED' && !order.isSeller">
                  <el-button
                    type="primary"
                    @click="handleConfirm"
                  >
                    确认收货
                  </el-button>
                </template>
                
                <template v-if="order.status === 'COMPLETED'">
                  <el-button
                    type="primary"
                    @click="handleReview"
                  >
                    评价
                  </el-button>
                </template>
              </div>
            </div>
          </el-card>
          
          <!-- 订单信息 -->
          <el-card class="info-card">
            <template #header>
              <div class="card-header">
                <span>订单信息</span>
              </div>
            </template>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="订单号">
                {{ order.orderNo }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDate(order.createTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="支付时间" v-if="order.payTime">
                {{ formatDate(order.payTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="发货时间" v-if="order.shipTime">
                {{ formatDate(order.shipTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="完成时间" v-if="order.completeTime">
                {{ formatDate(order.completeTime) }}
              </el-descriptions-item>
              <el-descriptions-item label="订单金额">
                ¥{{ order.amount }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
          
          <!-- 商品信息 -->
          <el-card class="product-card">
            <template #header>
              <div class="card-header">
                <span>商品信息</span>
              </div>
            </template>
            
            <div class="product-info">
              <el-image
                :src="order.product.images[0]"
                :preview-src-list="order.product.images"
                fit="cover"
                class="product-image"
              />
              <div class="product-detail">
                <h3 class="product-title">{{ order.product.title }}</h3>
                <p class="product-category">{{ order.product.category }}</p>
                <p class="product-price">¥{{ order.amount }}</p>
              </div>
            </div>
          </el-card>
          
          <!-- 买卖家信息 -->
          <el-card class="user-card">
            <template #header>
              <div class="card-header">
                <span>交易信息</span>
              </div>
            </template>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="卖家">
                {{ order.seller.username }}
              </el-descriptions-item>
              <el-descriptions-item label="买家">
                {{ order.buyer.username }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { ElMessageBox, ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

// 加载状态
const loading = ref(false)

// 订单信息
const order = ref(null)

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const types = {
    PENDING: 'warning',
    PAID: 'success',
    SHIPPED: 'primary',
    COMPLETED: 'success',
    CANCELLED: 'info'
  }
  return types[status] || 'info'
}

// 获取订单状态文本
const getOrderStatusText = (status) => {
  const texts = {
    PENDING: '待付款',
    PAID: '已付款',
    SHIPPED: '已发货',
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return texts[status] || status
}

// 获取订单详情
const fetchOrderDetail = async () => {
  try {
    loading.value = true
    const res = await orderStore.getOrderDetail(route.params.id)
    order.value = res.data
  } catch (error) {
    console.error('获取订单详情失败：', error)
    ElMessage.error('获取订单详情失败')
  } finally {
    loading.value = false
  }
}

// 支付订单
const handlePay = async () => {
  try {
    await ElMessageBox.confirm('确认支付该订单吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await orderStore.payOrder(order.value.id)
    ElMessage.success('支付成功')
    fetchOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('支付失败：', error)
      ElMessage.error('支付失败')
    }
  }
}

// 取消订单
const handleCancel = async () => {
  try {
    await ElMessageBox.confirm('确认取消该订单吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await orderStore.cancelOrder(order.value.id)
    ElMessage.success('订单已取消')
    fetchOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败：', error)
      ElMessage.error('取消订单失败')
    }
  }
}

// 发货
const handleShip = async () => {
  try {
    await ElMessageBox.confirm('确认发货吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await orderStore.shipOrder(order.value.id)
    ElMessage.success('发货成功')
    fetchOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发货失败：', error)
      ElMessage.error('发货失败')
    }
  }
}

// 确认收货
const handleConfirm = async () => {
  try {
    await ElMessageBox.confirm('确认已收到商品吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await orderStore.confirmOrder(order.value.id)
    ElMessage.success('确认收货成功')
    fetchOrderDetail()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败：', error)
      ElMessage.error('确认收货失败')
    }
  }
}

// 评价
const handleReview = () => {
  router.push(`/review/${order.value.id}`)
}

// 初始化
onMounted(() => {
  fetchOrderDetail()
})
</script>

<style scoped>
.order-detail-container {
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

.status-card,
.info-card,
.product-card,
.user-card {
  margin-bottom: 20px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.status-actions {
  display: flex;
  gap: 10px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.product-info {
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

.product-detail {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.product-title {
  margin: 0;
  font-size: 18px;
  color: var(--text-color);
}

.product-category {
  margin: 0;
  color: var(--text-color-secondary);
}

.product-price {
  margin: 0;
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
}
</style> 