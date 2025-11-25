// ============================================
// 课程三级体系 - 新版统一标准
// ============================================

// 课程阶段枚举 - 三级体系（basic / intermediate / advanced）
export const STAGES = {
  basic: '入门',
  intermediate: '进阶',
  advanced: '高阶'
} as const

export type StageKey = keyof typeof STAGES
export type StageValue = (typeof STAGES)[StageKey]

// 课程级别（与阶段同义，用于不同上下文）
export type LevelKey = StageKey

// 阶段样式映射 - 三级体系
export const STAGE_STYLES = {
  basic: { textClass: 'text-primary', bgClass: 'bg-primary-subtle', label: '入门' },
  intermediate: { textClass: 'text-info', bgClass: 'bg-info-subtle', label: '进阶' },
  advanced: { textClass: 'text-danger', bgClass: 'bg-danger-subtle', label: '高阶' }
} as const

// 旧字段到新体系的映射（供前端迁移使用）
export const LEGACY_STAGE_MAP: Record<string, StageKey> = {
  // 旧的英文标识符
  free: 'basic',
  basic: 'basic',
  advanced: 'intermediate',
  project: 'intermediate',
  landing: 'advanced',
  high: 'advanced',
  // 旧的中文标识符
  '免费': 'basic',
  '入门': 'basic',
  '精进': 'intermediate',
  '实战': 'intermediate',
  '项目落地': 'advanced',
  '高级': 'advanced'
} as const

// 课程卡片模板类型 - 使用英文标识符以支持SEO友好的URL
export type CourseCardTemplate =
  | 'free'
  | 'beginner'
  | 'advanced'
  | 'hands-on'
  | 'project'
  | 'vip'

// 课程卡片模板配置
export interface CourseCardConfig {
  level: string // 等级标签 (免费、入门、精进、实战等)
  priceRange: [number, number] // 价格范围 [最小值, 最大值]
  learnerRange: [number, number] // 学员数范围
  isFree: boolean // 是否免费
  isVip: boolean // 是否会员专享
  levelStyle: 'success' | 'primary' | 'info' | 'warning' | 'danger' // 等级标签样式
}

// 课程卡片模板映射
export const COURSE_CARD_TEMPLATES: Record<CourseCardTemplate, CourseCardConfig> = {
  free: {
    level: '免费',
    priceRange: [0, 0],
    learnerRange: [180, 280],
    isFree: true,
    isVip: false,
    levelStyle: 'success'
  },
  beginner: {
    level: '入门',
    priceRange: [99, 299],
    learnerRange: [120, 220],
    isFree: false,
    isVip: false,
    levelStyle: 'primary'
  },
  advanced: {
    level: '精进',
    priceRange: [199, 399],
    learnerRange: [100, 200],
    isFree: false,
    isVip: false,
    levelStyle: 'info'
  },
  'hands-on': {
    level: '实战',
    priceRange: [99, 199],
    learnerRange: [200, 400],
    isFree: false,
    isVip: false,
    levelStyle: 'warning'
  },
  project: {
    level: '项目实战',
    priceRange: [299, 599],
    learnerRange: [80, 150],
    isFree: false,
    isVip: false,
    levelStyle: 'danger'
  },
  vip: {
    level: '会员专享',
    priceRange: [0, 0],
    learnerRange: [50, 120],
    isFree: true,
    isVip: true,
    levelStyle: 'warning'
  }
}

// 从图片路径提取模板类型的函数
export function getTemplateFromImagePath(imagePath: string): CourseCardTemplate {
  const filename = imagePath.split('/').pop() || ''

  if (filename.startsWith('free-')) return 'free'
  if (filename.startsWith('beginner-')) return 'beginner'
  if (filename.startsWith('advanced-')) return 'advanced'
  if (filename.startsWith('hands-on-')) return 'hands-on'
  if (filename.startsWith('project-')) return 'project'
  if (filename.startsWith('vip-')) return 'vip'

  // 默认返回免费模板
  return 'free'
}

// 生成随机价格和学员数的工具函数
export function generateCourseData(template: CourseCardTemplate) {
  const config = COURSE_CARD_TEMPLATES[template]

  const price = config.isFree
    ? 0
    : Math.floor(Math.random() * (config.priceRange[1] - config.priceRange[0] + 1)) +
      config.priceRange[0]

  const learnerCount =
    Math.floor(Math.random() * (config.learnerRange[1] - config.learnerRange[0] + 1)) +
    config.learnerRange[0]

  return {
    level: config.level,
    price,
    learnerCount,
    isFree: config.isFree,
    isVip: config.isVip,
    levelStyle: config.levelStyle
  }
}

// 课程接口
export interface Course {
  id: number
  title: string
  slug: string // SEO友好的URL标识，如 "beginner-python"
  cover: string
  stage: StageKey
  camp?: 'skill' | 'career' | 'enterprise' // 营区归属
  tags: string[] // 子标签数组，用于过滤
  price?: number
  originalPrice?: number
  learnerCount?: number
  rating?: number
  reviewCount?: number
  duration?: string // 课程时长
  level?: string // 难度级别
  badge?: string // 课程徽章
  description?: string
  instructor?: string
  isHot?: boolean
  isFree?: boolean
  isVip?: boolean // 是否会员专享
  enrolled?: number // 兼容旧字段，等同于 learnerCount
}

// 教师接口
export interface Teacher {
  id: number
  name: string
  avatar: string
  title: string
  specialty: string
  experience: string
  description?: string
}

