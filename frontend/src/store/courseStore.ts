import { defineStore } from 'pinia'
import type { Course, StageKey } from '../types'
import { generateCourseSlug } from '@/utils/slug'

// 导入图片资源（新三级体系命名：basic / intermediate / advanced）
import photoshopBasicCover from '@/assets/images/courses/photoshop-basic-cover-480.webp'
import pythonBasicCover from '@/assets/images/courses/python-basic-cover-480.webp'
import unrealBasicCover from '@/assets/images/courses/unreal-basic-cover-480.webp'
import photoshopIntermediateCover from '@/assets/images/courses/photoshop-intermediate-cover-480.webp'
import pythonIntermediateCover from '@/assets/images/courses/python-intermediate-cover-480.webp'
import unrealIntermediateCover from '@/assets/images/courses/unreal-intermediate-cover-480.webp'

// Mock课程数据（新三级体系：basic / intermediate / advanced）
const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Photoshop AI设计技能体验课：从小白到高手',
    slug: 'photoshop-ai-design-basic',
    description: '零基础入门Photoshop编程',
    price: 0,
    stage: 'basic',
    cover: photoshopBasicCover,
    tags: ['PhotoshopAI', 'AIGC', 'AI+logo'],
    rating: 4.5,
    enrolled: 1200,
    duration: '2小时',
    level: '入门',
    instructor: '张老师'
  },
  {
    id: 2,
    title: 'Illustrator设计技能体验课：从小白到高手',
    slug: 'illustrator-design-basic',
    description: '零基础入门Illustrator设计',
    price: 0,
    stage: 'basic',
    cover: unrealBasicCover,
    tags: ['Illustrator', 'AIGC', 'AI+logo'],
    rating: 4.3,
    enrolled: 800,
    duration: '2小时',
    level: '入门',
    instructor: '李老师'
  },
  {
    id: 3,
    title: 'Photoshop体验课',
    slug: 'photoshop-basic',
    description: 'PS图像处理基础入门',
    price: 0,
    stage: 'basic',
    cover: photoshopBasicCover,
    tags: ['Photoshop', '图像处理', '入门', 'AI+logo'],
    rating: 4.7,
    enrolled: 1500,
    duration: '2小时',
    level: '入门',
    instructor: '王老师'
  },
  {
    id: 4,
    title: 'Python入门课程',
    slug: 'python-basic',
    description: 'Python编程基础知识',
    price: 199,
    stage: 'basic',
    cover: pythonBasicCover,
    tags: ['Python', '基础', '入门'],
    rating: 4.6,
    enrolled: 2000,
    duration: '20小时',
    level: '初级',
    instructor: '张老师'
  },
  {
    id: 5,
    title: 'illustrator基础课程',
    slug: 'illustrator-basic',
    description: 'illustrator核心概念',
    price: 299,
    stage: 'basic',
    cover: pythonBasicCover,
    tags: ['illustrator', 'logo设计', 'AIGC', 'AIGC+logo'],
    rating: 4.8,
    enrolled: 1800,
    duration: '30小时',
    level: '初级',
    instructor: '张老师'
  },
  {
    id: 6,
    title: '虚幻引擎入门课程',
    slug: 'unreal-engine-basic',
    description: '虚幻引擎基础开发',
    price: 299,
    stage: 'basic',
    cover: unrealBasicCover,
    tags: ['UE', '基础', '入门'],
    rating: 4.4,
    enrolled: 1200,
    duration: '25小时',
    level: '初级',
    instructor: '李老师'
  },
  {
    id: 7,
    title: 'Photoshop入门课程',
    slug: 'photoshop-intro-basic',
    description: 'PS图像处理基础技巧',
    price: 199,
    stage: 'basic',
    cover: photoshopBasicCover,
    tags: ['Photoshop', 'AIGC', '入门', 'AI+logo'],
    rating: 4.5,
    enrolled: 1600,
    duration: '15小时',
    level: '初级',
    instructor: '王老师'
  },
  {
    id: 8,
    title: 'Python进阶课程',
    slug: 'python-intermediate',
    description: 'Python高级编程技巧',
    price: 599,
    stage: 'intermediate',
    cover: pythonIntermediateCover,
    tags: ['Python', '高级', '进阶'],
    rating: 4.9,
    enrolled: 800,
    duration: '40小时',
    level: '中级',
    instructor: '张老师'
  },
  {
    id: 9,
    title: 'logo分析',
    slug: 'logo-analysis-intermediate',
    description: 'Python数据处理与分析',
    price: 699,
    stage: 'intermediate',
    cover: pythonIntermediateCover,
    tags: ['illustrator', 'logo设计', 'AIGC'],
    rating: 4.7,
    enrolled: 600,
    duration: '35小时',
    level: '中级',
    instructor: '张老师'
  },
  {
    id: 10,
    title: '虚幻引擎进阶课程',
    slug: 'unreal-engine-intermediate',
    description: '虚幻引擎高级开发技巧',
    price: 699,
    stage: 'intermediate',
    cover: unrealIntermediateCover,
    tags: ['UE', '游戏开发', 'AIGC'],
    rating: 4.6,
    enrolled: 500,
    duration: '45小时',
    level: '中级',
    instructor: '李老师'
  },
  {
    id: 11,
    title: 'Photoshop场景环境课程',
    slug: 'photoshop-environment-intermediate',
    description: 'PS高级图像处理技巧',
    price: 499,
    stage: 'intermediate',
    cover: photoshopIntermediateCover,
    tags: ['Photoshop', 'AIGC', '场景设计'],
    rating: 4.8,
    enrolled: 700,
    duration: '30小时',
    level: '中级',
    instructor: '王老师'
  },
  {
    id: 12,
    title: 'Python Web开发',
    slug: 'python-web-intermediate',
    description: 'Python Web应用开发',
    price: 799,
    stage: 'intermediate',
    cover: pythonIntermediateCover,
    tags: ['Python', 'Web', 'Django'],
    rating: 4.5,
    enrolled: 400,
    duration: '50小时',
    level: '中级',
    instructor: '张老师'
  }
]

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: mockCourses, // 直接使用新三级体系的课程数据
    currentStage: 'basic' as StageKey, // 默认阶段：basic（入门基础）
    selectedTags: [] as string[],
    showVipOnly: false,
    searchKeyword: ''
  }),
  getters: {
    getCoursesByStage: state => (stage: string) => state.courses.filter(c => c.stage === stage),
    getCourseBySlug: state => (slug: string) => state.courses.find(c => c.slug === slug),
    filteredCourses: state => {
      let result = state.courses
      if (state.showVipOnly) {
        result = result.filter(c => c.isVip)
      } else if (state.currentStage) {
        result = result.filter(c => c.stage === state.currentStage)
      }
      if (state.selectedTags.length) {
        result = result.filter(c => c.tags && c.tags.some(t => state.selectedTags.includes(t)))
      }
      if (state.searchKeyword) {
        const k = state.searchKeyword.toLowerCase()
        result = result.filter(c => c.title.toLowerCase().includes(k))
      }
      return result
    },
    popularTags: state => {
      // 手动指定热门技术标签列表，可以根据需要添加、删除或修改
      return ['AIGC', 'PhotoshopAI', 'AI+logo', 'UE', '项目', '设计', '插画', 'Web', 'Django']
    }
  },
  actions: {
    setCurrentStageOnly(stage: StageKey) {
      this.currentStage = stage
    },
    toggleTag(tag: string) {
      // 单选模式：如果点击的是已选中的标签，则取消选择；否则选择新标签
      if (this.selectedTags.includes(tag)) {
        this.selectedTags = []
      } else {
        this.selectedTags = [tag]
      }
    },
    setShowVipOnly(vip: boolean) {
      this.showVipOnly = vip
    }
  }
})
