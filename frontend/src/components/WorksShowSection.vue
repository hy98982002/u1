<template>
  <section class="works-show-section py-5" style="margin-top: 57px;">
    <div class="container">
      <!-- 标题 -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="works-title mb-0" style="margin-bottom: 64px !important;">
            <span class="title-main">学员作品墙</span>
            <span class="title-sub ms-3">求职面试的敲门砖</span>
          </h2>
        </div>
      </div>
      
      <!-- 作品展示轮播图 -->
      <div class="works-carousel-wrapper">
        <div id="worksCarousel" class="carousel slide carousel-fade" data-bs-ride="carousel">
          <!-- 轮播指示器 -->
          <div class="carousel-indicators">
            <button
              v-for="(_, index) in worksData"
              :key="index"
              type="button"
              data-bs-target="#worksCarousel"
              :data-bs-slide-to="index"
              :class="{ active: index === 0 }"
              :aria-label="`作品展示 ${index + 1}`"
            ></button>
          </div>

          <!-- 轮播内容 -->
          <div class="carousel-inner">
            <div
              v-for="(work, index) in worksData"
              :key="index"
              class="carousel-item"
              :class="{ active: index === 0 }"
            >
              <div class="carousel-bg">
                <img :src="work.image" :alt="work.alt" class="carousel-img" />
              </div>
            </div>
          </div>

          <!-- 轮播控制按钮 -->
          <button
            class="carousel-control-prev"
            type="button"
            data-bs-target="#worksCarousel"
            data-bs-slide="prev"
          >
            <span class="carousel-control-prev-icon"></span>
            <span class="visually-hidden">上一张</span>
          </button>
          <button
            class="carousel-control-next"
            type="button"
            data-bs-target="#worksCarousel"
            data-bs-slide="next"
          >
            <span class="carousel-control-next-icon"></span>
            <span class="visually-hidden">下一张</span>
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
// 导入作品展示图片
import worksShowImg from '@/assets/images/works show.png'

// 作品轮播数据 - 只包含图片，不包含文字内容
const worksData = ref([
  {
    id: 1,
    image: worksShowImg,
    alt: '学员作品展示 1'
  },
  {
    id: 2,
    image: worksShowImg,
    alt: '学员作品展示 2'
  },
  {
    id: 3,
    image: worksShowImg,
    alt: '学员作品展示 3'
  },
  {
    id: 4,
    image: worksShowImg,
    alt: '学员作品展示 4'
  }
])

onMounted(() => {
  console.log('作品展示组件已加载')
})
</script>

<style scoped>
/* 作品展示模块样式 */
.works-show-section {
  background-color: #ffffff;
}

/* 标题样式 */
.works-title {
  text-align: left;
  font-weight: 600;
  font-size: 2rem;
  line-height: 1.4;
}

.title-main {
  color: #000000;
}

.title-sub {
  color: #5c5b5b;
}

/* 轮播图容器样式 */
.works-carousel-wrapper {
  position: relative;
  height: 725px;
  max-width: 1609px;
  margin: 0 auto;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  
  /* 边缘清晰处理 */
  transform: translate3d(0, 0, 0);
  -webkit-transform: translate3d(0, 0, 0);
  will-change: transform;
}

.carousel {
  height: 100%;
  transform: translate3d(0, 0, 0);
  -webkit-transform: translate3d(0, 0, 0);
  will-change: transform;
  contain: layout style paint;
}

.carousel-item {
  height: 725px;
  position: relative;
  transform: translate3d(0, 0, 0);
  -webkit-transform: translate3d(0, 0, 0);
  will-change: transform;
  contain: layout style paint;
}

.carousel-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  transform: translate3d(0, 0, 0);
  -webkit-transform: translate3d(0, 0, 0);
  will-change: transform;
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  contain: layout style paint;
  box-sizing: border-box;
  outline: 1px solid transparent;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  filter: blur(0);
  shape-rendering: crispEdges;
}

.carousel-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  
  /* 图片边缘锐化 */
  image-rendering: -webkit-optimize-contrast;
  image-rendering: crisp-edges;
  transform: translate3d(0, 0, 0);
  -webkit-transform: translate3d(0, 0, 0);
  will-change: transform;
  outline: 1px solid transparent;
  box-sizing: border-box;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  filter: blur(0);
  shape-rendering: crispEdges;
  position: relative;
  top: 0;
  left: 0;
}

/* 轮播控制器样式 */
.carousel-control-prev,
.carousel-control-next {
  width: 5%;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.carousel-control-prev {
  left: 1rem;
}

.carousel-control-next {
  right: 1rem;
}

.carousel-control-prev:hover,
.carousel-control-next:hover {
  opacity: 1;
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-size: 50%;
  border-radius: 50%;
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(3px);
  -webkit-backdrop-filter: blur(3px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2), 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.carousel-control-prev-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='m11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z'/%3e%3c/svg%3e") !important;
}

.carousel-control-next-icon {
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='%23000'%3e%3cpath d='m4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z'/%3e%3c/svg%3e") !important;
}

.carousel-control-prev:hover .carousel-control-prev-icon,
.carousel-control-next:hover .carousel-control-next-icon {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.4);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15), 0 3px 12px rgba(0, 0, 0, 0.1);
}

/* 指示器样式 */
.carousel-indicators {
  bottom: 20px;
}

.carousel-indicators button {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  background: transparent;
  transition: all 0.3s ease;
}

.carousel-indicators button.active {
  background: white;
  border-color: white;
  transform: scale(1.2);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .works-title {
    font-size: 1.5rem;
  }
  
  .title-sub {
    display: block;
    margin-left: 0 !important;
    margin-top: 0.5rem;
  }
  
  .works-carousel-wrapper {
    height: 450px;
    margin: 0 15px;
    border-radius: 12px;
  }

  .carousel-item {
    height: 450px;
  }
}

@media (max-width: 576px) {
  .works-title {
    font-size: 1.25rem;
  }
  
  .works-carousel-wrapper {
    height: 350px;
    margin: 0 10px;
  }

  .carousel-item {
    height: 350px;
  }
}

/* Mac设备专用边缘修复 */
@media (-webkit-min-device-pixel-ratio: 2) {
  .works-carousel-wrapper {
    -webkit-transform: translate3d(0.5px, 0.5px, 0);
    transform: translate3d(0.5px, 0.5px, 0);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  .carousel-img {
    image-rendering: -webkit-optimize-contrast;
    image-rendering: optimize-contrast;
    -ms-interpolation-mode: nearest-neighbor;
  }
}

/* Safari专用修复 */
@supports (-webkit-appearance: none) {
  .works-carousel-wrapper {
    -webkit-mask-image: -webkit-radial-gradient(white, black);
    -webkit-transform-style: preserve-3d;
    transform-style: preserve-3d;
  }
}
</style>