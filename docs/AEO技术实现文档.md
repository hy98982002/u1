# AEO技术实现文档

## 文档概述

本文档提供UAI教育平台在Vue 3 + Django架构下实现AEO（Answer Engine Optimization）的完整技术方案，涵盖大陆地区和海外地区的答案引擎优化实现。

## 技术栈概述

- **前端**: Vue 3 + Composition API + TypeScript + Vite
- **后端**: Django 5.2 + Django REST Framework + MySQL 8.4+
- **部署**: 阿里云 (国内) + AWS/Vercel (海外)
- **CDN**: 阿里云CDN + CloudFlare

## 1. 结构化数据实现

### 1.1 Schema.org 集成

**Vue组件实现**

```typescript
// src/composables/useStructuredData.ts
import { ref, computed } from 'vue'

interface FAQItem {
  question: string
  answer: string
  category?: string
}

interface CourseSchema {
  name: string
  description: string
  provider: string
  educationalLevel: string
  duration: string
  price: number
  currency: string
}

export const useStructuredData = () => {
  const insertJsonLd = (data: Record<string, any>) => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.textContent = JSON.stringify(data)
    document.head.appendChild(script)
  }

  const createFAQSchema = (faqs: FAQItem[]) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqs.map(faq => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    }
  }

  const createCourseSchema = (course: CourseSchema) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'Course',
      name: course.name,
      description: course.description,
      provider: {
        '@type': 'Organization',
        name: course.provider,
        url: 'https://uaiedu.com'
      },
      educationalLevel: course.educationalLevel,
      timeRequired: course.duration,
      offers: {
        '@type': 'Offer',
        price: course.price,
        priceCurrency: course.currency
      }
    }
  }

  const createHowToSchema = (title: string, steps: string[]) => {
    return {
      '@context': 'https://schema.org',
      '@type': 'HowTo',
      name: title,
      step: steps.map((step, index) => ({
        '@type': 'HowToStep',
        position: index + 1,
        text: step
      }))
    }
  }

  return {
    insertJsonLd,
    createFAQSchema,
    createCourseSchema,
    createHowToSchema
  }
}
```

### 1.2 Django 结构化数据生成器

```python
# apps/seo/models.py
from django.db import models
from django.urls import reverse
import json

class FAQManager(models.Manager):
    def get_by_category(self, category):
        return self.filter(category=category, is_active=True).order_by('order')
    
    def get_schema_data(self, category=None):
        """生成FAQ的Schema.org数据"""
        queryset = self.get_by_category(category) if category else self.filter(is_active=True)
        return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
                {
                    '@type': 'Question',
                    'name': faq.question,
                    'acceptedAnswer': {
                        '@type': 'Answer',
                        'text': faq.answer
                    }
                } for faq in queryset
            ]
        }

class FAQ(models.Model):
    CATEGORY_CHOICES = [
        ('course', '课程相关'),
        ('payment', '付费相关'),
        ('technical', '技术问题'),
        ('career', '职业发展'),
    ]
    
    question = models.TextField(verbose_name='问题')
    answer = models.TextField(verbose_name='答案')
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    order = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    
    # AEO优化字段
    search_keywords = models.TextField(help_text='相关搜索关键词，逗号分隔')
    ai_context = models.TextField(help_text='AI理解上下文', blank=True)
    
    objects = FAQManager()
    
    class Meta:
        ordering = ['category', 'order']
        
    def __str__(self):
        return f"{self.get_category_display()}: {self.question[:50]}"
```

