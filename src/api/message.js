import request from './request'

// 发送消息
export function sendMessage(data) {
  return request({
    url: '/messages',
    method: 'post',
    data
  })
}

// 获取消息详情
export function getMessageDetail(id) {
  return request({
    url: `/messages/${id}`,
    method: 'get'
  })
}

// 获取会话消息列表
export function getConversationMessages(conversationId) {
  return request({
    url: `/messages/conversation/${conversationId}`,
    method: 'get'
  })
}

// 标记消息已读
export function markMessageAsRead(id) {
  return request({
    url: `/messages/${id}/read`,
    method: 'put'
  })
}

// 删除消息
export function deleteMessage(id) {
  return request({
    url: `/messages/${id}`,
    method: 'delete'
  })
} 