<!-- NotFound.vue - 404页面组件 -->
<template>
  <div class="not-found-page">
    <!-- 导航栏 -->
    <AuthNavbar v-if="authStore.isAuthenticated" />
    <Navbar v-else />

    <!-- 404内容区域 -->
    <div class="container text-center py-5 mt-5">
      <div class="error-content">
        <!-- 404数字 -->
        <h1 class="display-1 fw-bold text-primary mb-4">404</h1>

        <!-- 错误信息 -->
        <div class="alert alert-warning d-inline-block shadow-sm" role="alert">
          <h4 class="alert-heading mb-3">页面未找到</h4>
          <p class="mb-2">抱歉，您访问的页面不存在或已被移除。</p>
          <hr />
          <p class="mb-0 text-muted">请检查URL是否正确，或返回首页继续浏览。</p>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons mt-4">
          <button @click="goHome" class="btn btn-primary btn-lg me-3">
            <i class="bi bi-house-door-fill me-2"></i>
            返回首页
          </button>
          <button @click="goBack" class="btn btn-outline-secondary btn-lg">
            <i class="bi bi-arrow-left me-2"></i>
            返回上一页
          </button>
        </div>

        <!-- 友好提示 -->
        <div class="help-text mt-5 text-muted">
          <p>如果您需要帮助，请尝试：</p>
          <ul class="list-unstyled">
            <li>
              <i class="bi bi-check-circle-fill text-success me-2"></i>
              访问
              <router-link to="/" class="text-decoration-none">首页</router-link>
              浏览所有课程
            </li>
            <li>
              <i class="bi bi-check-circle-fill text-success me-2"></i>
              使用搜索功能查找您感兴趣的内容
            </li>
            <li>
              <i class="bi bi-check-circle-fill text-success me-2"></i>
              联系客服获取支持
            </li>
          </ul>
        </div>
      </div>
    </div>

    <!-- 页脚 -->
    <footer class="mt-5 py-4 text-center text-white bg-dark">
      <div class="container">
        <p class="mb-1">&copy; 2025 多维AI课堂. All rights reserved.</p>
        <p class="text-muted mb-0">doviai.com</p>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/store/authStore'
import Navbar from '@/components/Navbar.vue'
import AuthNavbar from '@/components/AuthNavbar.vue'

const router = useRouter()
const authStore = useAuthStore()

// 返回首页
const goHome = () => {
  router.push('/')
}

// 返回上一页
const goBack = () => {
  router.back()
}
</script>

<style scoped>
.not-found-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.error-content {
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem;
}

.display-1 {
  font-size: 8rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
}

.alert {
  max-width: 500px;
  border-radius: 12px;
}

.action-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.help-text {
  max-width: 400px;
  margin: 0 auto;
}

.help-text ul li {
  padding: 0.5rem 0;
  text-align: left;
}

footer {
  margin-top: auto;
}

/* 响应式优化 */
@media (max-width: 768px) {
  .display-1 {
    font-size: 5rem;
  }

  .action-buttons {
    flex-direction: column;
  }

  .btn-lg {
    width: 100%;
  }

  .error-content {
    padding: 1rem;
  }
}
</style>
