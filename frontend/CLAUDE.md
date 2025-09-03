# CLAUDE.md - 前端开发指南

本文件为Claude Code在UAI教育平台的 `/frontend` 目录中工作时提供前端特定指导。

## 项目概述

UAI教育平台前端 - Vue 3 + TypeScript + Vite构建的在线教育服务应用。仅前端开发上下文，专注于响应式设计、组件架构和现代JavaScript实践。

## 前端技术栈

**核心框架：**
- Vue 3 配合 Composition API + TypeScript
- Vite 构建工具和开发服务器
- Bootstrap 5.3.6 UI框架 (禁止使用其他UI框架)
- Pinia 状态管理
- Vue Router 客户端路由
- Axios API请求

**开发工具：**
- TypeScript 类型安全
- ESLint + Prettier 代码质量
- Vite 快速开发和优化构建

## 开发命令

所有命令都应该在 `/frontend` 目录下执行：

```bash
# 开发工作流
npm install                    # 安装所有依赖
npm run dev                   # 启动开发服务器 (localhost:5173)
npm run build                 # 生产构建
npm run build:check           # 带TypeScript检查的构建
npm run type-check            # 仅TypeScript类型检查
npm run preview               # 预览生产构建

# 特定功能包
npm install opencc-js         # 中文简繁转换
npm install vue-gtag          # 分析集成 (条件加载)
npm install @types/gtag       # 分析的TypeScript定义
```

## 前端架构

