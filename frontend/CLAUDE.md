# CLAUDE.md - Frontend Development Guide

This file provides frontend-specific guidance for Claude Code when working in the `/frontend` directory of the UAI Education Platform.

## Project Overview

UAI Education Platform Frontend - Vue 3 + TypeScript + Vite application for online education services. Frontend-only development context with focus on responsive design, component architecture, and modern JavaScript practices.

## Frontend Technology Stack

**Core Framework:**
- Vue 3 with Composition API + TypeScript
- Vite build tool and development server
- Bootstrap 5.3.6 for UI (no other UI frameworks allowed)
- Pinia for state management
- Vue Router for client-side routing
- Axios for API requests

**Development Tools:**
- TypeScript for type safety
- ESLint + Prettier for code quality
- Vite for fast development and optimized builds

## Development Commands

All commands should be run from the `/frontend` directory:

```bash
# Development workflow
npm install                    # Install all dependencies
npm run dev                   # Start development server (localhost:5173)
npm run build                 # Production build
npm run build:check           # Build with TypeScript checking
npm run type-check            # TypeScript type checking only
npm run preview               # Preview production build

# Feature-specific packages
npm install opencc-js         # Chinese simplified/traditional conversion
npm install vue-gtag          # Analytics integration (conditional loading)
npm install @types/gtag       # TypeScript definitions for analytics
```

## Frontend Architecture

### Directory Structure (`/frontend/src/`)
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
│   ├── payment/                  # Payment and membership
│   │   ├── PaymentModal.vue     # Payment processing
│   │   ├── MembershipCard.vue   # Membership display
│   │   └── PriceComparison.vue  # Price comparison component
│   ├── cart/                     # Shopping cart components
│   ├── order/                    # Order processing components
│   ├── personCenter/             # Personal dashboard components
│   ├── seo/                      # SEO相关组件
│   │   ├── SEOHead.vue          # 动态meta标签组件
│   │   └── FAQSection.vue       # FAQ组件
│   ├── Navbar.vue               # Main navigation
│   └── ...                     # Other reusable components
├── store/                        # Pinia state management
│   ├── index.ts                 # Store configuration
│   ├── authStore.ts             # Authentication state (多登录方式)
│   ├── courseStore.ts           # Course data state (分层课程体系)
│   ├── membershipStore.ts       # Membership and subscription state
│   ├── learningStore.ts         # Learning progress state
│   ├── uiStore.ts               # UI/UX state
│   └── seoStore.ts              # SEO状态管理
├── api/                          # Axios API wrappers
│   ├── auth.ts                  # Authentication API (手机验证码/密码/微信)
│   ├── courses.ts               # Course management API (7层课程体系)
│   ├── payment.ts               # Payment and membership API
│   ├── sms.ts                   # SMS verification API (阿里云)
│   ├── learning.ts              # Learning progress tracking API
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
│   ├── cart.ts                  # Shopping cart types
│   ├── order.ts                 # Order types
│   └── seo.ts                   # SEO类型定义
├── utils/                        # Utility functions
│   ├── toast.ts                 # Toast notifications
│   ├── seo.ts                   # SEO工具函数
│   └── tracking.ts              # Analytics utilities
├── composables/                  # Vue 3 composables
│   └── useAnalytics.ts          # 分析统计composable
├── assets/                       # Static resources
│   ├── icons/                   # Logo and icon resources
│   ├── images/                  # Business images (course covers, avatars)
│   ├── fonts-clarity.css        # Font clarity optimization
│   └── vue.svg                  # Framework assets
└── config/                       # Configuration files
    └── baidu.json               # 百度统计配置
```

### Backend API Integration
- **Base URL**: `http://localhost:8000/api/` (development)
- **Production URL**: Railway backend URL (configured via environment variables)
- **Authentication**: JWT tokens automatically attached via Axios interceptors
- **Response Format**: All APIs return `{ status, data, msg }` structure

## Development Conventions

### Vue 3 Coding Standards
- **Composition API Only**: Strictly forbidden to use Options API
- **TypeScript Required**: All `.vue` files must use `<script setup lang="ts">`
- **Component Naming**: PascalCase for all components (e.g., `UserProfile.vue`)
- **Props/Emits**: Use TypeScript interfaces for prop definitions

