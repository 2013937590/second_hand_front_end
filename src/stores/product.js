import { defineStore } from 'pinia'
import { 
  createProduct, 
  getProductDetail, 
  searchProducts, 
  updateProduct, 
  deleteProduct,
  getUserProducts 
} from '@/api/product'

export const useProductStore = defineStore('product', {
  state: () => ({
    currentProduct: null,
    productList: [],
    userProducts: [],
    total: 0,
    loading: false
  }),
  
  getters: {
    getCurrentProduct: (state) => state.currentProduct,
    getProductList: (state) => state.productList,
    getUserProducts: (state) => state.userProducts
  },
  
  actions: {
    async createProduct(productData) {
      try {
        const res = await createProduct(productData)
        return res
      } catch (error) {
        throw error
      }
    },
    
    async fetchProductDetail(id) {
      try {
        const res = await getProductDetail(id)
        this.currentProduct = res.data
        return res
      } catch (error) {
        throw error
      }
    },
    
    async searchProducts(params) {
      try {
        this.loading = true
        const res = await searchProducts(params)
        this.productList = res.data.content
        this.total = res.data.total
        return res
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async updateProduct(id, productData) {
      try {
        const res = await updateProduct(id, productData)
        return res
      } catch (error) {
        throw error
      }
    },
    
    async deleteProduct(id) {
      try {
        const res = await deleteProduct(id)
        return res
      } catch (error) {
        throw error
      }
    },
    
    async fetchUserProducts(params) {
      try {
        const res = await getUserProducts(params)
        this.userProducts = res.data.content
        return res
      } catch (error) {
        throw error
      }
    }
  }
}) 