### 目录结构 (`/frontend/src/`)
```
src/
├── views/                         # Page-level components (PascalCase)
│   ├── HomeView.vue              # Landing page
│   ├── CourseDetails.vue         # Course details page
│   ├── ShoppingCart.vue          # Shopping cart page
│   ├── Order.vue                 # Order processing page
│   └── PersonalCenter.vue        # User dashboard
├── components/                    # Reusable components (PascalCase)
│   ├── auth/                     # Authentication components
│   │   ├── LoginModal.vue       # Login modal (手机验证码/密码/微信)
│   │   ├── RegisterForm.vue     # Registration form
│   │   └── WeChatLogin.vue      # WeChat OAuth component
│   ├── course/                   # Course-related components  
│   │   ├── CourseCard.vue       # Course display card
│   │   ├── CourseStage.vue      # 分层课程展示组件
│   │   ├── LearningProgress.vue # Learning progress tracker
│   │   └── CourseTrial.vue      # 试学功能组件
│   ├── memberZone/               # 会员专区组件 (Premium Member功能)
│   │   ├── MemberCourseList.vue # 会员专属课程列表
│   │   └── MemberBenefits.vue   # 会员权益展示
│   ├── projectZone/              # 项目实战组件 (项目落地专区)
│   │   ├── ProjectCard.vue      # 实战项目卡片
│   │   └── ProjectChallenge.vue # 项目挑战模块
│   ├── coupon/                   # 优惠券相关组件
│   │   ├── CouponModal.vue      # 优惠券领取弹窗
│   │   └── CouponCountdown.vue  # 倒计时组件
│   ├── payment/                  # Payment and membership
│   │   ├── PaymentModal.vue     # Payment processing
│   │   ├── MembershipCard.vue   # Membership display
│   │   └── PriceComparison.vue  # Price comparison component
│   ├── rbac/                     # RBAC权限控制组件
│   │   ├── PermissionGate.vue   # 权限门控组件
│   │   └── RoleGuard.vue        # 角色守卫组件
│   ├── enterprise/              # 企业功能组件 (Feature Flag控制)
│   │   ├── EnterpriseAdminPanel.vue # 企业管理面板
│   │   ├── SeatManagement.vue   # 席位管理组件
│   │   ├── TeamProgress.vue     # 团队学习进度
│   │   ├── BulkPurchase.vue     # 批量购买界面
│   │   └── EnterpriseReports.vue # 企业统计报表
│   ├── cart/                     # Shopping cart components
│   ├── order/                    # Order processing components
│   ├── personCenter/             # Personal dashboard components
│   ├── seo/                      # SEO相关组件
│   │   ├── SEOHead.vue          # 动态meta标签组件
│   │   ├── FAQSection.vue       # FAQ组件
│   │   ├── BreadcrumbSchema.vue # 面包屑结构化数据
│   │   └── CourseSchema.vue     # 课程结构化数据
│   ├── i18n/                     # 国际化组件预留 (V1暂不启用)
│   │   └── LanguageSwitcher.vue # 语言切换器 (海外版预留)
│   ├── Navbar.vue               # Main navigation
│   └── ...                     # Other reusable components
├── store/                        # Pinia state management
│   ├── index.ts                 # Store configuration
│   ├── authStore.ts             # Authentication state (多登录方式)
│   ├── courseStore.ts           # Course data state (分层课程体系)
│   ├── membershipStore.ts       # Membership and subscription state
│   ├── learningStore.ts         # Learning progress state
│   ├── rbacStore.ts             # RBAC权限状态管理
│   ├── couponStore.ts           # 优惠券状态管理
│   ├── projectStore.ts          # 项目实战状态管理
│   ├── enterpriseStore.ts       # 企业功能状态管理 (Feature Flag控制)
│   ├── uiStore.ts               # UI/UX state
│   └── seoStore.ts              # SEO状态管理
├── api/                          # Axios API wrappers
│   ├── auth.ts                  # Authentication API (手机验证码/密码/微信)
│   ├── courses.ts               # Course management API (7层课程体系)
│   ├── payment.ts               # Payment and membership API
│   ├── sms.ts                   # SMS verification API (阿里云)
│   ├── learning.ts              # Learning progress tracking API
│   ├── rbac.ts                  # RBAC权限管理API
│   ├── coupon.ts                # 优惠券管理API
│   ├── project.ts               # 项目实战API
│   ├── enterprise.ts            # 企业管理API (Feature Flag控制)
│   └── orders.ts                # Order processing API
├── router/                       # Vue Router configuration
│   └── index.ts                 # Route definitions
├── types/                        # TypeScript definitions
│   ├── index.ts                 # Common types
│   ├── auth.ts                  # Authentication types (多登录方式)
│   ├── course.ts                # Course types (7层课程体系)
│   ├── membership.ts            # Membership and subscription types
│   ├── learning.ts              # Learning progress types
│   ├── payment.ts               # Payment processing types
│   ├── rbac.ts                  # RBAC权限系统类型定义
│   ├── coupon.ts                # 优惠券系统类型定义
│   ├── project.ts               # 项目实战类型定义
│   ├── enterprise.ts            # 企业功能类型定义 (Feature Flag控制)
│   ├── cart.ts                  # Shopping cart types
│   ├── order.ts                 # Order types
│   └── seo.ts                   # SEO类型定义
├── utils/                        # Utility functions
│   ├── toast.ts                 # Toast notifications
│   ├── seo.ts                   # SEO工具函数
│   └── tracking.ts              # Analytics utilities
├── composables/                  # Vue 3 composables
│   ├── useAnalytics.ts          # 分析统计composable
│   ├── useRBAC.ts               # RBAC权限检查composable
│   ├── useEnterprise.ts         # 企业功能composable (Feature Flag控制)
│   └── useI18n.ts               # 国际化composable (海外版预留)
├── assets/                       # Static resources
│   ├── icons/                   # Logo and icon resources
│   ├── images/                  # Business images (course covers, avatars)
│   ├── fonts-clarity.css        # Font clarity optimization
│   └── vue.svg                  # Framework assets
├── directives/                   # Vue指令
│   └── rbac.ts                  # 权限控制指令 (v-permission, v-role)
└── config/                       # Configuration files
    ├── featureFlags.ts          # Feature Flag统一配置
    ├── baidu.json               # 百度统计配置
    └── i18n/                    # 国际化配置预留 (V1不启用)
        └── zh-CN.json           # 简体中文文案 (结构化管理)
```

