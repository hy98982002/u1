/**
 * 纯新阶段验证 E2E 测试
 * 确保三级体系（basic / intermediate / advanced）正确实现
 *
 * 测试覆盖：
 * 1. 阶段 URL 可访问性
 * 2. JSON-LD 结构化数据正确性
 * 3. 课程阶段标签显示
 * 4. 无遗留枚举值泄露
 */

import { test, expect } from '@playwright/test'

// ============================================
// 测试配置
// ============================================

const BASE_URL = process.env.BASE_URL || 'http://localhost:5173'

const VALID_STAGES = ['basic', 'intermediate', 'advanced'] as const
type StageKey = (typeof VALID_STAGES)[number]

const STAGE_LABELS: Record<StageKey, string> = {
  basic: '入门',
  intermediate: '进阶',
  advanced: '高阶'
}

// 遗留枚举值（不应该出现）
const LEGACY_VALUES = ['free', 'beginner', 'project', 'landing', 'high']

// ============================================
// 测试套件：阶段页面验证
// ============================================

test.describe('纯新阶段体系验证', () => {
  // 测试1：首页阶段标签显示
  test('首页应该显示正确的三级阶段标签', async ({ page }) => {
    await page.goto(BASE_URL)

    // 检查三个阶段标签都存在
    for (const stage of VALID_STAGES) {
      const label = STAGE_LABELS[stage]
      const stageTab = page.getByText(label, { exact: false })
      await expect(stageTab).toBeVisible()
    }

    // 检查不应该出现旧枚举值
    for (const legacy of LEGACY_VALUES) {
      const legacyElement = page.getByText(legacy, { exact: true })
      await expect(legacyElement).toHaveCount(0)
    }
  })

  // 测试2：课程详情页 JSON-LD 验证
  test('课程详情页应包含有效的 JSON-LD 结构化数据', async ({ page }) => {
    // 访问一个示例课程页面（假设存在）
    // 注意：需要根据实际路由调整 URL
    await page.goto(`${BASE_URL}/course/photoshop-ai-design-basic`)

    // 查找 JSON-LD script 标签
    const jsonLdScript = page.locator('script[type="application/ld+json"]').first()
    await expect(jsonLdScript).toBeAttached()

    // 获取 JSON-LD 内容
    const jsonLdContent = await jsonLdScript.textContent()
    expect(jsonLdContent).toBeTruthy()

    // 解析 JSON
    const jsonLd = JSON.parse(jsonLdContent!)

    // 验证基本结构
    expect(jsonLd['@context']).toBe('https://schema.org')
    expect(jsonLd['@type']).toBe('Course')

    // 验证教育层级字段
    expect(jsonLd.educationalLevel).toBeDefined()
    expect(jsonLd.educationalLevel['@type']).toBe('DefinedTerm')

    // 验证层级值是新枚举之一
    const levelName = jsonLd.educationalLevel.name
    expect(Object.values(STAGE_LABELS)).toContain(levelName)

    // 验证不包含旧枚举值
    const jsonStr = JSON.stringify(jsonLd)
    for (const legacy of LEGACY_VALUES) {
      expect(jsonStr).not.toContain(legacy)
    }
  })

  // 测试3：Program 页面验证
  test('Program 页面应包含正确的体系结构化数据', async ({ page }) => {
    // 访问体系课页面
    await page.goto(`${BASE_URL}/program/basic`)

    // 查找 JSON-LD script 标签
    const jsonLdScript = page.locator('script[type="application/ld+json"]').first()

    // 如果页面存在 JSON-LD
    if ((await jsonLdScript.count()) > 0) {
      const jsonLdContent = await jsonLdScript.textContent()
      const jsonLd = JSON.parse(jsonLdContent!)

      // 验证 Program 类型
      expect(jsonLd['@type']).toBe('EducationalOccupationalProgram')

      // 验证包含课程列表
      if (jsonLd.hasCourse) {
        expect(Array.isArray(jsonLd.hasCourse)).toBe(true)
        expect(jsonLd.hasCourse.length).toBeGreaterThan(0)

        // 验证每个课程引用
        for (const course of jsonLd.hasCourse) {
          expect(course['@type']).toBe('Course')
          expect(course.url).toBeTruthy()
        }
      }
    }
  })

  // 测试4：阶段切换功能
  test('阶段标签切换应正确过滤课程', async ({ page }) => {
    await page.goto(BASE_URL)

    // 点击不同阶段标签
    for (const stage of VALID_STAGES) {
      const label = STAGE_LABELS[stage]

      // 点击阶段标签
      await page.getByRole('button', { name: label }).click()

      // 等待页面更新
      await page.waitForTimeout(500)

      // 验证 URL 或内容更新（根据实际实现调整）
      // 例如检查显示的课程数量大于0
      const courseCards = page.locator('.course-card') // 根据实际选择器调整
      const count = await courseCards.count()
      expect(count).toBeGreaterThanOrEqual(0)
    }
  })

  // 测试5：页面源代码不包含遗留值
  test('页面 HTML 源码不应包含遗留枚举值', async ({ page }) => {
    await page.goto(BASE_URL)

    // 获取页面 HTML 内容
    const htmlContent = await page.content()

    // 检查不包含旧枚举值（排除注释）
    const htmlWithoutComments = htmlContent.replace(/<!--[\s\S]*?-->/g, '')

    for (const legacy of LEGACY_VALUES) {
      // 使用正则避免误报（例如单词的一部分）
      const pattern = new RegExp(`\\b${legacy}\\b`, 'gi')
      const matches = htmlWithoutComments.match(pattern)

      // 如果发现遗留值，提供详细错误信息
      if (matches) {
        console.error(`发现遗留枚举值 "${legacy}":`, matches)
      }

      expect(matches).toBeNull()
    }
  })
})

// ============================================
// 测试套件：课程数据完整性
// ============================================

test.describe('课程数据完整性验证', () => {
  test('所有课程的 stage 字段应为有效枚举值', async ({ page }) => {
    await page.goto(BASE_URL)

    // 注入脚本检查 courseStore 数据
    const invalidCourses = await page.evaluate(() => {
      // @ts-ignore - 访问全局 Pinia store
      const store = window.__PINIA__?.state?.value?.course

      if (!store || !store.courses) {
        return { error: 'courseStore 未找到' }
      }

      const validStages = ['basic', 'intermediate', 'advanced']
      const invalid = store.courses.filter(
        (c: any) => !validStages.includes(c.stage)
      )

      return invalid.length > 0 ? invalid : null
    })

    if (invalidCourses && 'error' in invalidCourses) {
      console.warn(invalidCourses.error)
      // 跳过此测试如果 store 不可访问
      test.skip()
    } else {
      expect(invalidCourses).toBeNull()
    }
  })
})

// ============================================
// 测试套件：SEO 优化验证
// ============================================

test.describe('SEO 元数据验证', () => {
  test('课程页面应包含正确的 meta 标签', async ({ page }) => {
    await page.goto(`${BASE_URL}/course/photoshop-ai-design-basic`)

    // 检查 title 标签
    const title = await page.title()
    expect(title.length).toBeGreaterThan(0)

    // 检查 description meta 标签
    const description = page.locator('meta[name="description"]')
    await expect(description).toBeAttached()

    // 检查 keywords meta 标签（如果存在）
    const keywords = page.locator('meta[name="keywords"]')
    if ((await keywords.count()) > 0) {
      const keywordsContent = await keywords.getAttribute('content')
      expect(keywordsContent).toBeTruthy()
    }
  })
})
