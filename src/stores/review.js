import { defineStore } from 'pinia'
import { createReview, getReviewDetail, deleteReview } from '@/api/review'

export const useReviewStore = defineStore('review', {
  state: () => ({
    currentReview: null,
    loading: false
  }),
  
  getters: {
    getCurrentReview: (state) => state.currentReview
  },
  
  actions: {
    async createReview(reviewData) {
      try {
        const res = await createReview(reviewData)
        return res
      } catch (error) {
        throw error
      }
    },
    
    async fetchReviewDetail(id) {
      try {
        const res = await getReviewDetail(id)
        this.currentReview = res.data
        return res
      } catch (error) {
        throw error
      }
    },
    
    async deleteReview(id) {
      try {
        const res = await deleteReview(id)
        return res
      } catch (error) {
        throw error
      }
    }
  }
}) 