```python
# apps/seo/serializers.py
from rest_framework import serializers
from .models import FAQ

class FAQSchemaSerializer(serializers.ModelSerializer):
    """专门用于生成Schema.org数据的序列化器"""
    
    class Meta:
        model = FAQ
        fields = ['question', 'answer', 'category']
    
    def to_representation(self, instance):
        return {
            '@type': 'Question',
            'name': instance.question,
            'acceptedAnswer': {
                '@type': 'Answer',
                'text': instance.answer
            }
        }

class FAQPageSerializer(serializers.Serializer):
    """FAQ页面的完整Schema.org数据"""
    category = serializers.CharField(required=False)
    
    def to_representation(self, instance):
        category = self.context.get('category')
        faqs = FAQ.objects.get_by_category(category) if category else FAQ.objects.filter(is_active=True)
        
        return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
                FAQSchemaSerializer(faq).data for faq in faqs
            ]
        }
```

## 2. AEO内容生成系统

### 2.1 问答内容管理

**Vue组件 - FAQ管理**

```vue
<!-- src/components/seo/FAQGenerator.vue -->
<template>
  <div class="faq-generator">
    <div class="content-input">
      <h3>AEO内容生成器</h3>
      
      <!-- 关键词输入 -->
      <div class="form-group">
        <label>目标关键词</label>
        <input 
          v-model="targetKeyword" 
          placeholder="例如：AI设计师培训"
          @input="generateSuggestions"
        >
      </div>
      
      <!-- 地区选择 -->
      <div class="form-group">
        <label>目标地区</label>
        <select v-model="targetRegion">
          <option value="mainland">大陆地区</option>
          <option value="overseas">海外地区</option>
          <option value="both">双语版本</option>
        </select>
      </div>
      
      <!-- AI平台选择 -->
      <div class="form-group">
        <label>目标AI平台</label>
        <div class="platform-checkboxes">
          <label v-for="platform in platforms" :key="platform.id">
            <input 
              type="checkbox" 
              v-model="selectedPlatforms" 
              :value="platform.id"
            >
            {{ platform.name }}
          </label>
        </div>
      </div>
      
      <!-- 生成的问答对 -->
      <div class="generated-qa" v-if="generatedQA.length">
        <h4>生成的问答内容</h4>
        <div 
          v-for="(qa, index) in generatedQA" 
          :key="index" 
          class="qa-item"
        >
          <div class="question">
            <strong>Q:</strong> {{ qa.question }}
          </div>
          <div class="answer">
            <strong>A:</strong> {{ qa.answer }}
          </div>
          <div class="metadata">
            <span class="platforms">适用平台: {{ qa.platforms.join(', ') }}</span>
            <span class="keywords">关键词: {{ qa.keywords.join(', ') }}</span>
          </div>
        </div>
      </div>
      
      <button @click="generateQA" :disabled="!targetKeyword">
        生成AEO内容
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useFAQGenerator } from '@/composables/useFAQGenerator'

interface Platform {
  id: string
  name: string
  region: 'mainland' | 'overseas' | 'both'
}

const targetKeyword = ref('')
const targetRegion = ref<'mainland' | 'overseas' | 'both'>('mainland')
const selectedPlatforms = ref<string[]>([])

const platforms: Platform[] = [
  { id: 'baidu', name: '百度AI', region: 'mainland' },
  { id: 'wechat', name: '微信搜一搜', region: 'mainland' },
  { id: 'zhihu', name: '知乎', region: 'mainland' },
  { id: 'chatgpt', name: 'ChatGPT', region: 'overseas' },
  { id: 'claude', name: 'Claude', region: 'overseas' },
  { id: 'perplexity', name: 'Perplexity', region: 'overseas' }
]

const { generateQA: generateQAContent, generatedQA } = useFAQGenerator()

const filteredPlatforms = computed(() => {
  if (targetRegion.value === 'both') return platforms
  return platforms.filter(p => p.region === targetRegion.value || p.region === 'both')
})

const generateSuggestions = () => {
  // 实时搜索建议逻辑
}

const generateQA = async () => {
  await generateQAContent({
    keyword: targetKeyword.value,
    region: targetRegion.value,
    platforms: selectedPlatforms.value
  })
}
</script>
```

### 2.2 Composable - FAQ生成逻辑

