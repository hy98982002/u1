// stageMap.ts
// 课程阶段映射工具 - 统一管理旧→新体系的转换和UI展示

import { STAGES, LEGACY_STAGE_MAP, type StageKey } from '@/types'

/**
 * 将旧的stage字段映射为新的三级体系
 * @param oldStage 旧的stage标识符（可能是英文或中文）
 * @returns 新的StageKey (basic / intermediate / advanced)
 */
export function mapOldStageToNew(oldStage: string): StageKey {
  // 先转换为小写进行匹配
  const normalized = oldStage.toLowerCase().trim()

  // 尝试从映射表中查找
  if (normalized in LEGACY_STAGE_MAP) {
    return LEGACY_STAGE_MAP[normalized as keyof typeof LEGACY_STAGE_MAP]
  }

  // 如果找不到映射，尝试直接匹配新体系
  if (normalized === 'basic' || normalized === 'intermediate' || normalized === 'advanced') {
    return normalized as StageKey
  }

  // 兜底：默认返回 basic
  console.warn(`未知的stage值: "${oldStage}", 默认映射到 "basic"`)
  return 'basic'
}

/**
 * 获取stage的中文显示标签
 * @param stage StageKey
 * @returns 中文标签
 */
export function getStageLabel(stage: StageKey): string {
  return STAGES[stage]
}

/**
 * 获取stage的英文slug标识符（用于URL）
 * @param stage StageKey
 * @returns 英文slug (beginner / intermediate / advanced)
 */
export function getStageSlug(stage: StageKey): string {
  const slugMap: Record<StageKey, string> = {
    basic: 'beginner',
    intermediate: 'intermediate',
    advanced: 'advanced'
  }
  return slugMap[stage]
}

/**
 * 从slug还原为StageKey
 * @param slug URL中的slug (beginner / intermediate / advanced)
 * @returns StageKey
 */
export function slugToStageKey(slug: string): StageKey {
  const reverseMap: Record<string, StageKey> = {
    beginner: 'basic',
    intermediate: 'intermediate',
    advanced: 'advanced'
  }
  return reverseMap[slug.toLowerCase()] || 'basic'
}

/**
 * 获取stage的样式类名
 * @param stage StageKey
 * @returns Bootstrap样式对象
 */
export function getStageStyle(stage: StageKey) {
  const styleMap = {
    basic: { textClass: 'text-primary', bgClass: 'bg-primary-subtle' },
    intermediate: { textClass: 'text-info', bgClass: 'bg-info-subtle' },
    advanced: { textClass: 'text-danger', bgClass: 'bg-danger-subtle' }
  }
  return styleMap[stage]
}

/**
 * 批量迁移课程数据的stage字段
 * @param courses 课程数组
 * @returns 迁移后的课程数组和统计信息
 */
export function migrateCourseStages<T extends { stage: string }>(courses: T[]) {
  const stats = {
    total: courses.length,
    migrated: 0,
    unchanged: 0,
    mapping: {} as Record<string, number>
  }

  const migratedCourses = courses.map(course => {
    const oldStage = course.stage
    const newStage = mapOldStageToNew(oldStage)

    // 统计
    if (oldStage !== newStage) {
      stats.migrated++
      stats.mapping[`${oldStage} → ${newStage}`] =
        (stats.mapping[`${oldStage} → ${newStage}`] || 0) + 1
    } else {
      stats.unchanged++
    }

    return {
      ...course,
      stage: newStage
    }
  })

  return { courses: migratedCourses, stats }
}

// 导出便捷的默认对象
export default {
  mapOldStageToNew,
  getStageLabel,
  getStageSlug,
  slugToStageKey,
  getStageStyle,
  migrateCourseStages
}