### 后端API集成
- **基础URL**: `http://localhost:8000/api/` (开发环境)
- **生产URL**: Railway后端URL (通过环境变量配置)
- **身份验证**: JWT令牌通过Axios拦截器自动附加
- **响应格式**: 所有API返回 `{ status, data, msg }` 结构

## 开发约定

### Vue 3 编码标准
- **仅Composition API**: 严格禁止使用Options API
- **TypeScript必需**: 所有 `.vue` 文件必须使用 `<script setup lang="ts">`
- **组件命名**: 所有组件使用PascalCase (如：`UserProfile.vue`)
- **Props/Emits**: 使用TypeScript接口定义props

**推荐的组件结构：**
```vue
<template>
  <!-- 优先使用Bootstrap工具类 -->
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
        <!-- 主要内容 -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/authStore'

// 接口定义
interface Props {
  title: string
  isVisible?: boolean
}

// Props和emits
const props = withDefaults(defineProps<Props>(), {
  isVisible: true
})

// 响应式数据
const loading = ref(false)
const authStore = useAuthStore()

// 计算属性
const displayTitle = computed(() => 
  props.title.toUpperCase()
)

// 生命周期
onMounted(() => {
  // 组件初始化
})
</script>

<style scoped>
/* 仅在Bootstrap不足时使用自定义样式 */
</style>
```

### 使用Pinia进行状态管理
```typescript
// store/authStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // 状态
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfo | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value)

  // Actions
  const login = async (credentials: LoginCredentials) => {
    // 实现逻辑
  }

  const logout = () => {
    token.value = null
    userInfo.value = null
    localStorage.removeItem('token')
  }

  return {
    token,
    userInfo,
    isLoggedIn,
    login,
    logout
  }
})
```

## UI/UX指南

### Bootstrap 5.3.6 使用
- **工具类优先**: 优先使用Bootstrap工具类而非自定义CSS
- **网格系统**: 使用 `row` 和 `col-*` 类进行响应式布局
- **组件**: 利用Bootstrap组件(按钮、卡片、模态框)
- **自定义样式**: 仅在Bootstrap无法实现设计时才添加自定义CSS

### 响应式设计标准
- **移动端优先**: 所有组件必须在≤768px屏幕上正常工作
- **断点**:
  - `xs`: <576px (手机)
  - `sm`: ≥576px (手机横屏)
  - `md`: ≥768px (平板)
  - `lg`: ≥992px (桌面)
  - `xl`: ≥1200px (大桌面)
  - `xxl`: ≥1400px (超大屏幕)

### Mac设备优化
```css
/* Mac特定响应式处理 */
@media (min-width: 1440px) and (-webkit-min-device-pixel-ratio: 2) {
  .course-cards-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
}
```

### 字体清晰度系统
**核心原则**: 层分离架构确保文本内容保持在清晰层，而毛玻璃效果仅应用于背景层。

```css
/* 全局字体优化 */
body {
  font-family: 'Segoe UI', 'Microsoft YaHei', 'PingFang SC', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* 层分离系统 */
.text-layer {
  z-index: 10; /* 绝对清晰 */
  backdrop-filter: none !important;
}

.glass-background {
  z-index: 1; /* 模糊效果 */
}
```

## 图片资源管理

### 资源目录结构
```
src/assets/
├── icons/                    # Logo和图标资源
│   ├── logo.png
│   └── logo.svg
└── images/                   # 业务图片
    ├── tiyan-*-cover.jpg     # 免费体验课程
    ├── rumen-*-cover.jpg     # 基础课程
    ├── jingjin-*-cover.jpg   # 进阶课程
    ├── shizhan-*-cover.jpg   # 项目课程
    └── xiangmuluodi-*-cover.png # 企业课程
    └── employment-logo-cover.png # 就业logo设计课程

```

### 图片导入标准
**始终使用import语句，永远不用字符串路径：**