**Recommended Component Structure:**
```vue
<template>
  <!-- Bootstrap utility classes preferred -->
  <div class="container-fluid">
    <div class="row">
      <div class="col-md-8">
        <!-- Main content -->
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthStore } from '@/store/authStore'

// Interface definitions
interface Props {
  title: string
  isVisible?: boolean
}

// Props and emits
const props = withDefaults(defineProps<Props>(), {
  isVisible: true
})

// Reactive data
const loading = ref(false)
const authStore = useAuthStore()

// Computed properties
const displayTitle = computed(() => 
  props.title.toUpperCase()
)

// Lifecycle
onMounted(() => {
  // Component initialization
})
</script>

<style scoped>
/* Custom styles only when Bootstrap is insufficient */
</style>
```

### State Management with Pinia
```typescript
// store/authStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const token = ref<string | null>(localStorage.getItem('token'))
  const userInfo = ref<UserInfo | null>(null)

  // Getters
  const isLoggedIn = computed(() => !!token.value)

  // Actions
  const login = async (credentials: LoginCredentials) => {
    // Implementation
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

## UI/UX Guidelines

### Bootstrap 5.3.6 Usage
- **Utility Classes First**: Prefer Bootstrap utility classes over custom CSS
- **Grid System**: Use `row` and `col-*` classes for responsive layouts
- **Components**: Leverage Bootstrap components (buttons, cards, modals)
- **Custom Styles**: Only add custom CSS when Bootstrap cannot achieve the design

### Responsive Design Standards
- **Mobile First**: All components must work on ≤768px screens
- **Breakpoints**:
  - `xs`: <576px (mobile)
  - `sm`: ≥576px (mobile landscape)
  - `md`: ≥768px (tablet)
  - `lg`: ≥992px (desktop)
  - `xl`: ≥1200px (large desktop)
  - `xxl`: ≥1400px (extra large)

### Mac Device Optimization
```css
/* Mac-specific responsive handling */
@media (min-width: 1440px) and (-webkit-min-device-pixel-ratio: 2) {
  .course-cards-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 2rem;
  }
}
```

### Font Clarity System
**Core Principle**: Layer separation architecture ensuring text content stays on clear layers while glassmorphism effects only apply to background layers.

```css
/* Global font optimization */
body {
  font-family: 'Segoe UI', 'Microsoft YaHei', 'PingFang SC', system-ui, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

/* Layer separation system */
.text-layer {
  z-index: 10; /* Absolute clarity */
  backdrop-filter: none !important;
}

.glass-background {
  z-index: 1; /* Blur effects */
}
```

## Image Asset Management

### Asset Directory Structure
```
src/assets/
├── icons/                    # Logos and icon resources
│   ├── logo.png
│   └── logo.svg
└── images/                   # Business images
    ├── tiyan-*-cover.jpg     # Free trial courses
    ├── rumen-*-cover.jpg     # Basic courses  
    ├── jingjin-*-cover.jpg   # Advanced courses
    ├── shizhan-*-cover.jpg   # Project courses
    └── xiangmuluodi-*-cover.png # Enterprise courses
```

### Image Import Standards
**Always use import statements, never string paths:**

```vue
<script setup lang="ts">
// ✅ Correct - Import images as modules
import logoImg from '@/assets/icons/logo.png'
import courseCover from '@/assets/images/tiyan-python-cover.jpg'
</script>

<template>
  <!-- ✅ Use imported variables -->
  <img :src="logoImg" alt="UAI Logo" />
  <img :src="courseCover" alt="Python Course" />
  
  <!-- ❌ Avoid string paths -->
  <!-- <img src="@/assets/icons/logo.png" alt="Logo" /> -->
</template>
```

### Course Image Naming Convention
- **File prefix must match course stage**:
  - `tiyan-` → `stage: 'free'` (Free trial)
  - `rumen-` → `stage: 'basic'` (Basic level)
  - `jingjin-` → `stage: 'advanced'` (Advanced level) 
  - `shizhan-` → `stage: 'project'` (Project level)
  - `xiangmuluodi-` → `stage: 'landing'` (Enterprise level)

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

## Analytics & Tracking

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

### Event Tracking Standards
- **Naming Convention**: `module.action.state` (e.g., `video.play.start`)
- **Data Attributes**: Add `data-track` attributes to trackable elements
- **Core Events**:
  - User journey: `user.register`, `user.login`, `user.logout`, `user.wechat_bind`
  - Learning: `video.play.start/pause/end`, `course.progress.update`, `course.trial.start`
  - Commerce: `cart.add`, `payment.success`, `membership.subscribe`, `coupon.apply`
  - Course stages: `stage.tiyan.enter`, `stage.rumen.unlock`, `stage.member.access`
  - SEO优化: `search.from.baidu`, `faq.click`, `course.view`

## API Integration

### Axios Configuration
```typescript
// api/index.ts
import axios from 'axios'
import { useAuthStore } from '@/store/authStore'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000
})

