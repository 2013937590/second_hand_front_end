<template>
  <div class="profile-container">
    <div class="container">
      <div class="profile-box">
        <div class="profile-header">
          <h2 class="page-title">个人中心</h2>
          <el-button type="primary" @click="goToEdit" :icon="Edit">编辑资料</el-button>
        </div>
        
        <!-- 个人信息卡片 -->
        <el-card class="user-info-card" :body-style="{ padding: '30px' }">
          <div class="user-info">
            <div class="avatar-container">
              <el-avatar :size="120" :src="userInfo?.avatarUrl" class="user-avatar">
                {{ userInfo?.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
              <div class="user-name">{{ userInfo?.username }}</div>
            </div>
            <div class="info-content">
              <div class="info-item">
                <span class="label">
                  <el-icon><Phone /></el-icon>
                  手机号
                </span>
                <span class="value">{{ userInfo?.phone }}</span>
              </div>
              <div class="info-item">
                <span class="label">
                  <el-icon><Wallet /></el-icon>
                  账户余额
                </span>
                <span class="value price">¥{{ userInfo?.balance?.toFixed(2) }}</span>
              </div>
              <div class="info-item">
                <span class="label">
                  <el-icon><Calendar /></el-icon>
                  注册时间
                </span>
                <span class="value">{{ formatDate(userInfo?.createdAt) }}</span>
              </div>
            </div>
          </div>
        </el-card>
        
        <el-tabs v-model="activeTab" class="mt-20">
          <el-tab-pane label="我的商品" name="products">
            <div class="tab-header">
              <el-button type="primary" @click="goToPublish" :icon="Plus">发布商品</el-button>
            </div>
            
            <el-table
              v-loading="loading"
              :data="products"
              style="width: 100%"
              :header-cell-style="{ background: '#f5f7fa' }"
              :row-class-name="tableRowClassName"
            >
              <el-table-column prop="title" label="商品标题" min-width="200" show-overflow-tooltip />
              <el-table-column prop="price" label="价格" width="120">
                <template #default="{ row }">
                  <span class="price">¥{{ row.price }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="row.status === 'SOLD' ? 'success' : 'warning'" effect="light">
                    {{ row.status === 'SOLD' ? '已售出' : '在售' }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="200" fixed="right">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    link
                    :icon="Edit"
                    @click="editProduct(row.id)"
                  >
                    编辑
                  </el-button>
                  <el-button
                    type="danger"
                    link
                    :icon="Delete"
                    @click="deleteProduct(row.id)"
                  >
                    删除
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          
          <el-tab-pane label="我的订单" name="orders">
            <el-table
              v-loading="loading"
              :data="orders"
              style="width: 100%"
              :header-cell-style="{ background: '#f5f7fa' }"
              :row-class-name="tableRowClassName"
            >
              <el-table-column prop="productTitle" label="商品标题" min-width="200" show-overflow-tooltip />
              <el-table-column prop="price" label="价格" width="120">
                <template #default="{ row }">
                  <span class="price">¥{{ row.price }}</span>
                </template>
              </el-table-column>
              <el-table-column prop="status" label="状态" width="100">
                <template #default="{ row }">
                  <el-tag :type="getOrderStatusType(row.status)" effect="light">
                    {{ getOrderStatusText(row.status) }}
                  </el-tag>
                </template>
              </el-table-column>
              <el-table-column label="操作" width="120" fixed="right">
                <template #default="{ row }">
                  <el-button
                    type="primary"
                    link
                    :icon="View"
                    @click="viewOrderDetail(row.id)"
                  >
                    查看详情
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'
import { useOrderStore } from '@/stores/order'
import { ElMessageBox, ElMessage } from 'element-plus'
import { Edit, Plus, Delete, View, Phone, Wallet, Calendar } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()
const productStore = useProductStore()
const orderStore = useOrderStore()

const loading = ref(false)
const activeTab = ref('products')
const products = ref([])
const orders = ref([])
const userInfo = ref(null)

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取商品列表
const fetchProducts = async () => {
  try {
    loading.value = true
    const res = await productStore.fetchUserProducts()
    products.value = res.data.content || []
  } catch (error) {
    console.error('获取商品列表失败：', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 获取订单列表
const fetchOrders = async () => {
  try {
    loading.value = true
    const res = await orderStore.fetchUserOrders()
    orders.value = res.data || []
  } catch (error) {
    console.error('获取订单列表失败：', error)
    ElMessage.error('获取订单列表失败')
  } finally {
    loading.value = false
  }
}

// 获取用户信息
const fetchUserInfo = async () => {
  try {
    const res = await userStore.fetchUserInfo()
    userInfo.value = res.data
  } catch (error) {
    console.error('获取用户信息失败：', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 跳转到发布商品页面
const goToPublish = () => {
  router.push('/publish')
}

// 跳转到编辑资料页面
const goToEdit = () => {
  router.push('/profile/edit')
}

// 编辑商品
const editProduct = (id) => {
  router.push(`/product/edit/${id}`)
}

// 删除商品
const deleteProduct = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await userStore.deleteProduct(id)
    ElMessage.success('删除成功')
    await fetchProducts()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败：', error)
      ElMessage.error('删除商品失败')
    }
  }
}

// 查看订单详情
const viewOrderDetail = (id) => {
  router.push(`/orders/${id}`)
}

// 获取订单状态类型
const getOrderStatusType = (status) => {
  const types = {
    PENDING: 'warning',
    PAID: 'success',
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
    COMPLETED: '已完成',
    CANCELLED: '已取消'
  }
  return texts[status] || status
}

// 表格行样式
const tableRowClassName = ({ row, rowIndex }) => {
  if (rowIndex % 2 === 0) {
    return 'even-row'
  }
  return 'odd-row'
}

// 初始化
onMounted(async () => {
  try {
    await Promise.all([
      fetchUserInfo(),
      fetchProducts(),
      fetchOrders()
    ])
  } catch (error) {
    console.error('获取数据失败：', error)
    ElMessage.error('获取数据失败')
  }
})
</script>

<style scoped>
.profile-container {
  padding: 20px 0;
  min-height: calc(100vh - 60px);
  background-color: #f5f7fa;
}

.profile-box {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  padding: 30px;
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 1px solid #ebeef5;
}

.page-title {
  margin: 0;
  color: var(--text-color);
  font-size: 24px;
  font-weight: 600;
}

.user-info-card {
  margin-bottom: 30px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.user-info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.user-info {
  display: flex;
  gap: 50px;
}

.avatar-container {
  flex-shrink: 0;
  text-align: center;
}

.user-avatar {
  border: 4px solid #fff;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.user-avatar:hover {
  transform: scale(1.05);
}

.user-name {
  margin-top: 10px;
  font-size: 18px;
  font-weight: 500;
  color: var(--text-color);
}

.info-content {
  flex-grow: 1;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 30px;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 15px;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-item:hover {
  background: #f0f2f5;
  transform: translateY(-2px);
}

.info-item .label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: var(--text-color-secondary);
}

.info-item .label .el-icon {
  font-size: 16px;
}

.info-item .value {
  font-size: 18px;
  color: var(--text-color);
  font-weight: 500;
}

.info-item .value.price {
  color: #f56c6c;
  font-size: 20px;
}

.mt-20 {
  margin-top: 30px;
}

.tab-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

:deep(.el-tabs__nav-wrap::after) {
  height: 1px;
  background-color: #ebeef5;
}

:deep(.el-tabs__item) {
  font-size: 16px;
  padding: 0 20px;
  height: 50px;
  line-height: 50px;
}

:deep(.el-tabs__item.is-active) {
  font-weight: 600;
}

:deep(.el-table) {
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table th) {
  font-weight: 600;
}

:deep(.el-table .even-row) {
  background-color: #fafafa;
}

:deep(.el-table .odd-row) {
  background-color: #fff;
}

:deep(.el-table tr:hover > td) {
  background-color: #f5f7fa !important;
}

:deep(.el-button--primary.is-link) {
  font-weight: 500;
}

:deep(.el-tag) {
  border-radius: 4px;
  padding: 0 12px;
  height: 24px;
  line-height: 24px;
}
</style> 