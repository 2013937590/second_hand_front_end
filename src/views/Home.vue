<template>
  <div class="home-container">
    <div class="container">
      <!-- 搜索区域 -->
      <div class="search-section card">
        <el-form :model="searchForm" inline>
          <el-form-item label="关键词">
            <el-input
              v-model="searchForm.keyword"
              placeholder="请输入商品名称"
              clearable
              @keyup.enter="handleSearch"
            />
          </el-form-item>
          
          <el-form-item label="价格区间">
            <el-input-number
              v-model="searchForm.minPrice"
              :min="0"
              placeholder="最低价"
              style="width: 120px"
            />
            <span class="mx-2">-</span>
            <el-input-number
              v-model="searchForm.maxPrice"
              :min="0"
              placeholder="最高价"
              style="width: 120px"
            />
          </el-form-item>
          
          <el-form-item>
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="resetSearch">重置</el-button>
          </el-form-item>
        </el-form>
      </div>
      
      <!-- 商品列表 -->
      <div class="product-list">
        <el-row :gutter="20">
          <el-col
            v-for="product in productList"
            :key="product.id"
            :xs="24"
            :sm="12"
            :md="8"
            :lg="6"
            class="mb-20"
          >
            <ProductCard
              :product="product"
              @click="goToDetail"
            />
          </el-col>
        </el-row>
        
        <!-- 空状态 -->
        <el-empty
          v-if="!loading && !productList.length"
          description="暂无商品"
        />
        
        <!-- 加载状态 -->
        <div v-if="loading" class="loading-container">
          <el-skeleton :rows="3" animated />
        </div>
        
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
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useProductStore } from '@/stores/product'
import ProductCard from '@/components/ProductCard.vue'

const router = useRouter()
const productStore = useProductStore()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  minPrice: null,
  maxPrice: null
})

// 分页相关
const currentPage = ref(1)
const pageSize = ref(12)
const total = ref(0)

// 商品列表
const productList = ref([])
const loading = ref(false)

// 搜索商品
const handleSearch = async () => {
  currentPage.value = 1
  await fetchProducts()
}

// 重置搜索
const resetSearch = () => {
  searchForm.keyword = ''
  searchForm.minPrice = null
  searchForm.maxPrice = null
  handleSearch()
}

// 获取商品列表
const fetchProducts = async () => {
  try {
    loading.value = true
    const params = {
      page: currentPage.value - 1,
      size: pageSize.value,
      ...searchForm
    }
    
    const res = await productStore.searchProducts(params)
    productList.value = res.data.content
    total.value = res.data.total
  } catch (error) {
    console.error('获取商品列表失败：', error)
  } finally {
    loading.value = false
  }
}

// 分页处理
const handleSizeChange = (val) => {
  pageSize.value = val
  fetchProducts()
}

const handleCurrentChange = (val) => {
  currentPage.value = val
  fetchProducts()
}

// 跳转到商品详情
const goToDetail = (id) => {
  router.push(`/product/${id}`)
}

// 初始化
onMounted(() => {
  fetchProducts()
})
</script>

<style scoped>
.home-container {
  padding: 20px 0;
}

.search-section {
  margin-bottom: 20px;
}

.loading-container {
  padding: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
}

.mx-2 {
  margin: 0 8px;
}
</style> 