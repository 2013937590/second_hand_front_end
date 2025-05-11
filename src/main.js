import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'
import './assets/main.css'

// 配置 Vue 特性标志
const app = createApp(App)

// 配置全局特性标志
app.config.compilerOptions.isCustomElement = tag => false
app.config.compilerOptions.whitespace = 'condense'
app.config.compilerOptions.comments = false
app.config.compilerOptions.delimiters = ['{{', '}}']

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
