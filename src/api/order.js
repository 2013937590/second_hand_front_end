import request from './request'

// 创建订单
export function createOrder(data) {
  return request({
    url: '/orders',
    method: 'post',
    data
  })
}

// 获取订单详情
export function getOrderDetail(id) {
  return request({
    url: `/orders/${id}`,
    method: 'get'
  })
}

// 获取用户订单列表
export function getUserOrders() {
  return request({
    url: '/orders',
    method: 'get'
  })
}

// 更新订单状态
export function updateOrderStatus(id, status) {
  return request({
    url: `/orders/${id}/status`,
    method: 'put',
    data: { status }
  })
}

// 取消订单
export function cancelOrder(id) {
  return request({
    url: `/orders/${id}`,
    method: 'delete'
  })
} 