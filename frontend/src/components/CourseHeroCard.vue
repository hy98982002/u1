<!-- CourseHeroCard.vue - 课程顶部卡片组件 -->
<template>
  <div class="card cardTop p-lg-4 p-3 mb-4 course-hero">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <div class="row g-0 align-items-center">
      <div class="col-md-4 mb-3 mb-md-0">
        <img
          :src="courseInfo.coverImage"
          class="course-hero-img w-100"
          :alt="courseInfo.title"
          loading="lazy"
        />
      </div>
      <div class="col-md-8 ps-md-4">
        <h3 class="fw-bold mb-2">{{ courseInfo.title }}</h3>
        <p class="text-muted small mb-1">
          难度 {{ courseInfo.difficulty }} | 已更新到第 {{ courseInfo.updatedLessons }} 节
        </p>
        <p class="h5 mb-3">
          价格
          <span class="fw-bold" :class="courseInfo.isFree ? 'text-info' : 'text-warning'">
            {{ courseInfo.isFree ? '免费' : `¥${courseInfo.price}` }}
          </span>
        </p>
        <div class="d-flex flex-wrap mb-3">
          <button class="btn btn-primary me-3 mb-2 px-4 btn-tech-blue" @click="handleTryWatch">
            立即试看
          </button>
          <button class="btn btn-yellow-black text-orange mb-2 px-4" @click="handleOpenVip">
            开通 VIP 立即学
          </button>
        </div>
        <div class="d-flex align-items-center text-muted small">
          <a
            href="#"
            class="me-3"
            @click.prevent="handleShare"
            data-bs-toggle="tooltip"
            title="分享"
          >
            <i class="fas fa-share-alt"></i> 分享
          </a>
          <a
            href="#"
            class="me-3"
            @click.prevent="handleFavorite"
            data-bs-toggle="tooltip"
            title="收藏"
          >
            <i :class="isFavorited ? 'fas' : 'far'" class="fa-heart"></i>
            {{ isFavorited ? '已收藏' : '收藏' }}
          </a>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BreadcrumbNav from './BreadcrumbNav.vue'
import type { BreadcrumbItem, CourseInfo } from '@/types'
// 导入默认图片 (使用现有的课程封面作为占位符)
import defaultCoverImage from '@/assets/images/courses/free-photoshop-cover-480.png'

interface Props {
  courseInfo?: CourseInfo
  breadcrumbItems?: BreadcrumbItem[]
}

withDefaults(defineProps<Props>(), {
  courseInfo: () => ({
    title: '零基础photoshopAI创意设计第一季',
    coverImage: defaultCoverImage,
    difficulty: '适合初学者',
    updatedLessons: 25,
    isFree: true,
    price: 299
  }),
  breadcrumbItems: () => []
})

const isFavorited = ref(false)

const handleTryWatch = () => {
  console.log('立即试看')
  // TODO: 跳转到试看页面或播放试看视频
}

const handleOpenVip = () => {
  console.log('开通VIP')
  // TODO: 跳转到VIP开通页面
}

const handleShare = () => {
  console.log('分享课程')
  // TODO: 显示分享弹窗
}

const handleFavorite = () => {
  isFavorited.value = !isFavorited.value
  console.log('收藏状态：', isFavorited.value)
  // TODO: 调用收藏API
}
</script>

<style scoped>
/* 颜色变量定义 */
:root {
  --uai-tech-blue: #1e7f98;
  --uai-light-blue: #bdecfd;
  --uai-hover-blue: rgba(35, 192, 247, 0.3);
  --uai-bg-gray: #f2f7f7;
  --uai-border-gray: rgba(222, 222, 222, 0.9);
}

/* 页面基础样式 */
body {
  font-family: 'Alibaba PuHuiTi', '思源黑体', sans-serif;
  background-color: var(--uai-bg-gray);
  color: #111111;
}

/* 课程信息卡片样式 */
.course-hero {
  border: 1px solid var(--uai-border-gray);
  border-radius: 10px;
  /* 添加最大宽度限制，使其与侧边栏购物车图块在右侧对齐 */
  max-width: calc(100% - 70px);
  margin-left: auto;
  margin-right: auto;
  transform: translateX(-18px);
}

/* 面包屑在卡片内的样式调整 */
.course-hero :deep(.container) {
  max-width: 100%;
  padding: 0;
  margin: 0;
}

.course-hero :deep(.breadcrumb) {
  margin-top: 0;
  margin-left: 0;
  margin-bottom: 1rem;
  background: transparent !important;
  padding: 0;
  font-size: 14px;
}

.course-hero :deep(.breadcrumb-item) {
  color: #888;
}

.course-hero :deep(.breadcrumb-item a) {
  color: #888 !important;
}

.course-hero-img {
  width: 100%;
  border-radius: 10px;
}

/* 课程状态标签 */
.course-hero .badge-free {
  background: var(--uai-light-blue);
}

/* 按钮样式 */
.btn-tech-blue {
  background: none;
  border: 1px solid #1e7f98;
  color: #1e7f98;
  transition: all 0.3s ease;
}

.btn-tech-blue:hover {
  background-color: #0069d9;
  color: white;
  border: 1px solid #0069d9;
  box-shadow: none !important;
}

.btn-tech-blue:focus {
  box-shadow: none !important;
  border: 1px solid #0069d9;
}

/* VIP按钮样式 */
.btn-yellow-black {
  background-color: #ffc107 !important;
  color: #222 !important;
  border: 1px solid #ffc107 !important;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-yellow-black:hover,
.btn-yellow-black:focus {
  background-color: #ffc107 !important;
  color: #000 !important;
  border: 1px solid #ffc107 !important;
}
</style>
