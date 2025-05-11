import { defineStore } from 'pinia'
import { 
  sendMessage, 
  getMessageDetail, 
  getConversationMessages, 
  markMessageAsRead, 
  deleteMessage 
} from '@/api/message'

export const useMessageStore = defineStore('message', {
  state: () => ({
    currentMessage: null,
    conversationMessages: [],
    loading: false
  }),
  
  getters: {
    getCurrentMessage: (state) => state.currentMessage,
    getConversationMessages: (state) => state.conversationMessages
  },
  
  actions: {
    async sendMessage(messageData) {
      try {
        const res = await sendMessage(messageData)
        return res
      } catch (error) {
        throw error
      }
    },
    
    async fetchMessageDetail(id) {
      try {
        const res = await getMessageDetail(id)
        this.currentMessage = res.data
        return res
      } catch (error) {
        throw error
      }
    },
    
    async fetchConversationMessages(conversationId) {
      try {
        this.loading = true
        const res = await getConversationMessages(conversationId)
        this.conversationMessages = res.data
        return res
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    
    async markMessageAsRead(id) {
      try {
        const res = await markMessageAsRead(id)
        return res
      } catch (error) {
        throw error
      }
    },
    
    async deleteMessage(id) {
      try {
        const res = await deleteMessage(id)
        return res
      } catch (error) {
        throw error
      }
    }
  }
}) 