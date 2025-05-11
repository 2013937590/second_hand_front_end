import request from './request'

// 发布商品
export function createProduct(data) {
  return request({
    url: '/products',
    method: 'post',
    data
  })
}

// 获取商品详情
export function getProductDetail(id) {
  return request({
    url: `/products/${id}`,
    method: 'get'
  })
}

// 搜索商品
export function searchProducts(params) {
  return request({
    url: '/products/search',
    method: 'get',
    params
  })
}

// 更新商品信息
export function updateProduct(id, data) {
  return request({
    url: `/products/${id}`,
    method: 'put',
    data
  })
}

// 删除商品
export function deleteProduct(id) {
  return request({
    url: `/products/${id}`,
    method: 'delete'
  })
}

// 获取用户发布的商品
export function getUserProducts(params) {
  return request({
    url: '/products/user',
    method: 'get',
    params
  })
} 