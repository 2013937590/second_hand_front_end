import { defineStore } from 'pinia'
import { 
  createOrder, 
  getOrderDetail, 
  getUserOrders, 
  updateOrderStatus, 
  cancelOrder 
} from '@/api/order'

export const useOrderStore = defineStore('order', {
  state: () => ({
    currentOrder: null,
    orderList: [],
    loading: false
  }),
  
  getters: {
    getCurrentOrder: (state) => state.currentOrder,
    getOrderList: (state) => state.orderList
  },
  
  actions: {
    async createOrder(orderData) {
      try {
        const res = await createOrder(orderData)
        return res
      } catch (error) {
        throw error
      }
    },
    
    async fetchOrderDetail(id) {
      try {
        const res = await getOrderDetail(id)
        this.currentOrder = res.data
        return res
      } catch (error) {
        throw error
      }
    },
    
    async fetchUserOrders() {
      try {
        this.loading = true
        const res = await getUserOrders()
        this.orderList = res.data
        return res
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateOrderStatus(id, status) {
      try {
        const res = await updateOrderStatus(id, status)
        return res
      } catch (error) {
        throw error
      }
    },
    
    async cancelOrder(id) {
      try {
        const res = await cancelOrder(id)
        return res
      } catch (error) {
        throw error
      }
    }
  }
}) 