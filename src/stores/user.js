import { defineStore } from 'pinia'
import { login, register, getUserProfile, logout } from '@/api/user'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null
  }),
  
  getters: {
    isLoggedIn: (state) => !!state.token,
    getUserInfo: (state) => state.userInfo
  },
  
  actions: {
    async login(loginData) {
      try {
        const res = await login(loginData)
        this.token = res.data.token
        localStorage.setItem('token', res.data.token)
        await this.fetchUserInfo()
        return res
      } catch (error) {
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
    }
  }
}) 