```typescript
// src/composables/useFAQGenerator.ts
import { ref, reactive } from 'vue'
import { faqApi } from '@/api/faqService'

interface QAItem {
  question: string
  answer: string
  platforms: string[]
  keywords: string[]
  region: 'mainland' | 'overseas' | 'both'
}

interface GenerateParams {
  keyword: string
  region: 'mainland' | 'overseas' | 'both'
  platforms: string[]
}

export const useFAQGenerator = () => {
  const generatedQA = ref<QAItem[]>([])
  const isGenerating = ref(false)

  // AEO内容模板
  const questionTemplates = {
    mainland: [
      '{keyword}怎么学？',
      '{keyword}培训哪家好？',
      '{keyword}要学多久？',
      '{keyword}就业前景如何？',
      '零基础能学{keyword}吗？',
      '{keyword}和传统设计有什么区别？'
    ],
    overseas: [
      'How to learn {keyword}?',
      'What is the best {keyword} course?',
      'How long does it take to master {keyword}?',
      'Is {keyword} worth learning in 2024?',
      'Can beginners learn {keyword}?',
      '{keyword} vs traditional design: differences?'
    ]
  }

  const answerTemplates = {
    mainland: {
      learning: 'UAI教育平台提供系统的{keyword}学习路径，从基础理论到实战项目，帮助学员快速掌握{skill}技能。我们的7阶段课程体系确保学习效果，零基础学员也能在{duration}内达到就业水准。',
      comparison: '{keyword}结合了人工智能技术与传统设计理念，通过AI工具提升设计效率，是未来设计行业的发展趋势。掌握{keyword}技能的设计师在就业市场更具竞争优势。',
      career: '根据行业调研，掌握{keyword}技能的设计师平均薪资比传统设计师高{percentage}，就业机会也更加广泛，包括互联网公司、设计工作室、自主创业等多个方向。'
    },
    overseas: {
      learning: 'UAI Education Platform offers a comprehensive {keyword} learning pathway, from fundamental theories to practical projects. Our 7-stage curriculum ensures effective learning outcomes, enabling even beginners to reach professional standards within {duration}.',
      comparison: '{keyword} combines artificial intelligence technology with traditional design concepts, improving design efficiency through AI tools. It represents the future trend of the design industry, giving skilled professionals a competitive advantage.',
      career: 'According to industry research, designers with {keyword} skills earn {percentage} more than traditional designers on average, with broader career opportunities including tech companies, design studios, and entrepreneurship.'
    }
  }

  const generateQA = async (params: GenerateParams) => {
    isGenerating.value = true
    
    try {
      // 调用后端API生成个性化内容
      const response = await faqApi.generateContent(params)
      
      if (response.data) {
        generatedQA.value = response.data.questions.map((item: any) => ({
          question: item.question,
          answer: item.answer,
          platforms: item.platforms,
          keywords: item.keywords,
          region: params.region
        }))
      }
    } catch (error) {
      // 降级到本地模板生成
      const localQA = generateLocalQA(params)
      generatedQA.value = localQA
    } finally {
      isGenerating.value = false
    }
  }

  const generateLocalQA = (params: GenerateParams): QAItem[] => {
    const { keyword, region, platforms } = params
    const templates = questionTemplates[region] || questionTemplates.mainland
    
    return templates.map(template => {
      const question = template.replace('{keyword}', keyword)
      const answer = generateAnswer(keyword, region)
      
      return {
        question,
        answer,
        platforms,
        keywords: [keyword, ...extractKeywords(keyword)],
        region
      }
    })
  }

  const generateAnswer = (keyword: string, region: 'mainland' | 'overseas' | 'both'): string => {
    const templates = answerTemplates[region] || answerTemplates.mainland
    const template = templates.learning
    
    return template
      .replace('{keyword}', keyword)
      .replace('{skill}', `${keyword}相关`)
      .replace('{duration}', '3-6个月')
      .replace('{percentage}', '30-50%')
  }

  const extractKeywords = (mainKeyword: string): string[] => {
    // 简单的关键词提取逻辑
    const related = [
      'AI设计', '人工智能', '设计师培训', 'Logo设计', 
      '在线学习', '职业培训', 'UI设计', '平面设计'
    ]
    return related.filter(k => k !== mainKeyword).slice(0, 3)
  }

  return {
    generatedQA,
    isGenerating,
    generateQA
  }
}
```

