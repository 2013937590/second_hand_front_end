import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'

const service = axios.create({
  baseURL: 'http://localhost:8080',
  timeout: 5000,
  withCredentials: true, // 允许跨域携带cookie
  headers: {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*'
  }
})

// 请求拦截器
service.interceptors.request.use(
  config => {
    // 确保所有请求都带有 /api/v1 前缀
    if (!config.url.startsWith('/api/v1')) {
      config.url = `/api/v1${config.url}`
    }
    
    const token = localStorage.getItem('token')
    if (token) {
      // 如果token已经包含Bearer前缀，直接使用；否则添加前缀
      config.headers['Authorization'] = token.startsWith('Bearer ') ? token : `Bearer ${token}`
    }
    return config
  },
  error => {
    console.error('请求错误：', error)
    return Promise.reject(error)
  }
)

// 响应拦截器
service.interceptors.response.use(
  response => {
    const res = response.data
    console.log('API响应原始数据：', response)
    console.log('API响应data：', res)
    
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败')
      if (res.code === 401) {
        router.push('/login')
      }
      return Promise.reject(new Error(res.message || '请求失败'))
    }
    return res
  },
  error => {
    console.error('响应错误：', error)
    if (error.message === 'Network Error') {
      ElMessage.error('网络错误，请检查后端服务是否正常运行')
    } else {
      ElMessage.error(error.message || '请求失败')
    }
    return Promise.reject(error)
  }
)

export default service 