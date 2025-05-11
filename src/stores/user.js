import { defineStore } from 'pinia'
import { login, register, getUserProfile, logout, updateUserProfile } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    getUserInfo: (state) => state.userInfo,
    user: (state) => state.userInfo
  },
  
  actions: {
    async login(loginData) {
      try {
        const res = await login(loginData)
        console.log('登录响应数据：', res)
        
        // 检查不同的可能的数据结构
        let token = null
        if (typeof res.data === 'string') {
          // 如果data直接就是token字符串
          token = res.data
        } else if (res.data && res.data.token) {
          // 如果data是对象且包含token字段
          token = res.data.token
        } else if (res.token) {
          // 如果token在根级别
          token = res.token
        }
        
        if (!token) {
          throw new Error('登录失败：未获取到token')
        }
        
        console.log('获取到的token：', token)
        
        // 确保token以Bearer开头
        const formattedToken = token.startsWith('Bearer ') ? token : `Bearer ${token}`
        this.token = formattedToken
        localStorage.setItem('token', formattedToken)
        
        // 登录成功后立即获取用户信息
        await this.fetchUserInfo()
        return res
      } catch (error) {
        console.error('登录错误详情：', error)
        throw error
      }
    },
    
    async register(registerData) {
      try {
        const res = await register(registerData)
        return res
      } catch (error) {
        throw error
      }
    },
    
    async fetchUserInfo() {
      try {
        const res = await getUserProfile()
        this.userInfo = res.data
        return res
      } catch (error) {
        console.error('获取用户信息失败：', error)
        throw error
      }
    },
    
    async logout() {
      try {
        await logout()
        this.token = ''
        this.userInfo = null
        localStorage.removeItem('token')
      } catch (error) {
        throw error
      }
    },
    
    async getUserStats() {
      try {
        const res = await getUserProfile()
        // 从用户信息中提取统计数据
        const { publishedCount, soldCount, boughtCount } = res.data
        return {
          ...res,
          data: {
            publishedCount,
            soldCount,
            boughtCount
          }
        }
      } catch (error) {
        throw error
      }
    },

    async updateUserInfo(userData) {
      try {
        const res = await updateUserProfile(userData)
        // 更新成功后重新获取用户信息
        await this.fetchUserInfo()
        return res
      } catch (error) {
        throw error
      }
    }
  }
}) 