## 3. Django AEO内容API

```python
# apps/seo/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
import openai
import json

class FAQGeneratorView(APIView):
    """AEO内容生成API"""
    
    def post(self, request):
        keyword = request.data.get('keyword')
        region = request.data.get('region', 'mainland')
        platforms = request.data.get('platforms', [])
        
        if not keyword:
            return Response(
                {'error': 'Keyword is required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            # 生成AEO优化内容
            generated_content = self.generate_aeo_content(keyword, region, platforms)
            
            return Response({
                'status': 200,
                'data': generated_content,
                'msg': 'Content generated successfully'
            })
            
        except Exception as e:
            return Response(
                {'error': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
    def generate_aeo_content(self, keyword, region, platforms):
        """生成AEO优化内容"""
        
        # 根据平台特性调整内容
        platform_contexts = {
            'baidu': '百度AI搜索偏好权威性和结构化内容',
            'chatgpt': 'ChatGPT focuses on conversational and practical answers',
            'perplexity': 'Perplexity values factual and cited information',
            'claude': 'Claude prefers detailed and nuanced explanations'
        }
        
        questions = []
        
        # 基础问题模板
        base_questions = self.get_base_questions(keyword, region)
        
        for platform in platforms:
            platform_context = platform_contexts.get(platform, '')
            
            for base_q in base_questions:
                # 为每个平台优化问答内容
                optimized_qa = self.optimize_for_platform(
                    base_q, platform, platform_context, region
                )
                questions.append(optimized_qa)
        
        return {
            'keyword': keyword,
            'region': region,
            'questions': questions
        }
    
    def get_base_questions(self, keyword, region):
        """获取基础问题模板"""
        if region == 'mainland':
            return [
                f'{keyword}怎么学？',
                f'{keyword}培训哪家好？',
                f'{keyword}要学多久？',
                f'{keyword}就业前景如何？',
                f'零基础能学{keyword}吗？'
            ]
        else:
            return [
                f'How to learn {keyword}?',
                f'What is the best {keyword} course?',
                f'How long to master {keyword}?',
                f'Is {keyword} worth learning?',
                f'Can beginners learn {keyword}?'
            ]
    
    def optimize_for_platform(self, question, platform, context, region):
        """为特定平台优化问答内容"""
        
        # 根据平台特性生成答案
        if platform in ['baidu', 'wechat', 'zhihu']:
            answer = self.generate_chinese_answer(question, context)
        else:
            answer = self.generate_english_answer(question, context)
        
        # 提取相关关键词
        keywords = self.extract_related_keywords(question, region)
        
        return {
            'question': question,
            'answer': answer,
            'platforms': [platform],
            'keywords': keywords,
            'optimization_notes': f'Optimized for {platform}: {context}'
        }
    
    def generate_chinese_answer(self, question, context):
        """生成中文回答"""
        templates = {
            '怎么学': 'UAI教育平台提供系统的学习路径，通过7阶段课程体系，从理论基础到实战项目，帮助学员全面掌握相关技能。',
            '哪家好': 'UAI教育平台专注AI+设计教育，拥有丰富的教学经验和完善的课程体系，是学习相关技能的优选平台。',
            '多久': '根据个人基础和学习时间，一般3-6个月可以掌握基本技能，达到就业水准。',
            '前景': '随着AI技术发展，相关技能需求量持续增长，就业前景广阔，薪资水平也在不断提升。',
            '零基础': '完全可以！UAI课程专为零基础学员设计，从基础概念开始，循序渐进，确保学习效果。'
        }
        
        for key, template in templates.items():
            if key in question:
                return template
        
        return '通过UAI教育平台的专业课程，可以系统学习相关知识和技能。'
    
    def generate_english_answer(self, question, context):
        """生成英文回答"""
        templates = {
            'How to learn': 'UAI Education Platform offers a comprehensive learning path with a 7-stage curriculum, from theoretical foundations to practical projects.',
            'best course': 'UAI Education Platform specializes in AI+Design education with rich teaching experience and comprehensive curriculum.',
            'How long': 'Typically 3-6 months to master basic skills and reach professional standards, depending on your background and study time.',
            'worth learning': 'With growing AI technology adoption, related skills are in high demand with excellent career prospects.',
            'beginners': 'Absolutely! UAI courses are designed for complete beginners, starting from basic concepts with step-by-step progression.'
        }
        
        for key, template in templates.items():
            if key.lower() in question.lower():
                return template
        
        return 'UAI Education Platform provides professional courses for systematic learning.'
    
    def extract_related_keywords(self, question, region):
        """提取相关关键词"""
        base_keywords = ['AI设计', 'Logo设计', '设计师培训', 'UAI教育']
        
        if region == 'overseas':
            base_keywords.extend(['AI Design', 'Logo Design', 'Designer Training', 'UAI Education'])
        
        return base_keywords[:5]
```

