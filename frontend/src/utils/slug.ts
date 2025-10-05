// frontend/src/utils/slug.ts

import type { CourseCardTemplate } from '@/types'
import { normalizeStage } from './stageMap'

/**
 * 生成课程的SEO友好slug
 * @param stage - 课程阶段（支持拼音或英文）
 * @param courseName - 课程名称（中文或英文）
 * @returns slug字符串，如 "beginner-python"
 *
 * @example
 * generateCourseSlug('rumen', 'Python基础') // "beginner-python"
 * generateCourseSlug('free', 'AI入门课') // "free-ai"
 * generateCourseSlug('advanced', 'Web开发实战') // "advanced-web"
 */
export function generateCourseSlug(
  stage: string | CourseCardTemplate,
  courseName: string
): string {
  // 1. 标准化阶段为英文
  const normalizedStage = normalizeStage(stage)

  // 2. 处理课程名称
  const cleanName = courseName
    .toLowerCase()
    // 移除常见中文后缀
    .replace(/课程|基础|入门|进阶|实战|课|教程|训练营|培训/g, '')
    // 提取英文关键词（如果有）
    .replace(/[^\w\s-]/g, '')
    .trim()
    // 空格转为连字符
    .replace(/\s+/g, '-')
    // 移除多余的连字符
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')

  // 3. 如果名称为空，使用阶段作为后缀
  const finalName = cleanName || 'course'

  // 4. 拼接slug
  return `${normalizedStage}-${finalName}`
}

/**
 * 从slug解析课程信息
 * @param slug - URL中的slug
 * @returns { stage, courseName }
 *
 * @example
 * parseSlug('beginner-python') // { stage: 'beginner', courseName: 'python' }
 * parseSlug('free-ai-intro') // { stage: 'free', courseName: 'ai-intro' }
 */
export function parseSlug(slug: string): {
  stage: CourseCardTemplate
  courseName: string
} {
  const parts = slug.split('-')
  const stageCandidate = parts[0]

  // 尝试标准化第一部分作为stage
  const stage = normalizeStage(stageCandidate)

  // 剩余部分作为课程名称
  const courseName = parts.slice(1).join('-')

  return { stage, courseName }
}

/**
 * 验证slug格式是否有效
 * @param slug - 待验证的slug
 * @returns 是否为有效格式
 *
 * @example
 * isValidSlug('beginner-python') // true
 * isValidSlug('invalid_format') // false
 * isValidSlug('123-abc') // false
 */
export function isValidSlug(slug: string): boolean {
  // slug格式要求：stage-coursename
  // stage必须是有效的阶段标识
  // coursename只能包含字母、数字、连字符

  const slugPattern = /^[a-z]+-[a-z0-9-]+$/
  if (!slugPattern.test(slug)) {
    return false
  }

  const { stage } = parseSlug(slug)
  // 检查stage是否有效（如果normalizeStage返回默认值'free'，可能不是有效输入）
  const parts = slug.split('-')
  const originalStage = parts[0]

  // 验证原始stage是否能正确标准化（而不是fallback到默认值）
  return stage === normalizeStage(originalStage)
}

/**
 * 生成课程详情页的完整URL
 * @param slug - 课程slug
 * @param baseUrl - 基础URL（可选，默认为''）
 * @returns 完整的课程URL
 *
 * @example
 * getCourseUrl('beginner-python') // "/course/beginner-python"
 * getCourseUrl('free-ai', 'https://doviai.com') // "https://doviai.com/course/free-ai"
 */
export function getCourseUrl(slug: string, baseUrl: string = ''): string {
  const path = `/course/${slug}`
  return baseUrl ? `${baseUrl}${path}` : path
}