// Request interceptor - Auto-attach JWT
request.interceptors.request.use(config => {
  const authStore = useAuthStore()
  if (authStore.token) {
    config.headers.Authorization = `Bearer ${authStore.token}`
  }
  return config
})

// Response interceptor - Handle unified response format
request.interceptors.response.use(
  response => response.data, // Extract { status, data, msg }
  error => {
    console.error('API Error:', error)
    return Promise.reject(error)
  }
)
```

### API Service Pattern
```typescript
// api/courses.ts
import request from './index'
import type { Course, CourseListResponse } from '@/types'

export const courseAPI = {
  // Get course list
  getCourses: (stage?: string): Promise<CourseListResponse> => {
    return request.get('/courses/', { params: { stage } })
  },

  // Get course details
  getCourseDetail: (id: number): Promise<Course> => {
    return request.get(`/courses/${id}/`)
  },

  // Search courses
  searchCourses: (query: string): Promise<CourseListResponse> => {
    return request.get('/courses/search/', { params: { q: query } })
  }
}
```

## Common Development Tasks

### Adding New Features
1. **Create API service** in `src/api/` following REST conventions
2. **Define TypeScript types** in `src/types/` for data structures
3. **Implement Pinia store** in `src/store/` for state management
4. **Build reusable components** in `src/components/` with proper naming
5. **Create page components** in `src/views/` using existing patterns
6. **Update router configuration** in `src/router/index.ts` for new routes

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

### Component Development Workflow
1. **Study existing patterns** - Find 3 similar components for reference
2. **Design component props** - Use TypeScript interfaces
3. **Implement Composition API** - Use `<script setup lang="ts">`
4. **Apply Bootstrap classes** - Minimize custom CSS
5. **Test responsiveness** - Verify on mobile, tablet, desktop
6. **Add accessibility** - Include proper ARIA attributes and alt texts

### State Management Best Practices
- **Single responsibility** - Each store handles one domain (auth, courses, etc.)
- **Composition API style** - Use `defineStore()` with setup function
- **Computed properties** - Use Vue's `computed()` for derived state
- **Persistence** - Use `localStorage`/`sessionStorage` for critical data
- **Error handling** - Include loading states and error management

## Performance Optimization

### Code Splitting & Lazy Loading
```typescript
// router/index.ts - Lazy load page components
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

### Image Optimization
- **Format Selection**: Use WebP with fallbacks, PNG for icons
- **Import Strategy**: Always import images as modules for Vite optimization
- **Responsive Images**: Use `srcset` for different screen densities
- **Lazy Loading**: Implement lazy loading for course images

### Bundle Optimization
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

## Security Considerations

### Frontend Security
- **Environment Variables**: Use `.env` files, never hardcode API keys
- **XSS Prevention**: Sanitize user input, use `v-text` over `v-html`
- **CSRF Protection**: Axios automatically handles CSRF tokens
- **JWT Storage**: Store tokens securely in localStorage with expiration

### Content Security Policy
```html
<!-- 国内版CSP配置 - 仅允许百度统计 -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' *.baidu.com hm.baidu.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;">
```

## Deployment Configuration

### Environment Variables
```bash
# .env.production - 国内版简化配置
VITE_API_BASE_URL=https://your-railway-backend.up.railway.app/api
VITE_BAIDU_SITE_ID=xxxxxxxxxx
VITE_ANALYTICS_TIMEOUT=3000
VITE_SEO_DEBUG=false
```

### Vercel Deployment
- **Framework Preset**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

## Development Philosophy

### Core Principles
- **Incremental Development**: Small, testable changes over big rewrites
- **Component Reusability**: Build once, use everywhere
- **Performance First**: Optimize for user experience
- **Type Safety**: Leverage TypeScript for fewer runtime errors

### Decision Framework
When choosing between multiple approaches:
1. **Testability** - Can this be easily unit tested?
2. **Maintainability** - Will this be understandable in 6 months?
3. **Performance** - Does this impact user experience?
4. **Consistency** - Does this match existing patterns?
5. **Simplicity** - Is this the simplest solution that works?

### Quality Gates
- [ ] TypeScript compilation passes with no errors
- [ ] All components are responsive (mobile, tablet, desktop)
- [ ] Images use proper import statements
- [ ] Components follow PascalCase naming
- [ ] Bootstrap utility classes are preferred over custom CSS
- [ ] Props and emits use TypeScript interfaces
- [ ] Pinia stores follow composition API pattern

## Important Reminders

