import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright 配置文件
 * 用于纯新阶段体系的 E2E 测试
 *
 * 文档：https://playwright.dev/docs/test-configuration
 */

export default defineConfig({
  // 测试目录
  testDir: './tests/e2e',

  // 并行运行测试
  fullyParallel: true,

  // 禁止在 CI 中提交测试失败
  forbidOnly: !!process.env.CI,

  // CI 中失败重试
  retries: process.env.CI ? 2 : 0,

  // CI 中使用更少的 worker
  workers: process.env.CI ? 1 : undefined,

  // 测试报告
  reporter: process.env.CI
    ? [['html'], ['github']]
    : [['html'], ['list']],

  // 共享设置
  use: {
    // 基础 URL
    baseURL: process.env.BASE_URL || 'http://localhost:5173',

    // 收集失败测试的 trace
    trace: 'on-first-retry',

    // 截图设置
    screenshot: 'only-on-failure',

    // 视频设置
    video: 'retain-on-failure'
  },

  // 配置测试项目（浏览器）
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }
    },

    // 可选：其他浏览器
    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    // 可选：移动浏览器
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],

  // 本地开发服务器配置
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120000
  }
})
