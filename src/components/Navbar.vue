<template>
  <el-menu
    :default-active="activeIndex"
    class="navbar"
    mode="horizontal"
    router
  >
    <div class="container flex-between">
      <div class="flex">
        <el-menu-item index="/">首页</el-menu-item>
        <el-menu-item index="/publish" v-if="isLoggedIn">发布商品</el-menu-item>
      </div>
      
      <div class="flex">
        <template v-if="isLoggedIn">
          <el-menu-item index="/messages">
            <el-badge :value="unreadCount" :hidden="!unreadCount">
              消息
            </el-badge>
          </el-menu-item>
          <el-menu-item index="/orders">订单</el-menu-item>
          <el-sub-menu index="user">
            <template #title>
              <el-avatar :size="32" :src="userInfo?.avatar">
                {{ userInfo?.username?.charAt(0)?.toUpperCase() }}
              </el-avatar>
            </template>
            <el-menu-item index="/profile">个人中心</el-menu-item>
            <el-menu-item @click="handleLogout">退出登录</el-menu-item>
          </el-sub-menu>
        </template>
        <template v-else>
          <el-menu-item index="/login">登录</el-menu-item>
          <el-menu-item index="/register">注册</el-menu-item>
        </template>
      </div>
    </div>
  </el-menu>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { ElMessageBox } from 'element-plus'

const router = useRouter()
const route = useRoute()
const userStore = useUserStore()

const activeIndex = computed(() => route.path)
const isLoggedIn = computed(() => userStore.isLoggedIn)
const userInfo = computed(() => userStore.getUserInfo)
const unreadCount = ref(0) // TODO: 实现未读消息计数

const handleLogout = async () => {
  try {
    await ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await userStore.logout()
    router.push('/login')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('退出登录失败：', error)
    }
  }
}
</script>

<style scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  height: 60px;
}

.el-menu {
  border-bottom: none;
}

.el-menu-item {
  height: 60px;
  line-height: 60px;
}

.el-sub-menu {
  height: 60px;
  line-height: 60px;
}

.el-avatar {
  margin-top: 14px;
}
</style> 