import { createApp } from 'vue'
import './style.css'
import './assets/fonts-clarity.css'

import App from './App.vue'
import router from './router'
import { createPinia } from 'pinia'

// 引入阿里图标样式
import './assets/icons/font/iconfont.css'

const app = createApp(App)
const pinia = createPinia()

app.use(router)
app.use(pinia)

app.mount('#app')

// CI verification trigger - 触发CI验证P0+P1任务完成度
