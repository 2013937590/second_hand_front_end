import request from './request'

// 用户注册
export function register(data) {
  return request({
    url: '/users/register',
    method: 'post',
    data
  })
}

// 用户登录
export function login(data) {
  return request({
    url: '/users/login',
    method: 'post',
    data
  })
}

// 用户登出
export function logout() {
  return request({
    url: '/users/logout',
    method: 'post'
  })
}

// 刷新Token
export function refreshToken() {
  return request({
    url: '/users/refresh-token',
    method: 'post'
  })
}

// 获取用户信息
export function getUserProfile() {
  return request({
    url: '/users/profile',
    method: 'get'
  })
}

// 更新用户信息
export function updateUserProfile(data) {
  return request({
    url: '/users/profile',
    method: 'put',
    data
  })
} 