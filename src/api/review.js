import request from './request'

// 创建评价
export function createReview(data) {
  return request({
    url: '/reviews',
    method: 'post',
    data
  })
}

// 获取评价详情
export function getReviewDetail(id) {
  return request({
    url: `/reviews/${id}`,
    method: 'get'
  })
}

// 删除评价
export function deleteReview(id) {
  return request({
    url: `/reviews/${id}`,
    method: 'delete'
  })
} 