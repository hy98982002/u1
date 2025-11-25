// slug.ts
// 生成课程 slug，符合三引擎 AEO（Google / Bing / 百度）最佳规则
// 遵循新的三级体系：basic → beginner, intermediate → intermediate, advanced → advanced

import type { StageKey } from '@/types'
import { getStageSlug, slugToStageKey } from './stageMap'

// 课程级别英文映射（用于URL slug）
const LEVEL_SLUG_MAP: Record<StageKey, string> = {
  basic: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced'
}

/**
 * 清理文本：去掉中文括号、特殊符号、空格
 * @param title 原始标题
 * @returns 清理后的标题
 */
function normalizeTitle(title: string): string {
  return title
    .replace(/（.*?）/g, '') // 去掉中文括号内容：例如 "设计课（入门）"
    .replace(/\(.*?\)/g, '') // 去掉英文括号内容
    .replace(/[·•—–]/g, ' ') // 替换特殊分隔符
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5 ]/g, '') // 保留中英文+数字
    .trim()
}

/**
 * 中文转 slug-friendly 关键词
 * 注意：当前阶段保留英文关键词，未来如需支持中文拼音可在此扩展
 * @param str 输入字符串
 * @returns slug友好字符串
 */
function chineseToSlugKeyword(str: string): string {
  // 移除常见的中文后缀词
  return str
    .replace(/课程|基础|入门|进阶|高阶|实战|训练|课|教程|培训|学习/g, '')
    .trim()
}

/**
 * 转连字符 slug
 * @param str 输入字符串
 * @returns 小写连字符格式
 */
function toSlug(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // 空格转连字符
    .replace(/-+/g, '-') // 合并多余的 -
    .replace(/^-|-$/g, '') // 删除首尾的 -
}

/**
 * 生成课程 slug（主函数）
 * @param title 课程标题
 * @param level 课程级别 (basic / intermediate / advanced)
 * @returns SEO友好的slug，如 "ai-photoshop-design-beginner"
 *
 * @example
 * generateCourseSlug("AI Photoshop 设计课（入门）", "basic")
 * // 返回: "ai-photoshop-design-beginner"
 *
 * generateCourseSlug("Python Web开发实战", "intermediate")
 * // 返回: "python-web-intermediate"
 */
export function generateCourseSlug(title: string, level: StageKey): string {
  const normalized = normalizeTitle(title)

  // 提取关键词并转为slug格式
  const mainPart = toSlug(chineseToSlugKeyword(normalized))

  // 获取级别的slug标识符
  const levelSlug = LEVEL_SLUG_MAP[level] || 'beginner'

  // 最终结构：topic-topic-topic-level
  return mainPart ? `${mainPart}-${levelSlug}` : `course-${levelSlug}`
}

/**
 * 从slug解析课程信息
 * @param slug URL中的slug
 * @returns 包含stage和courseName的对象
 *
 * @example
 * parseSlug("ai-photoshop-design-beginner")
 * // 返回: { stage: "basic", courseName: "ai-photoshop-design" }
 */
export function parseSlug(slug: string): {
  stage: StageKey
  courseName: string
} {
  const parts = slug.split('-')

  // 检查最后一部分是否是有效的level slug
  const lastPart = parts[parts.length - 1]
  const reverseMap: Record<string, StageKey> = {
    beginner: 'basic',
    intermediate: 'intermediate',
    advanced: 'advanced'
  }

  let stage: StageKey
  let courseName: string

  if (lastPart in reverseMap) {
    // 最后一部分是级别
    stage = reverseMap[lastPart]
    courseName = parts.slice(0, -1).join('-')
  } else {
    // 兜底：默认basic，整个slug作为课程名
    stage = 'basic'
    courseName = slug
  }

  return { stage, courseName }
}

/**
 * 用于 Program JSON-LD、路径显示等
 * @param level StageKey
 * @returns 英文slug (beginner / intermediate / advanced)
 */
export function getLevelSlug(level: StageKey): string {
  return LEVEL_SLUG_MAP[level] || 'beginner'
}

/**
 * 验证slug格式是否有效
 * @param slug 待验证的slug
 * @returns 是否为有效格式
 *
 * @example
 * isValidSlug("ai-photoshop-design-beginner") // true
 * isValidSlug("invalid_format") // false
 */
export function isValidSlug(slug: string): boolean {
  // slug格式要求：只能包含小写字母、数字、连字符
  const slugPattern = /^[a-z0-9]+(-[a-z0-9]+)*$/

  if (!slugPattern.test(slug)) {
    return false
  }

  // 验证是否包含有效的级别标识
  const { stage } = parseSlug(slug)
  return stage === 'basic' || stage === 'intermediate' || stage === 'advanced'
}

/**
 * 生成课程详情页的完整URL
 * @param slug 课程slug
 * @param baseUrl 基础URL（可选，默认为''）
 * @returns 完整的课程URL
 *
 * @example
 * getCourseUrl("ai-photoshop-design-beginner") // "/course/ai-photoshop-design-beginner"
 * getCourseUrl("python-web-intermediate", "https://doviai.com")
 * // "https://doviai.com/course/python-web-intermediate"
 */
export function getCourseUrl(slug: string, baseUrl: string = ''): string {
  const path = `/course/${slug}`
  return baseUrl ? `${baseUrl}${path}` : path
}

/**
 * 生成Program页面的URL
 * @param programType 'A' 或 'B'
 * @param programName program名称（如 'aigc', 'ai-designer'）
 * @param level 级别（可选，对于Program A通常是intermediate，Program B是advanced）
 * @returns Program页面URL
 *
 * @example
 * getProgramUrl('A', 'aigc', 'intermediate') // "/program/aigc-intermediate"
 * getProgramUrl('B', 'ai-designer', 'advanced') // "/program/ai-designer-advanced"
 */
export function getProgramUrl(
  programType: 'A' | 'B',
  programName: string,
  level?: StageKey
): string {
  const levelSlug = level ? `-${LEVEL_SLUG_MAP[level]}` : ''
  return `/program/${programName}${levelSlug}`
}
