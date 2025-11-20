<template>
  <section class="portfolio-project-section py-5">
    <div class="container">
      <!-- 标题 -->
      <div class="row mb-4">
        <div class="col-12">
          <h2 class="portfolio-project-title mb-0">
            <span class="title-main">职业技能训练</span>
            <span class="title-sub ms-3">项目实战课</span>
          </h2>
        </div>
      </div>

      <!-- 项目实战课卡片 -->
      <div class="row g-4">
        <!-- AI+平面设计 -->
        <div class="col-lg-6 col-md-6">
          <div class="portfolio-project-card">
            <div class="card-image-container">
              <img
                :src="employmentUiCover"
                alt="AI+平面设计课程"
                class="img-fluid portfolio-project-image"
              />
              <!-- 课程信息覆盖层 -->
              <div class="course-overlay">
                <h3 class="course-title">AI+平面设计</h3>
                <p class="course-description">用AI智能辅助设计，加速你的职业成长</p>
                <a href="#" class="course-detail-link">课程详情 ></a>
                <button class="btn portfolio-project-btn" @click="startLearning('ui')">
                  开始学习
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
// 导入图片资源
import employmentUiCover from '@/assets/images/employment-ui-cover.png'

// 处理开始学习点击事件
const startLearning = (courseType: string) => {
  console.log(`开始学习 ${courseType} 课程`)
  // 这里可以添加导航到具体课程页面的逻辑
  // 例如: router.push(`/course/employment-${courseType}`)
}
</script>

<style scoped>
/* 职业技能训练模块样式 */
.portfolio-project-section {
  background-color: #ffffff;
}

/* 标题样式 */
.portfolio-project-title {
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

/* 项目实战课卡片样式 */
.portfolio-project-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.portfolio-project-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.card-image-container {
  position: relative;
  width: 100%;
  height: auto;
}

.portfolio-project-image {
  width: 100%;
  height: auto;
  object-fit: cover;
  border-radius: 12px;
}

/* 课程信息覆盖层样式 */
.course-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 380px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 2rem;
  color: white;
}

/* 课程标题样式 */
.course-title {
  font-size: 1.75rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: #000000;
}

/* 课程描述样式 */
.course-description {
  font-size: 1rem;
  margin-bottom: 0.75rem;
  color: #5c5b5b;
  line-height: 1.4;
}

/* 课程详情链接样式 */
.course-detail-link {
  color: #4a9eff;
  text-decoration: none;
  font-size: 0.95rem;
  margin-bottom: 2rem;
  transition: color 0.3s ease;
}

.course-detail-link:hover {
  color: #6bb6ff;
}

/* 项目实战课按钮样式 */
.portfolio-project-btn {
  background-color: #2b7fd3;
  color: white;
  border: none;
  border-radius: 25px;
  padding: 12px 40px;
  font-size: 1.1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  position: absolute;
  --button-bottom-offset: -330px; /* 按钮底部偏移量变量，可手动调整 */
  bottom: var(--button-bottom-offset);
  left: 50%;
  transform: translateX(-50%);
  min-width: 270px;
}

.portfolio-project-btn:hover {
  background-color: #1a6bb8;
  color: white;
  transform: translateX(-50%) translateY(-2px);
  box-shadow: 0 5px 15px rgba(43, 127, 211, 0.4);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .portfolio-project-title {
    font-size: 1.5rem;
  }

  .title-sub {
    display: block;
    margin-left: 0 !important;
    margin-top: 0.5rem;
  }

  .portfolio-project-card {
    margin-bottom: 1rem;
  }

  .course-title {
    font-size: 1.5rem;
  }

  .course-description {
    font-size: 0.9rem;
  }

  .portfolio-project-btn {
    bottom: 40px;
    padding: 10px 32px;
    font-size: 1rem;
  }
}

@media (max-width: 576px) {
  .portfolio-project-title {
    font-size: 1.25rem;
  }

  .course-overlay {
    padding: 1.5rem;
  }

  .course-title {
    font-size: 1.3rem;
  }

  .portfolio-project-btn {
    bottom: 32px;
    padding: 8px 24px;
    font-size: 0.95rem;
    min-width: 120px;
  }
}
</style>