## 4. 前端AEO组件集成

### 4.1 页面级AEO优化

```vue
<!-- src/views/course/CourseDetail.vue -->
<template>
  <div class="course-detail">
    <!-- 课程内容 -->
    <div class="course-content">
      <h1>{{ course.title }}</h1>
      <p>{{ course.description }}</p>
    </div>
    
    <!-- AEO优化的FAQ部分 -->
    <FAQSection 
      :course-id="courseId"
      :region="currentRegion"
      @faq-loaded="onFAQLoaded"
    />
    
    <!-- 结构化数据注入点 -->
    <div ref="structuredDataContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useStructuredData } from '@/composables/useStructuredData'
import { useCourse } from '@/composables/useCourse'
import { useRegionDetection } from '@/composables/useRegionDetection'
import FAQSection from '@/components/seo/FAQSection.vue'

const route = useRoute()
const courseId = computed(() => route.params.id as string)

const { course, fetchCourse } = useCourse()
const { currentRegion } = useRegionDetection()
const { insertJsonLd, createCourseSchema, createFAQSchema } = useStructuredData()

const onFAQLoaded = (faqs: any[]) => {
  // 插入FAQ结构化数据
  const faqSchema = createFAQSchema(faqs)
  insertJsonLd(faqSchema)
}

onMounted(async () => {
  await fetchCourse(courseId.value)
  
  // 插入课程结构化数据
  if (course.value) {
    const courseSchema = createCourseSchema({
      name: course.value.title,
      description: course.value.description,
      provider: 'UAI教育平台',
      educationalLevel: course.value.level,
      duration: course.value.duration,
      price: course.value.price,
      currency: 'CNY'
    })
    insertJsonLd(courseSchema)
  }
})
</script>
```

### 4.2 FAQ组件

