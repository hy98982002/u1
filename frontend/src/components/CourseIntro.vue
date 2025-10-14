<!-- CourseIntro.vue - 课程介绍组件 -->
<template>
  <div class="bg-white rounded p-3 p-md-4 shadow-sm course-intro">
    <section aria-labelledby="course-value-heading" class="mb-4">
      <h4 id="course-value-heading" class="h4 mb-3">本课程您将会学到的核心技能与实用设计能力</h4>
      <div class="row g-3">
        <article
          v-for="(point, index) in valuePoints"
          :key="`value-${index}`"
          class="col-12 col-md-4"
        >
          <div class="h-100 rounded-3 border border-light-subtle p-3 p-lg-4">
            <h6 class="fw-semibold text-primary mb-2">{{ point.title }}</h6>
            <p class="mb-0 text-body-secondary">{{ point.description }}</p>
          </div>
        </article>
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
  description: string
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
  courseName: 'Unity数字孪生实战营',
  summaries: () => [
    '《Unity数字孪生实战营》以 4 周项目式训练帮助你在 Unity 2022 LTS 中搭建城市级实时 3D 场景，快速掌握数字孪生的完整开发链路。',
    '课程将 Unity 引擎、C# 脚本、数据可视化与行业案例整合，确保学习成果能够直接用于智慧城市、工业仿真与元宇宙互动体验。'
  ],
  targetAudience: () => [
    '希望从零转型实时 3D / 数字孪生岗位的开发者',
    '在校计算机、建筑、规划等专业学生，准备参加相关竞赛或就业',
    '传统制造、园区运营团队，需要快速评估数字孪生方案可行性的负责人',
    '已具备 Unity 基础，想补齐数据驱动场景与部署流程的进阶学习者'
  ],
  valuePoints: () => [
    {
      title: '模块化进阶路径',
      description:
        '从场景搭建、交互逻辑到数据联动分成四大阶段，每周输出可交付 Demo，帮助团队快速验证业务设想。'
    },
    {
      title: '行业级实战案例',
      description:
        '以智慧园区数字孪生为主线，覆盖 IoT 数据接入、状态告警与可视化驾驶舱，贴近甲方真实需求。'
    },
    {
      title: '可落地工具链',
      description:
        '提供项目脚手架、性能优化清单与部署指南，降低从学习到上线的门槛，让成果可以直接用于投标或演示。'
    }
  ],
  callToAction:
    '立即报名加入《Unity数字孪生实战营》，预约开班后即可获得预习资料包、班主任跟进以及专属答疑群，确保你在 28 天内交付一套可展示的数字孪生城市样板。',
  faqItems: () => [
    {
      question: '零基础可以学习这门课程吗？',
      answer:
        '课程在第一阶段提供 Unity 环境配置、界面操作与 C# 语法巩固，只要具备基本电脑操作能力即可快速上手。'
    },
    {
      question: '完成课程后能交付什么成果？',
      answer:
        '你将获得一套包含城市模型、数据看板和实时交互的数字孪生 Demo，可用于面试展示、客户演示或继续拓展为企业项目。'
    },
    {
      question: '是否提供项目复盘与就业辅导？',
      answer:
        '结课后班主任会安排一对一作品诊断，提供项目复盘文档模板，并给出针对数字孪生岗位的简历与面试建议。'
    }
  ]
})

const { summaries, targetAudience, valuePoints, callToAction, faqItems } = toRefs(props)
</script>

<style scoped>
.course-intro {
  border: 1px solid var(--bs-border-color-translucent);
}

.faq-list dt {
  font-size: 1rem;
}

.faq-list dd {
  margin-left: 0;
}
</style>
