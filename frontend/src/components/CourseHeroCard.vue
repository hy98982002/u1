<!-- CourseHeroCard.vue - 课程顶部卡片组件 -->
<template>
  <div class="card cardTop p-lg-3 p-3 mb-4 course-hero">
    <!-- 面包屑导航 -->
    <BreadcrumbNav :items="breadcrumbItems" />

    <div class="row g-0 align-items-center">
      <!-- 左侧：课程封面图 -->
      <div class="col-md-4 mb-0 mb-md-0">
        <img
          :src="courseInfo.coverImage"
          class="course-hero-img w-100"
          :alt="courseInfo.title"
          loading="lazy"
        />
      </div>

      <!-- 右侧：课程信息 -->
      <div class="col-md-8 ps-md-4">
        <!-- 主标题 -->
        <h1 class="course-title fw-bold mb-2">{{ courseInfo.title }}</h1>

        <!-- 副标题 -->
        <p class="course-subtitle text-muted mb-3">
          {{ courseInfo.subtitle }}
        </p>

        <!-- 热门课程标签和学习热度、课程时长 -->
        <div class="course-stats mb-3 d-flex align-items-center text-muted">
          <span class="hot-badge me-3">热门课程</span>
          <span class="me-4">学习热度：{{ courseInfo.studyHeat }}</span>
          <span>课程时长：{{ courseInfo.duration }}</span>
        </div>

        <!-- 价格区域 -->
        <div class="price-section mb-3">
          <div class="d-flex align-items-baseline mb-2">
            <span class="current-price me-2">价格¥{{ courseInfo.discountPrice }}</span>
            <span class="original-price me-2">¥{{ courseInfo.originalPrice }}</span>
            <span class="discount-badge">{{ courseInfo.discount }}% 折扣</span>
          </div>
          <!-- 倒计时提示 -->
          <div class="countdown-notice">
            <i class="far fa-clock me-1"></i>
            <span>此优惠价格仅剩 {{ remainingHours }} 小时!</span>
          </div>
        </div>

        <!-- 按钮组 -->
        <div class="d-flex flex-wrap mb-3">
          <button class="btn btn-buy-course me-3 mb-2 px-4" @click="handleTryWatch">
            立即购买
          </button>
          <button class="btn btn-yellow-black mb-2 px-4" @click="handleOpenVip">
            开通 VIP 立即学
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import BreadcrumbNav from './BreadcrumbNav.vue'
import type { BreadcrumbItem } from '@/types'
// 导入默认图片 (使用现有的课程封面作为占位符)
import defaultCoverImage from '@/assets/images/courses/free-photoshop-cover-480.png'

// 扩展的CourseInfo类型定义
interface CourseInfo {
  title: string
  subtitle?: string
  coverImage: string
  studyHeat?: number
  duration?: string
  discountPrice?: number
  originalPrice?: number
  discount?: number
  promotionEndTime?: Date
  isFree?: boolean
  price?: number
}

interface Props {
  courseInfo?: CourseInfo
  breadcrumbItems?: BreadcrumbItem[]
}

const props = withDefaults(defineProps<Props>(), {
  courseInfo: () => ({
    title: 'Photoshop体验课:从小白到高手',
    subtitle: '一听就懂，快速上手，8大商业案例助你快速提升ps技能',
    coverImage: defaultCoverImage,
    studyHeat: 2281,
    duration: '191分钟',
    discountPrice: 13.99,
    originalPrice: 19.99,
    discount: 30,
    promotionEndTime: new Date(Date.now() + 9 * 60 * 60 * 1000), // 默认9小时后结束
    isFree: false,
    price: 299
  }),
  breadcrumbItems: () => []
})

// 倒计时逻辑
const remainingHours = ref(9)
const countdownInterval = ref<number | null>(null)

// 计算剩余时间
const calculateRemainingTime = () => {
  if (!props.courseInfo?.promotionEndTime) {
    remainingHours.value = 0
    return
  }

  const now = new Date().getTime()
  const endTime = new Date(props.courseInfo.promotionEndTime).getTime()
  const diff = endTime - now

  if (diff <= 0) {
    remainingHours.value = 0
    if (countdownInterval.value) {
      clearInterval(countdownInterval.value)
    }
    return
  }

  // 转换为小时（向上取整）
  remainingHours.value = Math.ceil(diff / (1000 * 60 * 60))
}

// 生命周期钩子
onMounted(() => {
  calculateRemainingTime()
  // 每分钟更新一次倒计时
  countdownInterval.value = window.setInterval(calculateRemainingTime, 60000)
})

onUnmounted(() => {
  if (countdownInterval.value) {
    clearInterval(countdownInterval.value)
  }
})

// 按钮事件处理
const handleTryWatch = () => {
  console.log('立即购买')
  // TODO: 跳转到购买页面
}

const handleOpenVip = () => {
  console.log('开通VIP')
  // TODO: 跳转到VIP开通页面
}
</script>

<style scoped>
/* ===== HIG设计原则：Clarity / Deference / Depth ===== */

/* 颜色变量定义 */
:root {
  --uai-tech-blue: #1e7f98;
  --uai-light-blue: #bdecfd;
  --uai-hover-blue: rgba(35, 192, 247, 0.3);
  --uai-bg-gray: #f2f7f7;
  --uai-border-gray: rgba(222, 222, 222, 0.9);
  --hot-badge-bg: #4a9e9e;
  --discount-orange: #ff6b35;
  --countdown-red: #d32f2f;
}