```vue
<script setup lang="ts">
// ✅ 正确 - 将图片作为模块导入
import logoImg from '@/assets/icons/logo.png'
import courseCover from '@/assets/images/tiyan-python-cover.jpg'
</script>

<template>
  <!-- ✅ 使用导入的变量 -->
  <img :src="logoImg" alt="UAI Logo" />
  <img :src="courseCover" alt="Python Course" />
  
  <!-- ❌ 避免字符串路径 -->
  <!-- <img src="@/assets/icons/logo.png" alt="Logo" /> -->
</template>
```

### 课程图片命名约定
- **文件前缀必须与课程阶段匹配**:
  - `tiyan-` → `stage: 'free'` (免费体验)
  - `rumen-` → `stage: 'basic'` (基础级别)
  - `jingjin-` → `stage: 'advanced'` (进阶级别)
  - `shizhan-` → `stage: 'project'` (项目级别)
  - `xiangmuluodi-` → `stage: 'landing'` (企业级别)

## 国内版语言策略

### V1.0 简化策略
- **目标市场**: 专注中国大陆用户
- **语言支持**: 仅简体中文，无繁简转换
- **性能优势**: 移除转换开销，提升页面加载速度15-20%
- **未来规划**: 海外版将独立开发，支持完整国际化

```javascript
// 国内版无需区域检测，专注中国大陆用户体验
// 海外版将单独实现完整的区域检测和i18n功能
```

### 国际化预留架构
虽然V1.0专注国内版，但为未来海外版预留基础结构：
- `config/i18n/zh-CN.json`: 结构化文案管理，利于后期替换
- `composables/useI18n.ts`: 国际化composable预留接口
- `components/i18n/LanguageSwitcher.vue`: 语言切换组件预留
- 组件中统一通过 `$t('key')` 访问文案（当前直接返回中文）

```typescript
// 当前简化实现，海外版时扩展为完整i18n
const useI18n = () => ({
  t: (key: string) => zhCN[key] || key // V1.0直接返回中文
})
```

## 分析和跟踪

### 国内版统一策略
- **分析工具**: 仅使用百度统计 (避免国际工具的网络问题)
- **目标用户**: 中国大陆用户，无需复杂的地区判断
- **性能优化**: 单一分析服务，减少加载时间和复杂度
- **数据完整性**: 专注于国内用户行为分析和转化跟踪

```typescript
// useAnalytics.ts - 国内版简化实现
export const useAnalytics = () => {
  const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
    // 仅使用百度统计，简化实现
    window._hmt?.push(['_trackEvent', eventName, eventData])
    
    // 添加自定义事件到本地存储供后续分析
    const customEvent = {
      event: eventName,
      data: eventData,
      timestamp: Date.now()
    }
    
    // 可选：发送到后端进行业务分析
    // api.trackEvent(customEvent)
  }
  
  return { trackEvent }
}
```

### 事件跟踪标准
- **命名约定**: `module.action.state` (如: `video.play.start`)
- **数据属性**: 为可跟踪元素添加 `data-track` 属性

### 埋点分阶段实施计划
**阶段一：注册与登录转化路径**
- `user.register`, `user.login`, `user.logout`, `user.wechat_bind`
- 目标：优化注册转化率

**阶段二：试听与课程探索路径** 
- `course.trial.start`, `course.view`, `stage.tiyan.enter`, `faq.click`
- 目标：提升免费用户到付费的转化

**阶段三：购买与会员转化路径**
- `cart.add`, `payment.success`, `membership.subscribe`, `coupon.apply` 
- 目标：优化付费转化和会员订阅

**阶段四：学习行为深度分析**
- `video.play.start/pause/end`, `course.progress.update`, `learning.complete`
- 目标：提升课程完成率和用户留存

**阶段五：SEO/AEO效果跟踪**
- `search.from.baidu`, `course.view.from.seo`, `content.share`
- 目标：评估SEO流量质量和内容传播效果

## API集成

### Axios配置
```typescript
// api/index.ts
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000
})

// 请求拦截器 - 自动附加JWT
request.interceptors.request.use(config => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// 响应拦截器 - 处理统一响应格式 + JWT失效处理
request.interceptors.response.use(
  response => response.data, // 提取 { status, data, msg }
  error => {
    // 401错误全局处理：JWT失效自动登出
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()
      router.push('/login')
      // 可选：显示友好提示
    }
    console.error('API错误:', error)
    return Promise.reject(error)
  }
)
```

