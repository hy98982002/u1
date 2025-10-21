<!-- CourseCatalog.vue - 课程目录组件 -->
<template>
  <section class="bg-white rounded p-3">
    <h4 id="course-catalog-heading" class="mt-5 mb-3">课程目录</h4>
    <nav aria-labelledby="course-catalog-heading" class="catalog-wrapper">
      <ChapterItem
        v-for="(chapter, index) in chapters"
        :key="chapter.id"
        :chapter="chapter"
        @lesson-click="handleLessonClick"
      />
    </nav>
  </section>
</template>

<script setup lang="ts">
import ChapterItem from './ChapterItem.vue'

// 定义课程相关类型
type Lesson = {
  id: string
  title: string
  duration: string
  isFree: boolean
}

type Chapter = {
  id: string
  title: string
  lessonCount: number
  isExpanded?: boolean
  lessons: Lesson[]
}

interface Props {
  chapters?: Chapter[]
}

withDefaults(defineProps<Props>(), {
  chapters: () => [
    {
      id: 'resources',
      title: '课程相关资料',
      lessonCount: 2,
      isExpanded: true,
      lessons: [
        {
          id: 'group',
          title: '加入交流群',
          duration: '',
          isFree: true
        },
        {
          id: 'files',
          title: '课程相关文件',
          duration: '',
          isFree: true
        }
      ]
    },
    // 模块一：AI 设计基础与思维构建
    {
      id: 'chapter1',
      title: '第一章：Photoshop AI 工具面板与智能选区',
      lessonCount: 3,
      isExpanded: true,
      lessons: [
        {
          id: 'lesson1-1',
          title: '1.1 工具面板总览',
          duration: '0.3小时',
          isFree: true
        },
        {
          id: 'lesson1-2',
          title: '1.2 智能选区原理与实操',
          duration: '0.4小时',
          isFree: true
        },
        {
          id: 'lesson1-3',
          title: '1.3 生成式填充快速上手',
          duration: '0.5小时',
          isFree: true
        }
      ]
    },
    {
      id: 'chapter2',
      title: '第二章：AI 在视觉设计中的工作原理',
      lessonCount: 3,
      lessons: [
        {
          id: 'lesson2-1',
          title: '2.1 生成式图像算法基础',
          duration: '0.4小时',
          isFree: false
        },
        {
          id: 'lesson2-2',
          title: '2.2 AI 配色与构图策略',
          duration: '0.3小时',
          isFree: false
        },
        {
          id: 'lesson2-3',
          title: '2.3 视觉分层与信息对齐',
          duration: '0.3小时',
          isFree: false
        }
      ]
    },
    {
      id: 'chapter3',
      title: '第三章：AI 创意思维框架构建',
      lessonCount: 3,
      lessons: [
        {
          id: 'lesson3-1',
          title: '3.1 Prompt 思考模型',
          duration: '0.4小时',
          isFree: false
        },
        {
          id: 'lesson3-2',
          title: '3.2 灵感采集与脑图',
          duration: '0.3小时',
          isFree: false
        },
        {
          id: 'lesson3-3',
          title: '3.3 需求拆解方法',
          duration: '0.3小时',
          isFree: false
        }
      ]
    },
    // 模块二：AI 创意设计核心技能
    {
      id: 'chapter4',
      title: '第四章：生成式扩展与图像合成技术',
      lessonCount: 3,
      lessons: [
        {
          id: 'lesson4-1',
          title: '4.1 扩展原理概览',
          duration: '0.3小时',
          isFree: false
        },
        {
          id: 'lesson4-2',
          title: '4.2 内容识别填充深度应用',
          duration: '0.5小时',
          isFree: false
        },
        {
          id: 'lesson4-3',
          title: '4.3 多图合成与风格迁移',
          duration: '0.4小时',
          isFree: false
        }
      ]
    },
    {
      id: 'chapter5',
      title: '第五章：高效 Prompt 提示词编写',
      lessonCount: 3,
      lessons: [
        {
          id: 'lesson5-1',
          title: '5.1 Prompt 语法结构',
          duration: '0.4小时',
          isFree: false
        },
        {
          id: 'lesson5-2',
          title: '5.2 场景化关键词技巧',
          duration: '0.4小时',
          isFree: false
        },
        {
          id: 'lesson5-3',
          title: '5.3 Prompt 调优与批量生成',
          duration: '0.5小时',
          isFree: false
        }
      ]
    },
    {
      id: 'chapter6',
      title: '第六章：创意输出精度与商业价值提升',
      lessonCount: 3,
      lessons: [
        {
          id: 'lesson6-1',
          title: '6.1 超清输出与降噪',
          duration: '0.3小时',
          isFree: false
        },
        {
          id: 'lesson6-2',
          title: '6.2 品牌视觉规范',
          duration: '0.4小时',
          isFree: false
        },
        {
          id: 'lesson6-3',
          title: '6.3 成本计算与 ROI 评估',
          duration: '0.3小时',
          isFree: false
        }
      ]
    },
    // 模块三：实战案例与商业应用
    {
      id: 'chapter7',
      title: '第七章：品牌主视觉设计全流程',
      lessonCount: 3,
      lessons: [
        {
          id: 'lesson7-1',
          title: '7.1 品牌调研与定位',
          duration: '0.4小时',
          isFree: false
        },
        {
          id: 'lesson7-2',
          title: '7.2 LOGO 与核心元素生成',
          duration: '0.5小时',
          isFree: false
        },
        {
          id: 'lesson7-3',
          title: '7.3 品牌海报落地',
          duration: '0.5小时',
          isFree: false
        }
      ]
    },
    {
      id: 'chapter8',
      title: '第八章：电商与社媒广告图制作',
      lessonCount: 3,
      lessons: [
        {
          id: 'lesson8-1',
          title: '8.1 SKU 主图 AI 生成',
          duration: '0.4小时',
          isFree: false
        },
        {
          id: 'lesson8-2',
          title: '8.2 社媒封面与短视频封面',
          duration: '0.4小时',
          isFree: false
        },
        {
          id: 'lesson8-3',
          title: '8.3 数据驱动创意优化',
          duration: '0.3小时',
          isFree: false
        }
      ]
    },
    {
      id: 'chapter9',
      title: '第九章：全案交付与作品集包装',
      lessonCount: 3,
      lessons: [
        {
          id: 'lesson9-1',
          title: '9.1 需求对接与里程碑',
          duration: '0.3小时',
          isFree: false
        },
        {
          id: 'lesson9-2',
          title: '9.2 文件打包与交付标准',
          duration: '0.4小时',
          isFree: false
        },
        {
          id: 'lesson9-3',
          title: '9.3 作品集展示与客户验收',
          duration: '0.4小时',
          isFree: false
        }
      ]
    }
  ]
})

const handleLessonClick = (lesson: Lesson) => {
  console.log('课程点击：', lesson)
  // TODO: 处理课程点击事件
}
</script>

<style scoped>
.catalog-wrapper {
  /* 移除背景色，让每个章节卡片独立显示 */
}
</style>