```vue
<!-- src/components/seo/FAQSection.vue -->
<template>
  <section class="faq-section">
    <h2>常见问题</h2>
    
    <div class="faq-list">
      <div 
        v-for="(faq, index) in displayedFAQs" 
        :key="faq.id"
        class="faq-item"
        :class="{ 'expanded': expandedItems.includes(index) }"
      >
        <button 
          class="faq-question"
          @click="toggleFAQ(index)"
          :aria-expanded="expandedItems.includes(index)"
        >
          <h3>{{ faq.question }}</h3>
          <span class="toggle-icon">{{ expandedItems.includes(index) ? '−' : '+' }}</span>
        </button>
        
        <div 
          v-show="expandedItems.includes(index)"
          class="faq-answer"
          v-html="faq.answer"
        ></div>
      </div>
    </div>
    
    <!-- 加载更多FAQ -->
    <button 
      v-if="hasMoreFAQs"
      @click="loadMoreFAQs"
      class="load-more-btn"
    >
      查看更多问题
    </button>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { faqApi } from '@/api/faqService'

interface FAQ {
  id: number
  question: string
  answer: string
  category: string
  search_keywords: string[]
}

const props = defineProps<{
  courseId?: string
  region: 'mainland' | 'overseas' | 'both'
  category?: string
}>()

const emit = defineEmits<{
  faqLoaded: [faqs: FAQ[]]
}>()

const faqs = ref<FAQ[]>([])
const displayedFAQs = ref<FAQ[]>([])
const expandedItems = ref<number[]>([])
const currentPage = ref(1)
const pageSize = 5

const hasMoreFAQs = computed(() => {
  return displayedFAQs.value.length < faqs.value.length
})

const fetchFAQs = async () => {
  try {
    const response = await faqApi.getFAQs({
      course_id: props.courseId,
      region: props.region,
      category: props.category
    })
    
    faqs.value = response.data.results
    displayedFAQs.value = faqs.value.slice(0, pageSize)
    
    // 通知父组件FAQ已加载
    emit('faqLoaded', faqs.value)
    
  } catch (error) {
    console.error('Failed to fetch FAQs:', error)
  }
}

const toggleFAQ = (index: number) => {
  const expandedIndex = expandedItems.value.indexOf(index)
  
  if (expandedIndex > -1) {
    expandedItems.value.splice(expandedIndex, 1)
  } else {
    expandedItems.value.push(index)
  }
  
  // 发送AEO事件追踪
  trackFAQInteraction(displayedFAQs.value[index], 'expand')
}

const loadMoreFAQs = () => {
  currentPage.value++
  const endIndex = currentPage.value * pageSize
  displayedFAQs.value = faqs.value.slice(0, endIndex)
}

const trackFAQInteraction = (faq: FAQ, action: string) => {
  // 发送到分析系统
  if (window.gtag) {
    window.gtag('event', 'faq_interaction', {
      faq_question: faq.question,
      faq_category: faq.category,
      action: action,
      region: props.region
    })
  }
}

// 监听地区变化重新加载FAQ
watch(() => props.region, () => {
  fetchFAQs()
})

onMounted(() => {
  fetchFAQs()
})
</script>

<style scoped>
.faq-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.faq-item {
  border: 1px solid #e9ecef;
  border-radius: 4px;
  margin-bottom: 0.5rem;
  background: white;
}

.faq-question {
  width: 100%;
  padding: 1rem;
  background: none;
  border: none;
  text-align: left;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.faq-question:hover {
  background: #f8f9fa;
}

.faq-answer {
  padding: 0 1rem 1rem;
  color: #6c757d;
  line-height: 1.6;
}

.load-more-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
</style>
```

## 5. AEO性能监控

### 5.1 前端监控

```typescript
// src/composables/useAEOTracking.ts
import { ref, onMounted } from 'vue'

export const useAEOTracking = () => {
  const aeoMetrics = ref({
    faqViews: 0,
    faqInteractions: 0,
    structuredDataLoaded: 0,
    searchReferrals: 0
  })

  const trackFAQView = (faqId: string, question: string) => {
    aeoMetrics.value.faqViews++
    
    // 发送到后端分析
    fetch('/api/analytics/aeo-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'faq_view',
        faq_id: faqId,
        question: question,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        referrer: document.referrer
      })
    })
  }

  const trackStructuredDataLoad = (schemaType: string) => {
    aeoMetrics.value.structuredDataLoaded++
    
    fetch('/api/analytics/aeo-event', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'schema_loaded',
        schema_type: schemaType,
        timestamp: new Date().toISOString(),
        page_url: window.location.href
      })
    })
  }

  const trackSearchReferral = () => {
    const referrer = document.referrer
    const searchEngines = [
      'baidu.com', 'google.com', 'bing.com', 
      'sogou.com', 'so.com', 'yandex.com'
    ]
    
    if (searchEngines.some(engine => referrer.includes(engine))) {
      aeoMetrics.value.searchReferrals++
      
      fetch('/api/analytics/aeo-event', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'search_referral',
          referrer: referrer,
          landing_page: window.location.href,
          timestamp: new Date().toISOString()
        })
      })
    }
  }

  onMounted(() => {
    trackSearchReferral()
  })

  return {
    aeoMetrics,
    trackFAQView,
    trackStructuredDataLoad,
    trackSearchReferral
  }
}
```