**ALWAYS:**
- Import images as modules, never use string paths
- Use Composition API with `<script setup lang="ts">`
- Prefer Bootstrap utility classes over custom CSS
- Test components on multiple screen sizes
- Follow PascalCase naming for all Vue components

**NEVER:**
- Use Options API (forbidden in this project)
- Hardcode API URLs or sensitive data
- Mix Chinese and English in component/file names
- Import images with string paths
- Skip TypeScript type definitions

## Development Philosophy

> **开发哲学**: 比如"增量优于全部重构"、"代码要清晰而非聪明"。

> **标准工作流**: 规划 -> 写测试 -> 实现 -> 重构 -> 提交。

> **"卡住怎么办"预案**: 尝试3次失败后，必须停下来，记录失败、研究替代方案、反思根本问题。

> **决策框架**: 当有多种方案时，按可测试性 > 可读性 > 一致性 > 简单性的顺序选择。

# Development Guidelines

## Philosophy

### Core Beliefs

- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Clear intent over clever code** - Be boring and obvious

### Simplicity Means

- Single responsibility per function/class
- Avoid premature abstractions
- No clever tricks - choose the boring solution
- If you need to explain it, it's too complex

## Process

### 1. Planning & Staging

Break complex work into 3-5 stages. Document in `IMPLEMENTATION_PLAN.md`:

```markdown
## Stage N: [Name]
**Goal**: [Specific deliverable]
**Success Criteria**: [Testable outcomes]
**Tests**: [Specific test cases]
**Status**: [Not Started|In Progress|Complete]
```
- Update status as you progress
- Remove file when all stages are done

### 2. Implementation Flow

1. **Understand** - Study existing patterns in codebase
2. **Test** - Write test first (red)
3. **Implement** - Minimal code to pass (green)
4. **Refactor** - Clean up with tests passing
5. **Commit** - With clear message linking to plan

### 3. When Stuck (After 3 Attempts)

**CRITICAL**: Maximum 3 attempts per issue, then STOP.

1. **Document what failed**:
   - What you tried
   - Specific error messages
   - Why you think it failed

2. **Research alternatives**:
   - Find 2-3 similar implementations
   - Note different approaches used

3. **Question fundamentals**:
   - Is this the right abstraction level?
   - Can this be split into smaller problems?
   - Is there a simpler approach entirely?

4. **Try different angle**:
   - Different library/framework feature?
   - Different architectural pattern?
   - Remove abstraction instead of adding?

## Technical Standards

### Architecture Principles

- **Composition over inheritance** - Use dependency injection
- **Interfaces over singletons** - Enable testing and flexibility
- **Explicit over implicit** - Clear data flow and dependencies
- **Test-driven when possible** - Never disable tests, fix them

### Code Quality

- **Every commit must**:
  - Compile successfully
  - Pass all existing tests
  - Include tests for new functionality
  - Follow project formatting/linting

- **Before committing**:
  - Run formatters/linters
  - Self-review changes
  - Ensure commit message explains "why"

### Error Handling

- Fail fast with descriptive messages
- Include context for debugging
- Handle errors at appropriate level
- Never silently swallow exceptions

## Decision Framework

When multiple valid approaches exist, choose based on:

1. **Testability** - Can I easily test this?
2. **Readability** - Will someone understand this in 6 months?
3. **Consistency** - Does this match project patterns?
4. **Simplicity** - Is this the simplest solution that works?
5. **Reversibility** - How hard to change later?

## Project Integration

### Learning the Codebase

- Find 3 similar features/components
- Identify common patterns and conventions
- Use same libraries/utilities when possible
- Follow existing test patterns

### Tooling

- Use project's existing build system
- Use project's test framework
- Use project's formatter/linter settings
- Don't introduce new tools without strong justification

## Quality Gates

### Definition of Done

- [ ] Tests written and passing
- [ ] Code follows project conventions
- [ ] No linter/formatter warnings
- [ ] Commit messages are clear
- [ ] Implementation matches plan
- [ ] No TODOs without issue numbers

### Test Guidelines

- Test behavior, not implementation
- One assertion per test when possible
- Clear test names describing scenario
- Use existing test utilities/helpers
- Tests should be deterministic

## Important Reminders

**NEVER**:
- Use `--no-verify` to bypass commit hooks
- Disable tests instead of fixing them
- Commit code that doesn't compile
- Make assumptions - verify with existing code

**ALWAYS**:
- Commit working code incrementally
- Update plan documentation as you go
- Learn from existing implementations
- Stop after 3 failed attempts and reassess

This frontend-specific CLAUDE.md provides comprehensive guidance for Vue 3 development in the UAI Education Platform, focusing on component architecture, responsive design, and modern JavaScript best practices.