/* 课程信息卡片样式 */
.course-hero {
  border: 1px solid var(--uai-border-gray);
  border-radius: 10px;
  max-width: calc(100% - 70px); /* 从70px改为40px,减少30px边距 */
  margin-left: auto;
  margin-right: auto;
  transform: translateX(-18px);
  background: #ffffff;
}

/* 面包屑在卡片内的样式调整 */
.course-hero :deep(.container) {
  max-width: 100%;
  padding: 0;
  margin: 0;
}

.course-hero :deep(.breadcrumb) {
  margin-top: -35px;
  margin-left: 0;
  margin-bottom: 0.5rem;
  background: transparent !important;
  padding: 0;
  font-size: 16px;
  transform: translateY(20px);
}

.course-hero :deep(.breadcrumb-item) {
  color: #888;
}

.course-hero :deep(.breadcrumb-item a) {
  color: #888 !important;
}

/* ===== 左侧图片区域 ===== */
.course-hero-img {
  width: 100%;
  border-radius: 10px;
  display: block;
  margin-bottom: 8px; /* 减少图片底部空白 */
  vertical-align: bottom; /* 消除inline元素的基线空隙 */
}

/* 热门课程标签 - 行内显示样式 */
.hot-badge {
  display: inline-block;
  background-color: #4a9e9e;
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.5px;
}

/* ===== 右侧内容区域 - HIG Clarity原则 ===== */

/* 主标题 */
.course-title {
  font-size: 26px;
  line-height: 1.1;
  color: #111111;
  /* margin-top: 5px; */
  margin-bottom: 10px;
  font-weight: 700;
  letter-spacing: -0.3px;
  transform: translateY(14px);
}

/* 副标题 - HIG Deference原则：辅助信息克制展示 */
.course-subtitle {
  font-size: 16px;
  line-height: 1.2;
  color: #666666;
  margin-bottom: 16px;
  transform: translateY(12px);
  font-weight: 450;
}

/* 课程统计信息 */
.course-stats {
  font-size: 14px;
  line-height: 0.8;
  color: #666666;
  margin-top: -5px;
  margin-bottom: 20px;
  transform: translateY(10px);
}

.course-stats span {
  display: inline-flex;
  align-items: center;
}

/* ===== 价格区域 - HIG Clarity原则：信息层级清晰 ===== */
.price-section {
  margin-bottom: 24px;
}

/* 当前折扣价 - 最大号强调 */
.current-price {
  font-size: 18px;
  font-weight: 700;
  color: #111111;
  line-height: 1;
  letter-spacing: -0.5px;
  transform: translateY(10px);
}

/* 原价 - 删除线 */
.original-price {
  font-size: 18px;
  color: #999999;
  text-decoration: line-through;
  font-weight: 400;
  transform: translateY(10px);
}

/* 折扣标签 */
.discount-badge {
  display: inline-block;
  background-color: var(--discount-orange);
  color: white;
  padding: 4px 12px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

/* 倒计时提示 - 红色警示 */
.countdown-notice {
  color: #d32f2f !important; /* 使用具体的红色值 */
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  margin-top: 8px;
}

.countdown-notice i {
  font-size: 16px;
  margin-right: 6px;
}

/* ===== 按钮样式 - HIG Depth原则：交互层次 ===== */

/* 立即购买按钮 - 新设计 */
.btn-buy-course {
  background: transparent;
  border: 2px solid #2c849a;
  color: #2c849a;
  font-weight: 600;
  font-size: 16px;
  border-radius: 8px;
  transition: background-color 0.25s ease;
  min-width: 140px;
}

.btn-buy-course:hover {
  background-color: #97bbc6;
  color: #2c849a;
  border-color: #2c849a;
}

.btn-buy-course:focus {
  box-shadow: 0 0 0 3px rgba(44, 132, 154, 0.2);
  border-color: #2c849a;
  background-color: transparent;
}

/* VIP按钮 */
.btn-yellow-black {
  background-color: #ffc107 !important;
  color: #222222 !important;
  border: 2px solid #ffc107 !important;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  transition: all 0.25s ease;
  min-width: 160px;
}

.btn-yellow-black:hover {
  background-color: #ffb300 !important;
  border-color: #ffb300 !important;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(255, 193, 7, 0.3);
}

.btn-yellow-black:focus {
  box-shadow: 0 0 0 3px rgba(255, 193, 7, 0.3) !important;
}

/* ===== 响应式设计 ===== */
@media (max-width: 768px) {
  .course-title {
    font-size: 24px;
    margin-bottom: 10px;
  }

  .course-subtitle {
    font-size: 14px;
    margin-bottom: 12px;
  }

  .current-price {
    font-size: 36px;
  }

  .original-price {
    font-size: 16px;
  }

  .btn-buy-course,
  .btn-yellow-black {
    width: 100%;
    min-width: unset;
  }

  .hot-badge {
    font-size: 12px;
    padding: 4px 12px;
  }
}

/* ===== HIG间距系统：8px基准网格 ===== */
.mb-2 {
  margin-bottom: 8px;
}

.mb-3 {
  margin-bottom: 16px;
}

.mb-4 {
  margin-bottom: 24px;
}

.gap-3 {
  gap: 16px;
}
</style>
