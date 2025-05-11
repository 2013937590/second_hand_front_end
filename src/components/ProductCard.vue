<template>
  <el-card
    class="product-card"
    :body-style="{ padding: '0px' }"
    @click="handleClick"
  >
    <div class="product-image">
      <el-image
        :src="product.images?.[0] || '/placeholder.png'"
        fit="cover"
      >
        <template #error>
          <div class="image-placeholder">
            <el-icon><Picture /></el-icon>
          </div>
        </template>
      </el-image>
    </div>
    
    <div class="product-info p-20">
      <h3 class="product-title">{{ product.title }}</h3>
      <div class="product-price">¥{{ product.price }}</div>
      <div class="product-meta">
        <span>{{ product.categoryId }}</span>
        <span>{{ formatDate(product.createdAt) }}</span>
      </div>
      
      <div v-if="showActions" class="product-actions">
        <el-button
          type="primary"
          size="small"
          @click.stop="handleEdit"
        >
          编辑
        </el-button>
        <el-button
          type="danger"
          size="small"
          @click.stop="handleDelete"
        >
          删除
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup>
import { Picture } from '@element-plus/icons-vue'
import dayjs from 'dayjs'
import { ElMessageBox } from 'element-plus'

const props = defineProps({
  product: {
    type: Object,
    required: true
  },
  showActions: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'edit', 'delete'])

// 格式化日期
const formatDate = (date) => {
  return dayjs(date).format('YYYY-MM-DD')
}

// 点击卡片
const handleClick = () => {
  emit('click', props.product.id)
}

// 编辑商品
const handleEdit = () => {
  emit('edit', props.product.id)
}

// 删除商品
const handleDelete = async () => {
  try {
    await ElMessageBox.confirm('确定要删除该商品吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    emit('delete', props.product.id)
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除商品失败：', error)
    }
  }
}
</script>

<style scoped>
.product-card {
  cursor: pointer;
  transition: all 0.3s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.product-image {
  height: 200px;
  overflow: hidden;
}

.product-image :deep(.el-image) {
  width: 100%;
  height: 100%;
}

.image-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.product-info {
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.product-title {
  margin: 0;
  font-size: 16px;
  color: var(--text-color);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.product-price {
  font-size: 18px;
  color: var(--danger-color);
  font-weight: bold;
}

.product-meta {
  display: flex;
  justify-content: space-between;
  color: var(--text-color-secondary);
  font-size: 12px;
}

.product-actions {
  margin-top: 10px;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style> 