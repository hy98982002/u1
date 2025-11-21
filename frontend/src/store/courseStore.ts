import { defineStore } from 'pinia'
import type { Course, StageKey } from '../types'
import { generateCourseSlug } from '@/utils/slug'

// 导入图片资源
import freeunrealCover from '@/assets/images/courses/free-unreal-cover-480.webp'
import freePhotoshopCover from '@/assets/images/courses/free-photoshop-cover-480.webp'
import beginnerPythonCover from '@/assets/images/courses/beginner-python-cover-480.webp'
import beginnerunrealCover from '@/assets/images/courses/beginner-unreal-cover-480.webp'
import beginnerPhotoshopCover from '@/assets/images/courses/beginner-photoshop-cover-480.webp'
import advancedPythonCover from '@/assets/images/courses/advanced-python-cover-480.webp'
import advancedunrealCover from '@/assets/images/courses/advanced-unreal-cover-480.webp'
import advancedPhotoshopCover from '@/assets/images/courses/advanced-photoshop-cover-480.webp'

export const useCourseStore = defineStore('course', {
  state: () => ({
    courses: [
      {
        id: 1,
        title: 'Photoshop AI设计技能体验课：从小白到高手',
        slug: generateCourseSlug('free', 'Photoshop'),
        description: '零基础入门Photoshop编程',
        price: 0,
        stage: 'free',
        cover: freePhotoshopCover,
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
        slug: generateCourseSlug('free', 'Illustrator'),
        description: '零基础入门Illustrator设计',
        price: 0,
        stage: 'free',
        cover: freeunrealCover,
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
        slug: generateCourseSlug('free', 'Photoshop Advanced'),
        description: 'PS图像处理基础入门',
        price: 0,
        stage: 'free',
        cover: freePhotoshopCover,
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
        slug: generateCourseSlug('basic', 'Python'),
        description: 'Python编程基础知识',
        price: 199,
        stage: 'basic',
        cover: beginnerPythonCover,
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
        slug: generateCourseSlug('basic', 'illustrator'),
        description: 'illustrator核心概念',
        price: 299,
        stage: 'basic',
        cover: beginnerPythonCover,
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
        slug: generateCourseSlug('basic', 'Unreal Engine'),
        description: '虚幻引擎基础开发',
        price: 299,
        stage: 'basic',
        cover: beginnerunrealCover,
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
        slug: generateCourseSlug('basic', 'Photoshop'),
        description: 'PS图像处理基础技巧',
        price: 199,
        stage: 'basic',
        cover: beginnerPhotoshopCover,
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
        slug: generateCourseSlug('advanced', 'Python'),
        description: 'Python高级编程技巧',
        price: 599,
        stage: 'advanced',
        cover: advancedPythonCover,
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
        slug: generateCourseSlug('advanced', 'logo Analysis'),
        description: 'Python数据处理与分析',
        price: 699,
        stage: 'advanced',
        cover: advancedPythonCover,
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
        slug: generateCourseSlug('advanced', 'Unreal Engine'),
        description: '虚幻引擎高级开发技巧',
        price: 699,
        stage: 'advanced',
        cover: advancedunrealCover,
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
        slug: generateCourseSlug('advanced', 'Photoshop Scene'),
        description: 'PS高级图像处理技巧',
        price: 499,
        stage: 'advanced',
        cover: advancedPhotoshopCover,
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
        slug: generateCourseSlug('advanced', 'Python Web'),
        description: 'Python Web应用开发',
        price: 799,
        stage: 'advanced',
        cover: advancedPythonCover,
        tags: ['Python', 'Web', 'Django'],
        rating: 4.5,
        enrolled: 400,
        duration: '50小时',
        level: '中级',
        instructor: '张老师'
      }
    ] as Course[],
    currentStage: 'free' as StageKey,
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
      // @ts-ignore
      this.currentStage = stage
    },
    toggleTag(tag: string) {
      // @ts-ignore
      // 单选模式：如果点击的是已选中的标签，则取消选择；否则选择新标签
      if (this.selectedTags.includes(tag)) {
        this.selectedTags = []
      } else {
        this.selectedTags = [tag]
      }
    },
    setShowVipOnly(vip: boolean) {
      // @ts-ignore
      this.showVipOnly = vip
    }
  }
})
