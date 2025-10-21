<!-- CourseIntro.vue - 课程介绍组件 -->
<template>
  <div class="bg-white rounded p-3 p-md-4 shadow-sm course-intro">
    <section aria-labelledby="course-value-heading" class="mb-4 course-module">
      <h2 id="course-value-heading" class="h4 mb-3 text-dark">
        本课程您将会学到的核心技能与实用设计能力
      </h2>
      <div class="row g-4">
        <article
          v-for="(point, index) in valuePoints"
          :key="`value-${index}`"
          class="col-12 col-md-4"
        >
          <section :aria-label="point.title + '技能详情'" class="h-100 rounded-4 border border-light-subtle p-4 bg-white shadow-sm hover-lift">
            <h5 class="fw-semibold text-primary mb-3">{{ point.title }}</h5>
            <ul class="list-unstyled mb-0">
              <li
                v-for="(item, idx) in point.skills"
                :key="`skill-${idx}`"
                class="d-flex align-items-start gap-2 mb-2"
              >
                <span class="text-success fs-5 lh-1">✓</span>
                <span class="text-body-secondary lh-lg">{{ item }}</span>
              </li>
            </ul>
          </section>
        </article>
      </div>

      <!-- SEO优化总结段落 -->
      <div
        class="value-summary mt-4 p-4 bg-light rounded-4 border border-primary border-opacity-10"
      >
        <p class="mb-0 text-body-secondary lh-lg">
          通过本课程的系统学习，您不仅能快速掌握 Photoshop 中的 AI
          创意设计工具，还将具备独立完成商业视觉项目的全流程能力。从品牌海报到社交媒体视觉方案，从创意构想到高效落地，本课程将为您迈向专业设计师之路奠定坚实基础。
        </p>
      </div>
    </section>
    <section aria-labelledby="course-summary-heading" class="mb-4">
      <h4 id="course-summary-heading" class="h4 mb-3">课程概要</h4>
      <p
        v-for="(paragraph, index) in summaries"
        :key="`summary-${index}`"
        class="mb-2 text-body-secondary"
      >
        {{ paragraph }}
      </p>
    </section>

    <section aria-labelledby="course-audience-heading" class="mb-4">
      <h5 id="course-audience-heading" class="h5 mb-3">适合人群</h5>
      <ul class="list-unstyled row row-cols-1 row-cols-md-2 g-2">
        <li v-for="(audience, index) in targetAudience" :key="`audience-${index}`" class="col">
          <div class="d-flex align-items-start gap-2">
            <span class="badge rounded-pill text-bg-info mt-1">{{ index + 1 }}</span>
            <span class="text-body-secondary">{{ audience }}</span>
          </div>
        </li>
      </ul>
    </section>

    <section aria-labelledby="course-cta-heading" class="mb-5">
      <h5 id="course-cta-heading" class="h5 mb-3">学习路径与行动</h5>
      <p class="mb-0 text-body-secondary">{{ callToAction }}</p>
    </section>

    <section id="course-faq" aria-labelledby="course-faq-heading" class="border-top pt-4">
      <h5 id="course-faq-heading" class="h5 mb-3">常见问题（FAQ）</h5>
      <dl class="faq-list mb-0">
        <div v-for="(faq, index) in faqItems" :key="`faq-${index}`" class="mb-3">
          <dt class="fw-semibold text-dark">{{ faq.question }}</dt>
          <dd class="mb-0 text-body-secondary">{{ faq.answer }}</dd>
        </div>
      </dl>
    </section>
  </div>
</template>

<script setup lang="ts">
import { toRefs } from 'vue'

interface ValuePoint {
  title: string
  skills: string[]
}

interface FAQItem {
  question: string
  answer: string
}

interface Props {
  courseName?: string
  summaries?: string[]
  targetAudience?: string[]
  valuePoints?: ValuePoint[]
  callToAction?: string
  faqItems?: FAQItem[]
}

const props = withDefaults(defineProps<Props>(), {
  courseName: 'Photoshop AI设计技能体验课：从小白到高手',
  summaries: () => [
    '《Photoshop AI设计技能体验课》以实战为导向，帮助你快速掌握Photoshop中的AI设计工具与功能，让创意设计变得简单高效。',
    '课程将AI生成式设计理念、Photoshop最新功能与商业设计需求相结合，确保你能在短时间内将所学应用于实际项目中。'
  ],
  targetAudience: () => [
    '对设计感兴趣的零基础学习者，希望快速掌握AI辅助设计技能',
    '传统设计师，想提升工作效率，学习最新AI设计工具',
    '电商、新媒体从业者，需要独立完成产品图、宣传图设计',
    '营销人员，希望能够自己动手快速制作营销素材'
  ],
  valuePoints: () => [
    {
      title: 'AI设计基础与思维构建',
      skills: [
        '掌握 Photoshop 中 AI 工具面板、智能选区与生成式填充的使用方法',
        '理解 AI 在视觉设计中的工作原理',
        '构建 AI 创意设计思维框架'
      ]
    },
    {
      title: 'AI创意设计核心技能',
      skills: [
        '学会利用生成式扩展、内容识别和 AI 图像合成技术快速完成创意设计',
        '掌握 Prompt 提示词编写方法',
        '提升设计结果的精准度和商业价值'
      ]
    },
    {
      title: '实战案例与商业应用',
      skills: [
        '从 0 到 1 完成品牌主视觉设计、海报构思与产品图制作',
        '掌握 AI 设计在广告、电商、社交媒体等商业场景中的应用策略',
        '独立交付完整设计项目'
      ]
    }
  ],
  callToAction:
    '立即报名加入《Photoshop AI设计技能体验课》，即可获得AI设计资源包、素材模板库以及专属学习社群，让你在短时间内从设计小白快速成长为能够独立完成商业设计项目的AI设计师。',
  faqItems: () => [
    {
      question: '零基础可以学习这门课程吗？',
      answer:
        '完全可以！课程从基础操作开始，逐步讲解Photoshop界面和AI工具使用，只要会基本电脑操作，就能跟随课程学习。'
    },
    {
      question: '学习本课程需要安装什么软件？',
      answer:
        '建议安装Photoshop 2023或更高版本，以获得完整的AI功能体验。课程也会提供软件安装和配置的指导。'
    },
    {
      question: '完成课程后能达到什么水平？',
      answer:
        '完成课程后，你将能够独立使用Photoshop AI功能完成创意设计、图片优化、海报制作等工作，满足大多数商业场景的设计需求。'
    },
    {
      question: '课程内容是否会随AI技术更新？',
      answer:
        '是的，我们会定期更新课程内容，确保涵盖最新的Photoshop AI功能和设计趋势，购买后可免费学习更新内容。'
    }
  ]
})

const { summaries, targetAudience, valuePoints, callToAction, faqItems } = toRefs(props)
</script>

<style scoped>
.course-intro {
  border: 1px solid var(--bs-border-color-translucent);
}

/* 苹果HIG风格：悬停提升效果 */
/*
.hover-lift {
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12) !important;
}
*/

/* 技能列表项优化 */
.hover-lift li:last-child {
  margin-bottom: 0 !important;
}

/* 总结段落优化 */
.value-summary {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.faq-list dt {
  font-size: 1rem;
}

.faq-list dd {
  margin-left: 0;
}
/* 你将学到 */
#course-value-heading {
  font-weight: 400; /* 字重，值可以是：normal(400), bold(700), 或100-900之间的数值 */
  color: #333333; /* 颜色，使用十六进制色值、RGB或颜色名称 */
}
</style>