### API服务模式
```typescript
// api/courses.ts
import request from './index'
import type { Course, CourseListResponse } from '@/types'

export const courseAPI = {
  // 获取课程列表
  getCourses: (stage?: string): Promise<CourseListResponse> => {
    return request.get('/courses/', { params: { stage } })
  },

  // 获取课程详情
  getCourseDetail: (id: number): Promise<Course> => {
    return request.get(`/courses/${id}/`)
  },

  // 搜索课程
  searchCourses: (query: string): Promise<CourseListResponse> => {
    return request.get('/courses/search/', { params: { q: query } })
  }
}
```

## 常见开发任务

### 添加新功能
1. 在 `src/api/` 中**创建API服务**，遵循nREST约定
2. 在 `src/types/` 中**定义TypeScript类型**用于数据结构
3. 在 `src/store/` 中**实现Pinia存储**用于状态管理
4. 在 `src/components/` 中**构建可复用组件**，使用正确命名
5. 在 `src/views/` 中**创建页面组件**，使用现有模式
6. 在 `src/router/index.ts` 中**更新路由配置**以支持新路由

### 核心业务功能开发重点

#### 多登录方式实现
```vue
<!-- components/auth/LoginModal.vue -->
<template>
  <div class="login-options">
    <!-- 手机验证码登录 -->
    <button @click="loginWithSMS" class="btn btn-primary">
      手机验证码登录
    </button>
    
    <!-- 手机密码登录 -->
    <button @click="loginWithPassword" class="btn btn-outline-primary">
      密码登录
    </button>
    
    <!-- 微信登录 -->
    <WeChatLogin @success="handleWeChatLogin" />
  </div>
</template>
```

#### 分层课程体系展示
```vue
<!-- components/course/CourseStage.vue -->
<template>
  <div class="course-stages">
    <!-- 7层课程展示 -->
    <div v-for="stage in courseStages" :key="stage.id" 
         :class="['stage-card', { 'locked': !stage.unlocked }]">
      <h3>{{ stage.name }}</h3>
      <div class="courses">
        <CourseCard v-for="course in stage.courses" 
                    :key="course.id" :course="course" />
      </div>
    </div>
  </div>
</template>
```

#### 会员系统集成
```typescript
// store/membershipStore.ts
export const useMembershipStore = defineStore('membership', () => {
  const membershipStatus = ref<'none' | 'monthly' | 'yearly'>('none')
  const membershipExpiry = ref<Date | null>(null)
  
  const isMember = computed(() => membershipStatus.value !== 'none')
  const canAccessCourse = computed(() => (courseStage: string) => {
    if (courseStage === 'tiyan') return true // 体验区免费
    return isMember.value // 其他区域需要会员
  })
  
  return { membershipStatus, isMember, canAccessCourse }
})
```

#### RBAC权限系统集成
```typescript
// composables/useRBAC.ts - 简化权限检查
export const useRBAC = () => {
  const rbacStore = useRBACStore()
  
  const hasRole = (role: string) => rbacStore.userRoles.includes(role)
  const hasPermission = (permission: string) => rbacStore.permissions.includes(permission)
  const canAccessCourse = (courseStage: string) => {
    // 基于6角色体系的课程访问控制
    if (courseStage === 'tiyan') return true
    if (hasRole('Premium Member')) return courseStage !== 'employment'
    return hasRole('Staff Admin') || hasRole('Super Admin')
  }
  
  return { hasRole, hasPermission, canAccessCourse }
}
```

