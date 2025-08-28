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
│   ├── cart/                     # Shopping cart components
│   ├── order/                    # Order processing components
│   ├── personCenter/             # Personal dashboard components
│   ├── i18n/                     # Language switching components
│   ├── Navbar.vue               # Main navigation
│   ├── CourseCard.vue           # Course display card
│   ├── LoginModal.vue           # Authentication modal
│   └── ...                     # Other reusable components
├── store/                        # Pinia state management
│   ├── index.ts                 # Store configuration
│   ├── authStore.ts             # Authentication state
│   ├── courseStore.ts           # Course data state
│   └── uiStore.ts               # UI/UX state
├── api/                          # Axios API wrappers
│   ├── auth.ts                  # Authentication API
│   ├── courses.ts               # Course management API
│   └── orders.ts                # Order processing API
├── router/                       # Vue Router configuration
│   └── index.ts                 # Route definitions
├── types/                        # TypeScript definitions
│   ├── index.ts                 # Common types
│   ├── cart.ts                  # Shopping cart types
│   └── order.ts                 # Order types
├── utils/                        # Utility functions
│   ├── toast.ts                 # Toast notifications
│   ├── i18n.ts                  # Language conversion utilities
│   └── tracking.ts              # Analytics utilities
├── assets/                       # Static resources
│   ├── icons/                   # Logo and icon resources
│   ├── images/                  # Business images (course covers, avatars)
│   ├── fonts-clarity.css        # Font clarity optimization
│   └── vue.svg                  # Framework assets
└── config/                       # Configuration files
    └── tracking.json             # Analytics configuration
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

## Internationalization (i18n)

### V1.0 OpenCC Strategy
- **Approach**: Frontend-only simplified/traditional Chinese conversion
- **Library**: OpenCC.js for character conversion
- **Implementation**: DOM-based conversion with localStorage persistence
- **Performance**: <200ms conversion time for large pages

```javascript
// Regional detection logic
const detectUserRegion = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const language = navigator.language.toLowerCase()
  
  const isChinaMainland = 
    timezone.includes('Shanghai') || 
    timezone.includes('Chongqing') || 
    language.startsWith('zh-cn')
  
  return {
    isChinaMainland,
    loadGA4: !isChinaMainland,
    region: isChinaMainland ? 'mainland' : 'international'
  }
}
```

## Analytics & Tracking

### Regional Loading Strategy
- **Mainland China**: Baidu Analytics only (avoid GA4 blocking)
- **International**: Baidu + Google Analytics 4
- **Implementation**: Geo-detection based on timezone and browser language
- **Performance**: 3-second timeout with graceful degradation

```typescript
// useAnalytics.ts
export const useAnalytics = () => {
  const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
    // Regional loading logic
    const region = detectUserRegion()
    
    // Baidu Analytics (universal)
    window._hmt?.push(['_trackEvent', eventName, eventData])
    
    // GA4 (conditional)
    if (region.loadGA4) {
      window.gtag?.('event', eventName, eventData)
    }
  }
  
  return { trackEvent }
}
```

### Event Tracking Standards
- **Naming Convention**: `module.action.state` (e.g., `video.play.start`)
- **Data Attributes**: Add `data-track` attributes to trackable elements
- **Core Events**:
  - User journey: `user.register`, `user.login`, `user.logout`
  - Learning: `video.play.start/pause/end`, `course.progress.update`
  - Commerce: `cart.add`, `payment.success`, `coupon.apply`
  - SEO/AEO: `search.from.baidu/google`, `faq.click`

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
// vite.config.ts - Optimize build output
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['vue', 'vue-router', 'pinia'],
          utils: ['axios', 'opencc-js']
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
<!-- Recommended CSP headers -->
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; 
               script-src 'self' 'unsafe-inline' *.googletagmanager.com *.baidu.com;
               style-src 'self' 'unsafe-inline';
               img-src 'self' data: https:;">
```

## Deployment Configuration

### Environment Variables
```bash
# .env.production
VITE_API_BASE_URL=https://your-railway-backend.up.railway.app/api
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_BAIDU_SITE_ID=xxxxxxxxxx
VITE_ANALYTICS_TIMEOUT=3000
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