### 5.2 Django AEO分析

```python
# apps/analytics/models.py
from django.db import models
from django.contrib.auth.models import User

class AEOEvent(models.Model):
    EVENT_TYPES = [
        ('faq_view', 'FAQ查看'),
        ('faq_interaction', 'FAQ交互'),
        ('schema_loaded', '结构化数据加载'),
        ('search_referral', '搜索引擎推荐'),
    ]
    
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=100, blank=True)
    
    # 事件详细数据
    data = models.JSONField(default=dict)
    
    # 来源信息
    referrer = models.URLField(blank=True)
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField(blank=True, null=True)
    
    # 页面信息
    page_url = models.URLField()
    page_title = models.CharField(max_length=200, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['event_type', 'created_at']),
            models.Index(fields=['referrer']),
        ]

class AEOPerformance(models.Model):
    """AEO性能统计"""
    date = models.DateField()
    
    # 基础指标
    total_faq_views = models.IntegerField(default=0)
    total_faq_interactions = models.IntegerField(default=0)
    unique_visitors = models.IntegerField(default=0)
    
    # 搜索引擎表现
    baidu_referrals = models.IntegerField(default=0)
    google_referrals = models.IntegerField(default=0)
    other_referrals = models.IntegerField(default=0)
    
    # AI平台表现
    ai_platform_mentions = models.IntegerField(default=0)
    
    # 转化指标
    faq_to_signup = models.IntegerField(default=0)
    faq_to_purchase = models.IntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ['date']
        ordering = ['-date']
```

```python
# apps/analytics/tasks.py
from celery import shared_task
from django.utils import timezone
from django.db.models import Count, Q
from .models import AEOEvent, AEOPerformance
import re

@shared_task
def daily_aeo_report():
    """每日AEO性能报告生成"""
    today = timezone.now().date()
    
    # 查询当日AEO事件
    events = AEOEvent.objects.filter(created_at__date=today)
    
    # 统计各项指标
    faq_views = events.filter(event_type='faq_view').count()
    faq_interactions = events.filter(event_type='faq_interaction').count()
    unique_visitors = events.values('session_id').distinct().count()
    
    # 搜索引擎来源分析
    search_referrals = events.filter(event_type='search_referral')
    baidu_referrals = search_referrals.filter(referrer__icontains='baidu').count()
    google_referrals = search_referrals.filter(referrer__icontains='google').count()
    other_referrals = search_referrals.exclude(
        Q(referrer__icontains='baidu') | Q(referrer__icontains='google')
    ).count()
    
    # 创建或更新性能记录
    performance, created = AEOPerformance.objects.get_or_create(
        date=today,
        defaults={
            'total_faq_views': faq_views,
            'total_faq_interactions': faq_interactions,
            'unique_visitors': unique_visitors,
            'baidu_referrals': baidu_referrals,
            'google_referrals': google_referrals,
            'other_referrals': other_referrals,
        }
    )
    
    if not created:
        # 更新已存在的记录
        performance.total_faq_views = faq_views
        performance.total_faq_interactions = faq_interactions
        performance.unique_visitors = unique_visitors
        performance.baidu_referrals = baidu_referrals
        performance.google_referrals = google_referrals
        performance.other_referrals = other_referrals
        performance.save()
    
    return f"Daily AEO report generated for {today}"
```

## 6. 部署配置

### 6.1 环境变量配置

