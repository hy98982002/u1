<template>
  <section class="employment-section py-5">
    <div class="container">
      <!-- 标题 -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="employment-title mb-0">
            <span class="title-main">就业新选项</span>
            <span class="title-sub ms-3">给能力多加分</span>
          </h2>
        </div>
      </div>
      
      <!-- 就业课程卡片 -->
      <div class="row g-4">
        <!-- AI+logo设计 -->
        <div class="col-lg-6 col-md-6">
          <div class="employment-card">
            <div class="card-image-container">
              <img 
                :src="employmentLogoCover" 
                alt="AI+logo设计课程" 
                class="img-fluid employment-image"
              >
            </div>
          </div>
        </div>
        
        <!-- AI+平面设计 -->
        <div class="col-lg-6 col-md-6">
          <div class="employment-card">
            <div class="card-image-container">
              <img 
                :src="employmentUiCover" 
                alt="AI+平面设计课程" 
                class="img-fluid employment-image"
              >
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 导入图片资源
import employmentLogoCover from '@/assets/images/employment-logo-cover.png'
import employmentUiCover from '@/assets/images/employment-ui-cover.png'
</script>

<style scoped>
/* 就业模块样式 */
.employment-section {
  background-color: #ffffff;
}

/* 标题样式 */
.employment-title {
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

/* 就业卡片样式 */
.employment-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.employment-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-image-container {
  position: relative;
  width: 100%;
  height: auto;
}

.employment-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 12px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .employment-title {
    font-size: 1.5rem;
  }
  
  .title-sub {
    display: block;
    margin-left: 0 !important;
    margin-top: 0.5rem;
  }
  
  .employment-card {
    margin-bottom: 1rem;
  }
}

@media (max-width: 576px) {
  .employment-title {
    font-size: 1.25rem;
  }
}
</style>