#### 企业功能Feature Flag集成
```typescript
// config/featureFlags.ts - 前端Feature Flag配置
export const ENTERPRISE_FLAGS = {
  ENTERPRISE_SUBSCRIPTION_ENABLED: false,      // 企业订阅UI
  ENTERPRISE_ADMIN_PANEL_ENABLED: false,       // 企业管理面板
  ENTERPRISE_SEAT_MANAGEMENT_ENABLED: false,   // 席位管理界面
  ENTERPRISE_BULK_PURCHASE_ENABLED: false,     // 批量购买界面
  ENTERPRISE_REPORTING_ENABLED: false,         // 企业统计报表
  ENTERPRISE_DATA_ISOLATION_ENABLED: false,    // 数据隔离逻辑
  ENTERPRISE_RBAC_ROLE_ENABLED: false,         // 企业角色权限
} as const;

// composables/useEnterprise.ts - 企业功能composable
import { ENTERPRISE_FLAGS } from '@/config/featureFlags'

export const useEnterprise = () => {
  const isEnterpriseEnabled = (feature: keyof typeof ENTERPRISE_FLAGS) => {
    return ENTERPRISE_FLAGS[feature]
  }
  
  const shouldShowEnterpriseUI = () => {
    return Object.values(ENTERPRISE_FLAGS).some(flag => flag)
  }
  
  return { isEnterpriseEnabled, shouldShowEnterpriseUI }
}
```

```vue
<!-- 权限控制和企业功能使用示例 -->
<template>
  <!-- RBAC权限控制 -->
  <PermissionGate permission="course.edit">
    <button @click="editCourse">编辑课程</button>
  </PermissionGate>
  
  <!-- 企业功能Feature Flag控制 -->
  <div v-if="isEnterpriseEnabled('ENTERPRISE_ADMIN_PANEL_ENABLED')">
    <EnterpriseAdminPanel />
  </div>
  
  <!-- 企业订阅UI控制 -->
  <div v-if="isEnterpriseEnabled('ENTERPRISE_SUBSCRIPTION_ENABLED')" 
       class="enterprise-subscription">
    <h3>企业订阅方案</h3>
    <BulkPurchase />
  </div>
  
  <!-- 或使用指令 -->
  <div v-permission="'member.access'">会员专属内容</div>
</template>

<script setup lang="ts">
import { useEnterprise } from '@/composables/useEnterprise'
import { useRBAC } from '@/composables/useRBAC'

const { isEnterpriseEnabled } = useEnterprise()
const { hasRole, hasPermission } = useRBAC()
</script>
```

### 组件开发工作流
1. **研究现有模式** - 找到3个类似组件作为参考
2. **设计组件props** - 使用TypeScript接口
3. **实现Composition API** - 使用 `<script setup lang="ts">`
4. **应用Bootstrap类** - 最小化自定义CSS
5. **测试响应式** - 在手机、平板、桌面上验证
6. **添加可访问性** - 包含适当的ARIA属性和alt文本

### 状态管理最佳实践
- **单一责任** - 每个存储处理一个域(身份验证、课程等)
- **Composition API风格** - 使用 `defineStore()` 配合setup函数
- **计算属性** - 使用Vue的 `computed()` 处理派生状态
- **持久化** - 对关键数据使用 `localStorage`/`sessionStorage`
- **错误处理** - 包含加载状态和错误管理

## 性能优化

### 代码分割和懒加载
```typescript
// router/index.ts - 懒加载页面组件
const routes = [
  {
    path: '/',
    name: 'Home',
    component: () => import('@/views/HomeView.vue')
  },
  {
    path: '/courses/:id',
    name: 'CourseDetails',
    component: () => import('@/views/CourseDetails.vue')
  }
]
```

### 图片优化
- **格式选择**: 使用WebP带回退，PNG用于图标
- **导入策略**: 始终将图片作为模块导入以进行Vite优化
- **响应式图片**: 为不同屏幕密度使用 `srcset`
- **懒加载**: 为课程图片实现懒加载

### 打包优化
```typescript
// vite.config.ts - 国内版优化构建配置
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['axios']  // 简化依赖，提升加载速度
        }
      }
    }
  }
})
```

## 安全考虑

