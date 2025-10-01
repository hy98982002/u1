// frontend/src/utils/stageMap.ts

import type { CourseCardTemplate } from '@/types'

/**
 * 课程阶段映射表
 * 用途：处理前后端数据格式差异、旧代码迁移过渡
 *
 * 使用场景：
 * 1. 后端API如果返回拼音格式，前端转换为英文
 * 2. 旧数据迁移时的兼容处理
 * 3. URL参数标准化
 */

// 拼音 → 英文映射
export const PINYIN_TO_ENGLISH: Record<string, CourseCardTemplate> = {
  tiyan: 'free',
  rumen: 'beginner',
  jingjin: 'advanced',
  shizhan: 'hands-on',
  xiangmushizhan: 'project',
  huiyuan: 'vip'
} as const

// 英文 → 拼音映射（反向查询）
export const ENGLISH_TO_PINYIN: Record<CourseCardTemplate, string> = {
  free: 'tiyan',
  beginner: 'rumen',
  advanced: 'jingjin',
  'hands-on': 'shizhan',
  project: 'xiangmushizhan',
  vip: 'huiyuan'
} as const

// 英文 → 中文映射（用于SEO）
export const STAGE_TO_CHINESE: Record<CourseCardTemplate, string> = {
  free: '免费',
  beginner: '入门',
  advanced: '进阶',
  'hands-on': '实战',
  project: '项目落地',
  vip: '会员专享'
} as const

/**
 * 标准化阶段值（智能转换）
 * @param stage - 可能是拼音、英文或中文
 * @returns 标准英文格式
 */
export function normalizeStage(stage: string): CourseCardTemplate {
  // 如果已经是英文格式，直接返回
  if (stage in ENGLISH_TO_PINYIN) {
    return stage as CourseCardTemplate
  }

  // 如果是拼音格式，转换为英文
  if (stage in PINYIN_TO_ENGLISH) {
    return PINYIN_TO_ENGLISH[stage]
  }

  // 默认返回free
  console.warn(`未知的stage值: ${stage}，默认使用'free'`)
  return 'free'
}

/**
 * 生成SEO友好的阶段标签
 * @param stage - 英文阶段标识
 * @returns 中文显示名称
 */
export function getStageLabelForSEO(stage: CourseCardTemplate): string {
  return STAGE_TO_CHINESE[stage]
}
