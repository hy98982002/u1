<!-- CourseDetails.vue - 课程详情主页面组件 -->
<template>
  <div class="course-details-page">
    <!-- 根据登录状态切换导航栏 -->
    <AuthNavbar v-if="authStore.isAuthenticated" />
    <Navbar v-else />

    <!-- 加载状态 -->
    <div v-if="loading" class="container text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">加载中...</span>
      </div>
      <p class="mt-3 text-muted">正在加载课程信息...</p>
    </div>

    <!-- 课程不存在 -->
    <div v-else-if="courseNotFound" class="container text-center py-5">
      <div class="alert alert-warning" role="alert">
        <h4 class="alert-heading">课程未找到</h4>
        <p>抱歉，您访问的课程不存在或已被移除。</p>
        <hr />
        <p class="mb-0">3秒后将自动返回首页...</p>
      </div>
    </div>

    <!-- 正常内容 -->
    <template v-else>
      <!-- 面包屑导航 -->
      <BreadcrumbNav :items="breadcrumbItems" />

      <!-- 课程详情主体 -->
      <section class="container">
        <!-- 课程封面和信息 -->
        <CourseHeroCard :courseInfo="courseInfo" />

        <!-- 选项卡和侧栏 -->
        <div class="row g-4">
          <div class="col-lg-8">
            <CourseTabs :defaultTab="activeTab" />
          </div>

          <div class="col-lg-4">
            <SidebarPricingCard />
          </div>
        </div>
      </section>

      <!-- 页脚 -->
      <footer class="mt-5 py-4 text-center text-white">
        <div class="container">
          <p class="mb-0">&copy; 2025 多维AI课堂. 保留所有权利.</p>
        </div>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from '../components/Navbar.vue'
import AuthNavbar from '../components/AuthNavbar.vue'
import BreadcrumbNav from '../components/BreadcrumbNav.vue'
import CourseHeroCard from '../components/CourseHeroCard.vue'
import CourseTabs from '../components/CourseTabs.vue'
import SidebarPricingCard from '../components/SidebarPricingCard.vue'
import { useAuthStore } from '../store/authStore'
import { useCourseStore } from '../store/courseStore'
import { STAGES } from '../types'
import type { BreadcrumbItem, CourseInfo } from '../types'

// 使用 store 和路由
const authStore = useAuthStore()
const courseStore = useCourseStore()
const route = useRoute()
const router = useRouter()

// 从路由参数获取 slug
const slug = route.params.slug as string

// 加载状态
const loading = ref(true)
const courseNotFound = ref(false)

// 当前激活的标签页
const activeTab = ref('catalog')

// 面包屑数据
const breadcrumbItems = ref<BreadcrumbItem[]>([
  { title: '首页', href: '/', path: '/' }
])

// 课程信息
const courseInfo = ref<CourseInfo>({
  title: '加载中...',
  coverImage: '',
  difficulty: '',
  updatedLessons: 0,
  isFree: false,
  price: 0
})

// 页面挂载后的初始化
onMounted(() => {
  console.log('课程详情页面已加载，slug:', slug)

  // 根据 slug 从课程 store 获取课程数据
  const course = courseStore.getCourseBySlug(slug)

  if (course) {
    // 设置课程信息
    courseInfo.value = {
      title: course.title,
      coverImage: course.cover,
      difficulty: course.level || '适合初学者',
      updatedLessons: Math.floor(Math.random() * 50) + 1,
      isFree: course.isFree || course.price === 0,
      price: course.price || 0
    }

    // 设置面包屑导航（使用 STAGES 映射）
    breadcrumbItems.value = [
      { title: '首页', href: '/', path: '/' },
      {
        title: STAGES[course.stage],
        href: `/category/${course.stage}`,
        path: `/category/${course.stage}`
      },
      { title: course.title }
    ]

    loading.value = false
    console.log(`课程加载成功: ${course.title}`)
  } else {
    console.error('未找到对应的课程:', slug)
    courseNotFound.value = true
    loading.value = false

    // 3秒后重定向到首页
    setTimeout(() => {
      router.push('/')
    }, 3000)
  }
})
</script>

<style scoped>
/* 页面基础样式 */
.course-details-page {
  font-family: 'Alibaba PuHuiTi', '思源黑体', sans-serif;
  background-color: #f2f7f7;
  color: #111111;
  min-height: 100vh;
}

/* 页脚样式 */
footer {
  background-color: #1e7f98 !important;
  color: #fff !important;
}

/* 移动端适配 */
@media (max-width: 991.98px) {
  .col-lg-4 {
    margin-top: 2rem;
  }
}

/* 全局样式变量 */
:root {
  --uai-tech-blue: #1e7f98;
  --uai-light-blue: #bdecfd;
  --uai-hover-blue: rgba(35, 192, 247, 0.3);
  --uai-bg-gray: #f2f7f7;
  --uai-border-gray: rgba(222, 222, 222, 0.9);
}

/* 精确移除课程详情页侧边栏的蓝色边框 */
.course-details-page .col-lg-4 {
  border: none !important;
  outline: none !important;
}

.course-details-page .course-sidebar {
  border: none !important;
  outline: none !important;
}

/* 只针对侧边栏内的卡片移除边框，保留优惠券按钮 */
.course-details-page .course-sidebar .card:not(.coupon-btn) {
  border: none !important;
  outline: none !important;
}
</style>

<style>
/* 全局样式 */
body {
  font-family: 'Alibaba PuHuiTi', '思源黑体', sans-serif;
  background-color: #f2f7f7;
  color: #111111;
}

/* 确保Bootstrap图标正常显示 */
.fa,
.fas,
.far {
  font-family: 'Font Awesome 5 Free';
}

/* 确保阿里图标正常显示 */
.iconfont {
  font-family: 'iconfont' !important;
}
</style>