### 前端安全
- **环境变量**: 使用 `.env` 文件，永远不要硬编码API密钥
- **XSS防护**: 清洗用户输入，使用 `v-text` 而非 `v-html`
- **CSRF保护**: Axios自动处理CSRF令牌
- **JWT存储**: 在localStorage中安全存储令牌并设置过期时间

### 内容安全策略
```html
<!-- 国内版CSP配置 - 仅允许百度统计 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' *.baidu.com hm.baidu.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;">
```

## 部署配置

### 环境变量
```bash
# .env.production - 国内版简化配置
VITE_API_BASE_URL=https://your-railway-backend.up.railway.app/api
VITE_BAIDU_SITE_ID=xxxxxxxxxx
VITE_ANALYTICS_TIMEOUT=3000
VITE_SEO_DEBUG=false

# 企业功能Feature Flag环境变量 (MVP阶段全部为false)
VITE_ENTERPRISE_SUBSCRIPTION_ENABLED=false
VITE_ENTERPRISE_ADMIN_PANEL_ENABLED=false
VITE_ENTERPRISE_SEAT_MANAGEMENT_ENABLED=false
VITE_ENTERPRISE_BULK_PURCHASE_ENABLED=false
VITE_ENTERPRISE_REPORTING_ENABLED=false
VITE_ENTERPRISE_DATA_ISOLATION_ENABLED=false
VITE_ENTERPRISE_RBAC_ROLE_ENABLED=false
```

### Vercel部署
- **框架预设**: Vite
- **构建命令**: `npm run build`
- **输出目录**: `dist`
- **安装命令**: `npm install`

## 开发理念

### 核心原则
- **渐进式开发**: 小的、可测试的变更优于大重写
- **组件可复用性**: 一次构建，处处使用
- **性能优先**: 为用户体验进行优化
- **类型安全**: 利用TypeScript减少运行时错误

### 决策框架
在多个方法之间选择时：
1. **可测试性** - 这能轻松进行单元测试吗？
2. **可维护性** - 6个月后这会被理解吗？
3. **性能** - 这会影响用户体验吗？
4. **一致性** - 这符合现有模式吗？
5. **简单性** - 这是可行的最简单解决方案吗？

### 质量门禁
- [ ] TypeScript编译无错误通过
- [ ] 所有组件都是响应式的(手机、平板、桌面)
- [ ] 图片使用适当的import语句
- [ ] 组件遵循PascalCase命名
- [ ] 优先使用Bootstrap工具类而非自定义CSS
- [ ] Props和emits使用TypeScript接口
- [ ] Pinia存储遵循Composition API模式
- [ ] 涉及权限的组件正确使用RBAC权限控制
- [ ] 企业功能组件正确使用Feature Flag控制
- [ ] 企业相关UI在MVP阶段完全隐藏
- [ ] 埋点事件遵循命名约定和分阶段计划
- [ ] SEO组件正确集成结构化数据

## 重要提醒

**始终:**
- 将图片作为模块导入，永远不用字符串路径
- 使用Composition API配合 `<script setup lang="ts">`
- 优先使用Bootstrap工具类而非自定义CSS
- 在多个屏幕尺寸上测试组件
- 所有Vue组件遵循PascalCase命名

**永远不要:**
- 使用Options API(项目中禁止)
- 硬编码API URL或敏感数据
- 在组件/文件名中混合中英文
- 使用字符串路径导入图片
- 跳过TypeScript类型定义

## Development Philosophy

> **开发哲学**: 比如"增量优于全部重构"、"代码要清晰而非聪明"。

> **标准工作流**: 规划 -> 写测试 -> 实现 -> 重构 -> 提交。

> **"卡住怎么办"预案**: 尝试3次失败后，必须停下来，记录失败、研究替代方案、反思根本问题。

> **决策框架**: 当有多种方案时，按可测试性 > 可读性 > 一致性 > 简单性的顺序选择。

# 开发指南

## 理念

### 核心信念

- **渐进式进展优于大爬轰** - 能编译和通过测试的小变更
- **从现有代码中学习** - 先研究再计划后实现
- **实用主义优于教条主义** - 适应项目现实
- **意图清晰优于巧妙代码** - 做无聊和明显的事

