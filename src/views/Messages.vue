<template>
  <div class="messages-container">
    <div class="container">
      <h2 class="page-title">消息中心</h2>
      
      <div class="messages-content">
        <!-- 左侧会话列表 -->
        <div class="conversation-list">
          <div class="search-box">
            <el-input
              v-model="searchKeyword"
              placeholder="搜索用户"
              prefix-icon="Search"
              clearable
              @input="handleSearch"
            />
          </div>
          
          <div v-loading="loading" class="list-content">
            <el-empty
              v-if="!conversations.length"
              description="暂无消息"
            />
            
            <div
              v-else
              class="conversation-items"
            >
              <div
                v-for="conversation in conversations"
                :key="conversation.id"
                class="conversation-item"
                :class="{ active: currentConversation?.id === conversation.id }"
                @click="selectConversation(conversation)"
              >
                <el-avatar
                  :size="40"
                  :src="conversation.otherUser.avatar"
                />
                <div class="conversation-info">
                  <div class="user-info">
                    <span class="username">{{ conversation.otherUser.username }}</span>
                    <span class="time">{{ formatDate(conversation.lastMessage?.createTime) }}</span>
                  </div>
                  <p class="last-message">{{ conversation.lastMessage?.content || '暂无消息' }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 右侧聊天区域 -->
        <div class="chat-area">
          <template v-if="currentConversation">
            <!-- 聊天头部 -->
            <div class="chat-header">
              <div class="user-info">
                <el-avatar
                  :size="40"
                  :src="currentConversation.otherUser.avatar"
                />
                <span class="username">{{ currentConversation.otherUser.username }}</span>
              </div>
            </div>
            
            <!-- 消息列表 -->
            <div
              ref="messageListRef"
              class="message-list"
              v-loading="loadingMessages"
            >
              <div
                v-for="message in messages"
                :key="message.id"
                class="message-item"
                :class="{ 'message-mine': message.senderId === userStore.user?.id }"
              >
                <el-avatar
                  :size="36"
                  :src="message.sender.avatar"
                />
                <div class="message-content">
                  <p class="message-text">{{ message.content }}</p>
                  <span class="message-time">{{ formatDate(message.createTime) }}</span>
                </div>
              </div>
            </div>
            
            <!-- 输入框 -->
            <div class="message-input">
              <el-input
                v-model="messageContent"
                type="textarea"
                :rows="3"
                placeholder="请输入消息"
                resize="none"
                @keyup.enter.ctrl="sendMessage"
              />
              <div class="input-actions">
                <span class="tip">按 Ctrl + Enter 发送</span>
                <el-button
                  type="primary"
                  :disabled="!messageContent.trim()"
                  @click="sendMessage"
                >
                  发送
                </el-button>
              </div>
            </div>
          </template>
          
          <el-empty
            v-else
            description="选择一个会话开始聊天"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { useUserStore } from '@/stores/user'
import { useMessageStore } from '@/stores/message'
import { ElMessage } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import dayjs from 'dayjs'

const userStore = useUserStore()
const messageStore = useMessageStore()

// 加载状态
const loading = ref(false)
const loadingMessages = ref(false)

// 搜索关键词
const searchKeyword = ref('')

// 会话列表
const conversations = ref([])

// 当前选中的会话
const currentConversation = ref(null)

// 消息列表
const messages = ref([])

// 消息内容
const messageContent = ref('')

// 消息列表引用
const messageListRef = ref(null)

// 格式化日期
const formatDate = (date) => {
  if (!date) return ''
  return dayjs(date).format('YYYY-MM-DD HH:mm')
}

// 获取会话列表
const fetchConversations = async () => {
  try {
    loading.value = true
    const res = await messageStore.getConversations()
    conversations.value = res.data
  } catch (error) {
    console.error('获取会话列表失败：', error)
    ElMessage.error('获取会话列表失败')
  } finally {
    loading.value = false
  }
}

// 获取消息列表
const fetchMessages = async () => {
  if (!currentConversation.value) return
  
  try {
    loadingMessages.value = true
    const res = await messageStore.getMessages(currentConversation.value.otherUser.id)
    messages.value = res.data
    
    // 滚动到底部
    await nextTick()
    scrollToBottom()
  } catch (error) {
    console.error('获取消息列表失败：', error)
    ElMessage.error('获取消息列表失败')
  } finally {
    loadingMessages.value = false
  }
}

// 选择会话
const selectConversation = (conversation) => {
  currentConversation.value = conversation
  fetchMessages()
}

// 发送消息
const sendMessage = async () => {
  if (!messageContent.value.trim() || !currentConversation.value) return
  
  try {
    const params = {
      receiverId: currentConversation.value.otherUser.id,
      content: messageContent.value.trim()
    }
    
    await messageStore.sendMessage(params)
    messageContent.value = ''
    
    // 重新获取消息列表
    await fetchMessages()
    // 更新会话列表
    await fetchConversations()
  } catch (error) {
    console.error('发送消息失败：', error)
    ElMessage.error('发送消息失败')
  }
}

// 搜索
const handleSearch = () => {
  // TODO: 实现搜索功能
}

// 滚动到底部
const scrollToBottom = () => {
  if (messageListRef.value) {
    messageListRef.value.scrollTop = messageListRef.value.scrollHeight
  }
}

// 监听消息列表变化，自动滚动到底部
watch(messages, () => {
  nextTick(() => {
    scrollToBottom()
  })
})

// 初始化
onMounted(() => {
  fetchConversations()
})
</script>

<style scoped>
.messages-container {
  padding: 20px 0;
}

.page-title {
  margin: 0 0 20px;
  font-size: 24px;
  color: var(--text-color);
}

.messages-content {
  display: flex;
  gap: 20px;
  height: calc(100vh - 200px);
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.conversation-list {
  width: 300px;
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
}

.search-box {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.list-content {
  flex: 1;
  overflow-y: auto;
}

.conversation-items {
  display: flex;
  flex-direction: column;
}

.conversation-item {
  display: flex;
  gap: 12px;
  padding: 12px 20px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.conversation-item:hover {
  background-color: var(--background-color);
}

.conversation-item.active {
  background-color: var(--background-color);
}

.conversation-info {
  flex: 1;
  min-width: 0;
}

.user-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.username {
  font-weight: 500;
  color: var(--text-color);
}

.time {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.last-message {
  margin: 0;
  font-size: 13px;
  color: var(--text-color-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.chat-header {
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
}

.chat-header .user-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.message-list {
  flex: 1;
  padding: 20px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.message-item {
  display: flex;
  gap: 12px;
  max-width: 70%;
}

.message-mine {
  flex-direction: row-reverse;
  align-self: flex-end;
}

.message-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-text {
  margin: 0;
  padding: 12px;
  background-color: var(--background-color);
  border-radius: 8px;
  font-size: 14px;
  line-height: 1.5;
  word-break: break-all;
}

.message-mine .message-text {
  background-color: var(--primary-color);
  color: #fff;
}

.message-time {
  font-size: 12px;
  color: var(--text-color-secondary);
}

.message-mine .message-time {
  text-align: right;
}

.message-input {
  padding: 20px;
  border-top: 1px solid var(--border-color);
}

.input-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
}

.tip {
  font-size: 12px;
  color: var(--text-color-secondary);
}
</style> 