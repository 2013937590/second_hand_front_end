<template>
  <div class="orders-container">
    <div class="container">
      <h2 class="page-title">我的订单</h2>
      
      <!-- 订单筛选 -->
      <div class="filter-section">
        <el-form :inline="true" :model="filterForm">
          <el-form-item label="订单状态">
            <el-select v-model="filterForm.status" placeholder="全部状态" clearable>
              <el-option
                v-for="item in orderStatusOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 订单列表 -->
      <div v-loading="loading">
        <el-empty
          v-if="!orders.length"
          description="暂无订单"
        />
        
        <div v-else class="order-list">
          <el-card
            v-for="order in orders"
            :key="order.id"
            class="order-card"
            shadow="hover"
          >
            <div class="order-header">
              <div class="order-info">
                <span class="order-no">订单号：{{ order.orderNo }}</span>
                <span class="order-time">{{ formatDate(order.createTime) }}</span>
              </div>
              <el-tag :type="getOrderStatusType(order.status)">
                {{ getOrderStatusText(order.status) }}
              </el-tag>
            </div>
            
            <div class="order-content">
              <div class="product-info">
                <el-image
                  :src="order.product.images[0]"
                  :preview-src-list="order.product.images"
                  fit="cover"
                  class="product-image"
                />
                <div class="product-detail">
                  <h3 class="product-title">{{ order.product.title }}</h3>
                  <p class="product-price">¥{{ order.amount }}</p>
                </div>
              </div>
              
              <div class="order-actions">
                <template v-if="order.status === 'PENDING'">
                  <el-button
                    type="primary"
                    @click="handlePay(order)"
                  >
                    立即付款
                  </el-button>
                  <el-button
                    @click="handleCancel(order)"
                  >
                    取消订单
                  </el-button>
                </template>
                
                <template v-if="order.status === 'PAID' && order.isSeller">
                  <el-button
                    type="primary"
                    @click="handleShip(order)"
                  >
                    发货
                  </el-button>
                </template>
                
                <template v-if="order.status === 'SHIPPED' && !order.isSeller">
                  <el-button
                    type="primary"
                    @click="handleConfirm(order)"
                  >
                    确认收货
                  </el-button>
                </template>
                
                <template v-if="order.status === 'COMPLETED'">
                  <el-button
                    type="primary"
                    @click="handleReview(order)"
                  >
                    评价
                  </el-button>
                </template>
                
                <el-button
                  link
                  type="primary"
                  @click="viewOrderDetail(order.id)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </el-card>
        </div>
        
        <!-- 分页 -->
        <div class="pagination-container" v-if="total > 0">
          <el-pagination
            v-model:current-page="currentPage"
            v-model:page-size="pageSize"
            :total="total"
            :page-sizes="[10, 20, 30, 50]"
            layout="total, sizes, prev, pager, next"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { ElMessageBox, ElMessage } from 'element-plus'
import dayjs from 'dayjs'

const router = useRouter()
const orderStore = useOrderStore()

// 加载状态
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 订单列表
const orders = ref([])

// 筛选表单
const filterForm = reactive({
  status: ''
})

// 订单状态选项
const orderStatusOptions = [
  { label: '待付款', value: 'PENDING' },
  { label: '已付款', value: 'PAID' },
  { label: '已发货', value: 'SHIPPED' },
  { label: '已完成', value: 'COMPLETED' },
  { label: '已取消', value: 'CANCELLED' }
]

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

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      status: filterForm.status
    }
    
    const res = await orderStore.getOrders(params)
    orders.value = res.data.content
    total.value = res.data.total
  } catch (error) {
    console.error('获取订单列表失败：', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 搜索
const handleSearch = () => {
  currentPage.value = 1
  fetchOrders()
}

// 重置
const handleReset = () => {
  filterForm.status = ''
  handleSearch()
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchOrders()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchOrders()
}

// 查看订单详情
const viewOrderDetail = (id) => {
  router.push(`/orders/${id}`)
}

// 支付订单
const handlePay = async (order) => {
  try {
    await ElMessageBox.confirm('确认支付该订单吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await orderStore.payOrder(order.id)
    ElMessage.success('支付成功')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('支付失败：', error)
      ElMessage.error('支付失败')
    }
  }
}

// 取消订单
const handleCancel = async (order) => {
  try {
    await ElMessageBox.confirm('确认取消该订单吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await orderStore.cancelOrder(order.id)
    ElMessage.success('订单已取消')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('取消订单失败：', error)
      ElMessage.error('取消订单失败')
    }
  }
}

// 发货
const handleShip = async (order) => {
  try {
    await ElMessageBox.confirm('确认发货吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await orderStore.shipOrder(order.id)
    ElMessage.success('发货成功')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发货失败：', error)
      ElMessage.error('发货失败')
    }
  }
}

// 确认收货
const handleConfirm = async (order) => {
  try {
    await ElMessageBox.confirm('确认已收到商品吗？', '提示', {
      confirmButtonText: '确认',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await orderStore.confirmOrder(order.id)
    ElMessage.success('确认收货成功')
    fetchOrders()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('确认收货失败：', error)
      ElMessage.error('确认收货失败')
    }
  }
}

// 评价
const handleReview = (order) => {
  router.push(`/review/${order.id}`)
}

// 初始化
onMounted(() => {
  fetchOrders()
})
</script>

<style scoped>
.orders-container {
  padding: 20px 0;
}

.page-title {
  margin: 0 0 20px;
  font-size: 24px;
  color: var(--text-color);
}

.filter-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.order-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.order-card {
  background: #fff;
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--border-color);
}

.order-info {
  display: flex;
  gap: 20px;
  color: var(--text-color-secondary);
}

.order-content {
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
  width: 100px;
  height: 100px;
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
  font-size: 16px;
  color: var(--text-color);
}

.product-price {
  margin: 0;
  font-size: 18px;
  font-weight: bold;
  color: var(--primary-color);
}

.order-actions {
  display: flex;
  gap: 10px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}
</style> 