### 简单意味着

- 每个函数/类单一责任
- 避免过早抽象
- 不做巧妙的技巧 - 选择无聊的解决方案
- 如果你需要解释它，那就太复杂了

## 流程

### 1. 计划和分阶段

将复杂工作分解3-5个阶段。在 `IMPLEMENTATION_PLAN.md` 中文档化：

```markdown
## 阶段 N: [名称]
**目标**: [具体交付物]
**成功标准**: [可测试结果]
**测试**: [具体测试用例]
**状态**: [未开始|进行中|完成]
```
- 进展时更新状态
- 所有阶段完成时删除文件

### 2. 实现流程

1. **理解** - 研究代码库中的现有模式
2. **测试** - 先写测试(红)
3. **实现** - 最少代码使测试通过(绿)
4. **重构** - 在测试通过的情况下清理代码
5. **提交** - 带有清晰的消息链接到计划

### 3. 遇到困难时(尝试3次后)

**关键**: 每个问题最多尝试3次，然后停下。

1. **记录失败原因**:
   - 你尝试了什么
   - 具体的错误消息
   - 你认为失败的原因

2. **研究替代方案**:
   - 找到2-3个类似的实现
   - 注意使用的不同方法

3. **质疑基础**:
   - 这是正确的抽象层级吗？
   - 这能分解为更小的问题吗？
   - 有更简单的方法吗？

4. **尝试不同角度**:
   - 不同的库/框架特性？
   - 不同的架构模式？
   - 移除抽象而不是添加？

## 技术标准

### 架构原则

- **组合优于继承** - 使用依赖注入
- **接口优于单例** - 启用测试和灵活性
- **明确优于隐式** - 清晰的数据流和依赖
- **尽可能测试驱动** - 不要禁用测试，修复它们

### 代码质量

- **每次提交必须**:
  - 编译成功
  - 通过所有现有测试
  - 包含新功能的测试
  - 遵循项目格式化/代码检查

- **提交之前**:
  - 运行格式化程序/代码检查器
  - 自审查变更
  - 确保提交消息解释“为什么”

### 错误处理

- 使用描述性消息快速失败
- 包含调试上下文
- 在适当的层级处理错误
- 永远不要静默吞没异常

## 决策框架

当存在多个有效方法时，按以下顺序选择：

1. **可测试性** - 我能轻松测试这个吗？
2. **可读性** - 6个月后有人能理解这个吗？
3. **一致性** - 这符合项目模式吗？
4. **简单性** - 这是可行的最简单解决方案吗？
5. **可逆性** - 后续变更有多难？

## 项目集成

### 学习代码库

- 找到3个类似的功能/组件
- 识别通用模式和约定
- 尽可能使用相同的库/工具
- 遵循现有的测试模式

### 工具

- 使用项目现有的构建系统
- 使用项目的测试框架
- 使用项目的格式化/代码检查器设置
- 没有充分理由不要引入新工具

## 质量门禁

### 完成的定义

- [ ] 已编写和通过测试
- [ ] 代码遵循项目约定
- [ ] 没有代码检查器/格式化器警告
- [ ] 提交消息清晰
- [ ] 实现与计划匹配
- [ ] 没有无issue编号的TODO

### 测试指南

- 测试行为，而不是实现
- 尽可能每个测试一个断言
- 清晰的测试名称描述场景
- 使用现有的测试工具/助手
- 测试应该是确定性的

## 重要提醒

**永远不要**:
- 使用 `--no-verify` 绕过提交钩子
- 禁用测试而不是修复它们
- 提交不能编译的代码
- 做假设 - 用现有代码验证

**总是**:
- 增量式提交可工作的代码
- 进展时更新计划文档
- 从现有实现中学习
- 3次失败尝试后停下来重新评估

本前端特定的CLAUDE.md为UAI教育平台中Vue 3开发提供全面指导，重点关注组件架构、响应式设计和现代JavaScript最佳实践。