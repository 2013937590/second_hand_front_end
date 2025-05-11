<template>
  <div class="home-container">
    <div class="container">
      <!-- 搜索区域 -->
      <div class="search-section">
        <el-form :model="searchForm" inline>
          <el-form-item>
            <el-input
              v-model="searchForm.keyword"
              placeholder="搜索商品"
              clearable
              @keyup.enter="handleSearch"
            >
              <template #prefix>
                <el-icon><Search /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          
          <el-form-item>
            <el-select
              v-model="searchForm.categoryId"
              placeholder="商品分类"
              clearable
              @change="handleSearch"
            >
              <el-option
                v-for="item in categories"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
          
          <el-form-item>
            <el-input-number
              v-model="searchForm.minPrice"
              placeholder="最低价"
              :min="0"
              :precision="2"
              :step="10"
              clearable
              @change="handleSearch"
            />
            <span class="price-separator">-</span>
            <el-input-number
              v-model="searchForm.maxPrice"
              placeholder="最高价"
              :min="0"
              :precision="2"
              :step="10"
              clearable
              @change="handleSearch"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 商品列表 -->
      <div v-if="loading" class="loading-container">
        <el-skeleton :rows="10" animated />
      </div>
      
      <template v-else>
        <div v-if="productList.length" class="product-list">
          <el-row :gutter="20">
            <el-col
              v-for="product in productList"
              :key="product.id"
              :xs="24"
              :sm="12"
              :md="8"
              :lg="6"
            >
              <el-card
                class="product-card"
                :body-style="{ padding: '0px' }"
                @click="handleProductClick(product.id)"
              >
                <div class="product-image">
                  <el-image
                    v-if="product.images?.length"
                    :src="product.images[0]"
                    fit="cover"
                  />
                  <el-empty v-else description="暂无图片" />
                </div>
                
                <div class="product-info">
                  <h3 class="product-title">{{ product.title }}</h3>
                  <div class="product-meta">
                    <span class="category">{{ getCategoryName(product.categoryId) }}</span>
                    <span class="condition">{{ getConditionScoreText(product.conditionScore) }}</span>
                  </div>
                  <div class="product-price">¥{{ product.price }}</div>
                </div>
              </el-card>
            </el-col>
          </el-row>
          
          <!-- 分页 -->
          <div class="pagination-container">
            <el-pagination
              v-model:current-page="currentPage"
              v-model:page-size="pageSize"
              :total="total"
              :page-sizes="[10, 20, 30, 50]"
              layout="total, sizes, prev, pager, next, jumper"
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
        
        <el-empty v-else description="暂无商品" />
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import { Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const productStore = useProductStore()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  categoryId: '',
  minPrice: null,
  maxPrice: null
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 商品列表
const productList = ref([])
const loading = ref(false)

// 商品分类选项
const categories = [
  { label: '数码电子', value: 1 },
  { label: '服装鞋包', value: 2 },
  { label: '图书教材', value: 3 },
  { label: '生活用品', value: 4 },
  { label: '其他', value: 5 }
]

// 获取分类名称
const getCategoryName = (categoryId) => {
  const category = categories.find(item => item.value === categoryId)
  return category ? category.label : '未知分类'
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

// 搜索商品
const handleSearch = async () => {
  try {
    loading.value = true
    currentPage.value = 1 // 重置页码
    
    // 过滤掉空参数
    const params = {
      page: currentPage.value, // 页码从1开始
      size: pageSize.value
    }
    
    // 只添加非空参数
    if (searchForm.keyword) {
      params.keyword = searchForm.keyword
    }
    if (searchForm.categoryId) {
      params.categoryId = searchForm.categoryId
    }
    if (searchForm.minPrice !== null && searchForm.minPrice !== '') {
      params.minPrice = searchForm.minPrice
    }
    if (searchForm.maxPrice !== null && searchForm.maxPrice !== '') {
      params.maxPrice = searchForm.maxPrice
    }
    
    const res = await productStore.searchProducts(params)
    productList.value = res.data.content
    total.value = res.data.totalElements
  } catch (error) {
    console.error('搜索商品失败：', error)
    ElMessage.error('搜索商品失败')
  } finally {
    loading.value = false
  }
}

// 重置搜索
const handleReset = () => {
  Object.assign(searchForm, {
    keyword: '',
    categoryId: '',
    minPrice: null,
    maxPrice: null
  })
  handleSearch()
}

// 处理分页大小变化
const handleSizeChange = (val) => {
  pageSize.value = val
  handleSearch()
}

// 处理页码变化
const handleCurrentChange = (val) => {
  currentPage.value = val
  handleSearch()
}

// 点击商品卡片
const handleProductClick = (productId) => {
  router.push(`/product/${productId}`)
}

// 初始化
onMounted(() => {
  handleSearch()
})
</script>

<style scoped>
.home-container {
  padding: 20px 0;
}

.search-section {
  margin-bottom: 20px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.price-separator {
  margin: 0 10px;
  color: var(--text-color-secondary);
}

.product-list {
  margin-top: 20px;
}

.product-card {
  margin-bottom: 20px;
  cursor: pointer;
  transition: transform 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.product-image :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.product-info {
  padding: 15px;
}

.product-title {
  margin: 0 0 10px;
  font-size: 16px;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-size: 14px;
  color: var(--text-color-secondary);
}

.product-price {
  font-size: 20px;
  font-weight: bold;
  color: var(--primary-color);
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.loading-container {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style> 