// 营区数据接口
export interface CampData {
  title: string
  subtitle: string
  stageOrder: StageKey[] // 该营区显示的阶段顺序
  courses: Course[]
}

// 子标签接口
export interface SubTag {
  id: string
  name: string
  isActive?: boolean
}

// 专区按钮接口
export interface ZoneButton {
  id: string
  name: string
  target: string
  isActive?: boolean
}

// 轮播图接口
export interface CarouselItem {
  id: number
  image: string
  title: string
  subtitle: string
  link?: string
}

// API响应接口
export interface ApiResponse<T = any> {
  status: number
  data: T
  msg: string
}

// 分页接口
export interface PaginationData<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// 筛选条件接口
export interface CourseFilter {
  stage?: StageKey
  camp?: string
  tags?: string[]
  search?: string
  minPrice?: number
  maxPrice?: number
  isFree?: boolean
}

// 导航菜单项接口
export interface NavMenuItem {
  id: string
  label: string
  href?: string
  children?: NavMenuItem[]
}

// 课程详情页相关类型定义
export interface Lesson {
  id: string
  title: string
  duration: string
  isFree?: boolean
  isCompleted?: boolean
}

export interface Chapter {
  id: string
  title: string
  lessonCount: number
  lessons: Lesson[]
  isExpanded?: boolean
}

export interface CourseInfo {
  title: string
  subtitle?: string // 副标题
  coverImage: string
  studyHeat?: number // 学习热度
  duration?: string // 课程时长（如：191分钟）
  discountPrice?: number // 折扣价
  originalPrice?: number // 原价
  discount?: number // 折扣百分比
  promotionEndTime?: Date // 促销结束时间
  difficulty?: string // 难度级别（向下兼容）
  updatedLessons?: number // 已更新课时数（向下兼容）
  isFree: boolean
  price?: number // 基础价格（向下兼容）
}

export interface Review {
  id: string
  userName: string
  userAvatar: string
  rating: number
  content: string
  date: string
}

export interface BreadcrumbItem {
  title: string
  href?: string
  path?: string
}

// ============================================
// JSON-LD 五维 Schema 类型定义
// ============================================

// 1. Level（教育层级）- DefinedTerm 类型
export interface EducationalLevelTerm {
  '@type': 'DefinedTerm'
  name: string // 如："Beginner" / "Intermediate" / "Advanced"
  inDefinedTermSet: string // 如："https://www.doviai.com/levels"
  description?: string
}

// 2. Type（课程类型）- LRMI教学用途
export type EducationalUse =
  | 'Lecture' // 讲授
  | 'Demonstration' // 演示
  | 'Exercise' // 练习
  | 'Introduction' // 导入
  | 'Lesson' // 课时
  | 'Practice' // 技能练习
  | 'Project' // 综合项目
  | 'CaseStudy' // 商业案例
  | 'Simulation' // 模拟场景
  | 'Curriculum' // 课程路径
  | 'Unit' // 子模块
  | 'ProfessionalDevelopment' // 职业发展

// 3. Access（访问属性）
export interface CourseAccess {
  offers: CourseOffer
  audience?: EducationalAudience
  courseMode: 'Online' | 'Offline' | 'Hybrid'
}

export interface CourseOffer {
  '@type': 'Offer'
  price: string | number
  priceCurrency: 'CNY' | 'USD'
  availability: string // Schema.org 库存状态 URL
  validFrom?: string
  validThrough?: string
}

export interface EducationalAudience {
  '@type': 'EducationalAudience'
  audienceType: string // 如："会员专区" / "公开课程"
}

// 4. Outcome（学习结果）
export type LearningOutcome = string[] // 学习成果列表

// 5. Pathway（学习路径）
export interface CoursePathway {
  isPartOf?: ProgramReference // 课程所属的体系
  hasPart?: CourseReference[] // 体系包含的课程列表（用于Program页面）
}

export interface ProgramReference {
  '@type': 'EducationalOccupationalProgram'
  '@id'?: string
  name: string
  url?: string
  description?: string
}

export interface CourseReference {
  '@type': 'Course'
  '@id'?: string
  name: string
  url: string
  description?: string
}

// 完整的课程 JSON-LD 结构
export interface CourseJsonLd {
  '@context': 'https://schema.org'
  '@type': 'Course'
  '@id'?: string
  name: string
  description?: string
  provider: {
    '@type': 'Organization'
    name: string
    url: string
  }
  // 五维字段
  educationalLevel?: EducationalLevelTerm // Level
  about?: string // Type - 主题领域
  educationalUse?: EducationalUse[] // Type - 教学用途
  offers?: CourseOffer // Access
  audience?: EducationalAudience // Access
  courseMode?: string // Access
  learningOutcome?: LearningOutcome // Outcome
  isPartOf?: ProgramReference // Pathway
  // 其他标准字段
  inLanguage?: string
  keywords?: string
  image?: string
  hasCourseSection?: any[]
}

// Program（体系课）JSON-LD 结构
export interface ProgramJsonLd {
  '@context': 'https://schema.org'
  '@type': 'EducationalOccupationalProgram'
  '@id'?: string
  name: string
  description?: string
  provider: {
    '@type': 'Organization'
    name: string
    url: string
  }
  educationalLevel?: EducationalLevelTerm
  educationalUse?: EducationalUse[]
  hasCourse?: CourseReference[] // Pathway - 包含的课程列表
  offers?: CourseOffer
  timeToComplete?: string
  occupationalCategory?: string
}
