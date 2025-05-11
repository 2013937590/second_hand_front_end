<template>
  <div class="profile-container">
    <div class="container">
      <el-row :gutter="20">
        <!-- 左侧用户信息 -->
        <el-col :span="6">
          <div class="user-card">
            <div class="user-avatar">
              <el-avatar
                :size="100"
                :src="user?.avatar || '/default-avatar.png'"
              />
            </div>
            
            <h2 class="username">{{ user?.username }}</h2>
            
            <div class="user-stats">
              <div class="stat-item">
                <span class="label">发布商品</span>
                <span class="value">{{ userStats.publishedCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">已售出</span>
                <span class="value">{{ userStats.soldCount }}</span>
              </div>
              <div class="stat-item">
                <span class="label">已购买</span>
                <span class="value">{{ userStats.boughtCount }}</span>
              </div>
            </div>
            
            <el-button
              type="primary"
              class="edit-profile-btn"
              @click="handleEditProfile"
            >
              编辑资料
            </el-button>
          </div>
        </el-col>
        
        <!-- 右侧内容区 -->
        <el-col :span="18">
          <el-tabs v-model="activeTab">
            <!-- 我发布的商品 -->
            <el-tab-pane label="我发布的商品" name="published">
              <div class="tab-header">
                <el-button
                  type="primary"
                  @click="handlePublish"
                >
                  发布新商品
                </el-button>
              </div>
              
              <div v-if="loading" class="loading-container">
                <el-skeleton :rows="3" animated />
              </div>
              
              <template v-else>
                <el-empty
                  v-if="!publishedProducts.length"
                  description="暂无发布的商品"
                />
                
                <div v-else class="product-grid">
                  <el-row :gutter="20">
                    <el-col
                      v-for="product in publishedProducts"
                      :key="product.id"
                      :xs="24"
                      :sm="12"
                      :md="8"
                      class="mb-20"
                    >
                      <ProductCard
                        :product="product"
                        :show-actions="true"
                        @click="goToDetail"
                        @edit="handleEdit"
                        @delete="handleDelete"
                      />
                    </el-col>
                  </el-row>
                  
                  <!-- 分页 -->
                  <div class="pagination-container" v-if="total > 0">
                    <el-pagination
                      v-model:current-page="currentPage"
                      v-model:page-size="pageSize"
                      :total="total"
                      :page-sizes="[12, 24, 36, 48]"
                      layout="total, sizes, prev, pager, next"
                      @size-change="handleSizeChange"
                      @current-change="handleCurrentChange"
                    />
                  </div>
                </div>
              </template>
            </el-tab-pane>
            
            <!-- 我的订单 -->
            <el-tab-pane label="我的订单" name="orders">
              <div class="tab-header">
                <el-button
                  type="primary"
                  @click="goToOrders"
                >
                  查看全部订单
                </el-button>
              </div>
              
              <el-table
                v-loading="loading"
                :data="recentOrders"
                style="width: 100%"
              >
                <el-table-column prop="orderNo" label="订单号" width="180" />
                <el-table-column prop="product.title" label="商品" />
                <el-table-column prop="amount" label="金额" width="120">
                  <template #default="{ row }">
                    ¥{{ row.amount }}
                  </template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="120">
                  <template #default="{ row }">
                    <el-tag :type="getOrderStatusType(row.status)">
                      {{ getOrderStatusText(row.status) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column prop="createTime" label="创建时间" width="180">
                  <template #default="{ row }">
                    {{ formatDate(row.createTime) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button
                      link
                      type="primary"
                      @click="viewOrderDetail(row.id)"
                    >
                      查看详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
            
            <!-- 我的消息 -->
            <el-tab-pane label="我的消息" name="messages">
              <div class="tab-header">
                <el-button
                  type="primary"
                  @click="goToMessages"
                >
                  查看全部消息
                </el-button>
              </div>
              
              <el-table
                v-loading="loading"
                :data="recentMessages"
                style="width: 100%"
              >
                <el-table-column prop="sender.username" label="发送者" width="120" />
                <el-table-column prop="content" label="内容" show-overflow-tooltip />
                <el-table-column prop="createTime" label="时间" width="180">
                  <template #default="{ row }">
                    {{ formatDate(row.createTime) }}
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="120" fixed="right">
                  <template #default="{ row }">
                    <el-button
                      link
                      type="primary"
                      @click="viewMessageDetail(row.id)"
                    >
                      查看详情
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { useProductStore } from '@/stores/product'
import { useOrderStore } from '@/stores/order'
import { useMessageStore } from '@/stores/message'
import { ElMessageBox, ElMessage } from 'element-plus'
import ProductCard from '@/components/ProductCard.vue'
import dayjs from 'dayjs'

const router = useRouter()
const userStore = useUserStore()
const productStore = useProductStore()
const orderStore = useOrderStore()
const messageStore = useMessageStore()

// 用户信息
const user = computed(() => userStore.user)

// 用户统计数据
const userStats = reactive({
  publishedCount: 0,
  soldCount: 0,
  boughtCount: 0
})

// 标签页
const activeTab = ref('published')

// 加载状态
const loading = ref(false)

// 分页相关
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 商品列表
const publishedProducts = ref([])

// 最近订单
const recentOrders = ref([])

// 最近消息
const recentMessages = ref([])

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

// 获取用户统计数据
const fetchUserStats = async () => {
  try {
    const res = await userStore.getUserStats()
    Object.assign(userStats, res.data)
  } catch (error) {
    console.error('获取用户统计数据失败：', error)
  }
}

// 获取发布的商品列表
const fetchPublishedProducts = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value
    }
    
    const res = await productStore.getUserProducts(params)
    publishedProducts.value = res.data.content
    total.value = res.data.total
  } catch (error) {
    console.error('获取发布的商品列表失败：', error)
    ElMessage.error('获取商品列表失败')
  } finally {
    loading.value = false
  }
}

// 获取最近订单
const fetchRecentOrders = async () => {
  try {
    const res = await orderStore.getRecentOrders()
    recentOrders.value = res.data
  } catch (error) {
    console.error('获取最近订单失败：', error)
  }
}

// 获取最近消息
const fetchRecentMessages = async () => {
  try {
    const res = await messageStore.getRecentMessages()
    recentMessages.value = res.data
  } catch (error) {
    console.error('获取最近消息失败：', error)
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchPublishedProducts()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchPublishedProducts()
}

// 编辑资料
const handleEditProfile = () => {
  router.push('/profile/edit')
}

// 发布新商品
const handlePublish = () => {
  router.push('/publish')
}

// 查看商品详情
const goToDetail = (id) => {
  router.push(`/product/${id}`)
}

// 编辑商品
const handleEdit = (id) => {
  router.push(`/product/edit/${id}`)
}

// 删除商品
const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await productStore.deleteProduct(id)
    ElMessage.success('删除成功')
    fetchPublishedProducts()
    fetchUserStats()
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

// 查看消息详情
const viewMessageDetail = (id) => {
  router.push(`/messages/${id}`)
}

// 跳转到订单页面
const goToOrders = () => {
  router.push('/orders')
}

// 跳转到消息页面
const goToMessages = () => {
  router.push('/messages')
}

// 初始化
onMounted(() => {
  fetchUserStats()
  fetchPublishedProducts()
  fetchRecentOrders()
  fetchRecentMessages()
})
</script>

<style scoped>
.profile-container {
  padding: 20px 0;
}

.user-card {
  background: #fff;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  text-align: center;
}

.user-avatar {
  margin-bottom: 20px;
}

.username {
  margin: 0 0 20px;
  font-size: 20px;
  color: var(--text-color);
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin-bottom: 20px;
  padding: 20px 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stat-item .label {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.stat-item .value {
  font-size: 18px;
  font-weight: bold;
  color: var(--text-color);
}

.edit-profile-btn {
  width: 100%;
}

.tab-header {
  margin-bottom: 20px;
  display: flex;
  justify-content: flex-end;
}

.loading-container {
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.mb-20 {
  margin-bottom: 20px;
}
</style> 