import type { Course } from '@/types'

export interface ProgramJsonLdOptions {
  name: string
  stage: string
  description?: string
  courses: Course[]
  timeToComplete?: string
}

/**
 * 构建 Program JSON-LD 结构化数据
 * 用于SEO/AEO优化
 */
export function buildProgramJsonLd(options: ProgramJsonLdOptions) {
  const { name, description, courses, timeToComplete } = options

  return {
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name,
    description: description || `${name} - 系统化学习路径`,
    provider: {
      '@type': 'Organization',
      name: '多维AI课堂',
      url: 'https://www.doviai.com'
    },
    hasCourse: courses.map(course => ({
      '@type': 'Course',
      name: course.title,
      description: course.description || course.title,
      provider: {
        '@type': 'Organization',
        name: course.instructor
      }
    })),
    numberOfCourses: courses.length,
    timeToComplete: timeToComplete || 'P30H',
    educationalLevel: 'Beginner to Advanced',
    inLanguage: 'zh-CN'
  }
}