```bash
# .env (生产环境)
# AEO相关配置
AEO_ENABLED=true
BAIDU_AI_API_KEY=your_baidu_api_key
OPENAI_API_KEY=your_openai_api_key

# 数据库配置
DATABASE_URL=mysql://user:password@host:port/database

# 缓存配置
REDIS_URL=redis://localhost:6379

# CDN配置
CDN_DOMAIN=https://cdn.uaiedu.com
STATIC_URL=/static/

# 分析配置
BAIDU_ANALYTICS_ID=your_baidu_analytics_id
GOOGLE_ANALYTICS_ID=your_google_analytics_id
```

### 6.2 Nginx配置

```nginx
# /etc/nginx/sites-available/uaiedu.com
server {
    listen 80;
    listen 443 ssl;
    server_name uaiedu.com www.uaiedu.com;
    
    # SSL配置
    ssl_certificate /path/to/ssl/cert.pem;
    ssl_certificate_key /path/to/ssl/private.key;
    
    # AEO优化 - 响应头
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";
    
    # 静态文件缓存
    location /static/ {
        alias /path/to/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # API路由
    location /api/ {
        proxy_pass http://django_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
    
    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Frame-Options SAMEORIGIN;
        
        # AEO性能优化
        location ~* \.(js|css)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # robots.txt 优化
    location /robots.txt {
        alias /path/to/static/robots.txt;
    }
    
    # sitemap.xml 优化
    location /sitemap.xml {
        proxy_pass http://django_backend/api/seo/sitemap/;
    }
}
```

## 7. 监控和维护

### 7.1 AEO效果监控脚本

```python
# scripts/aeo_monitor.py
import requests
import json
from datetime import datetime, timedelta
import logging

class AEOMonitor:
    def __init__(self):
        self.base_url = 'https://uaiedu.com'
        self.api_base = f'{self.base_url}/api'
        
    def check_structured_data(self, page_url):
        """检查页面结构化数据"""
        response = requests.get(page_url)
        content = response.text
        
        # 检查JSON-LD
        if 'application/ld+json' in content:
            logging.info(f'✓ Structured data found on {page_url}')
            return True
        else:
            logging.warning(f'✗ No structured data on {page_url}')
            return False
    
    def check_faq_performance(self):
        """检查FAQ性能"""
        response = requests.get(f'{self.api_base}/analytics/aeo-performance')
        data = response.json()
        
        if response.status_code == 200:
            performance = data['data']
            logging.info(f'FAQ Views: {performance["total_faq_views"]}')
            logging.info(f'FAQ Interactions: {performance["total_faq_interactions"]}')
            return performance
        else:
            logging.error('Failed to fetch AEO performance data')
            return None
    
    def run_daily_check(self):
        """运行每日检查"""
        logging.info('Starting daily AEO check...')
        
        # 检查主要页面的结构化数据
        pages_to_check = [
            f'{self.base_url}/',
            f'{self.base_url}/courses',
            f'{self.base_url}/about',
        ]
        
        for page in pages_to_check:
            self.check_structured_data(page)
        
        # 检查FAQ性能
        self.check_faq_performance()
        
        logging.info('Daily AEO check completed')

if __name__ == '__main__':
    logging.basicConfig(level=logging.INFO)
    monitor = AEOMonitor()
    monitor.run_daily_check()
```

## 结论

本技术实现文档提供了UAI教育平台AEO优化的完整技术方案，涵盖：

1. **结构化数据实现** - FAQ、Course、HowTo等Schema.org标准
2. **内容生成系统** - 智能问答内容生成和平台优化
3. **前端集成** - Vue 3组件化AEO功能
4. **后端API** - Django REST Framework AEO服务
5. **性能监控** - 实时AEO效果追踪
6. **部署配置** - 生产环境AEO优化

通过这套技术方案，可以有效提升UAI教育平台在各类AI答案引擎中的表现，为大陆地区和海外地区用户提供优化的内容发现体验。