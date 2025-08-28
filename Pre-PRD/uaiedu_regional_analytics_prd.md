# 《UAI 平台地域化埋点系统详细实施方案》

## 1. 背景与问题

### 1.1 核心问题
- **GA4在国内访问问题**：`googletagmanager.com` 经常被阻断，导致脚本加载失败
- **性能影响**：GA4加载超时造成页面卡顿3-10秒，影响用户体验
- **控制台报错**：加载失败产生大量错误日志，影响开发调试
- **用户流失风险**：页面白屏时间延长，增加跳出率

### 1.2 部署环境特点
- **主服务器**：阿里云ECS（国内）
- **用户分布**：大陆用户为主，港澳台用户次之，国际用户少量
- **访问策略**：开放80/443端口，支持港澳台和海外访问

## 2. 地域化策略设计

### 2.1 用户分类与对应策略

| 用户群体 | 检测标识 | 埋点策略 | 预期效果 |
|----------|----------|----------|----------|
| 中国大陆 | timezone: Asia/Shanghai<br/>language: zh-CN | 仅百度统计 | 秒级加载，零阻断 |
| 港澳台 | timezone: Asia/Hong_Kong, Asia/Macau, Asia/Taipei<br/>language: zh-TW, zh-HK | 百度 + GA4 | 双重数据覆盖 |
| 国际用户 | 其他timezone<br/>language: en, ja, ko等 | 百度 + GA4 | 完整国际化分析 |

### 2.2 技术检测逻辑

```javascript
/**
 * 用户地域检测核心逻辑
 */
const detectUserRegion = () => {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const language = navigator.language.toLowerCase()
  
  // 中国大陆用户检测
  const isChinaMainland = 
    timezone.includes('Shanghai') || 
    timezone.includes('Chongqing') || 
    timezone.includes('Urumqi') ||
    language.startsWith('zh-cn')
  
  // 港澳台用户检测
  const isHongKongMacauTaiwan = 
    timezone.includes('Hong_Kong') ||
    timezone.includes('Macau') ||
    timezone.includes('Taipei') ||
    language.includes('zh-tw') ||
    language.includes('zh-hk')
  
  return {
    isChinaMainland,
    isHongKongMacauTaiwan,
    loadGA4: !isChinaMainland, // 非大陆用户加载GA4
    loadBaidu: true, // 所有用户都加载百度统计
    region: isChinaMainland ? 'mainland' : 
            isHongKongMacauTaiwan ? 'hmt' : 'international'
  }
}
```

## 3. 性能优化方案

### 3.1 异步加载与超时保护

```javascript
/**
 * 带超时保护的GA4加载函数
 */
const loadGA4WithTimeout = (measurementId, timeout = 3000) => {
  return new Promise((resolve, reject) => {
    // 设置超时保护
    const timeoutHandler = setTimeout(() => {
      console.warn('[Analytics] GA4 load timeout, falling back to Baidu only')
      reject(new Error('GA4 load timeout'))
    }, timeout)
    
    // 动态创建GA4脚本
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
    
    script.onload = () => {
      clearTimeout(timeoutHandler)
      
      // 初始化GA4
      window.dataLayer = window.dataLayer || []
      window.gtag = function() { dataLayer.push(arguments) }
      window.gtag('js', new Date())
      window.gtag('config', measurementId)
      
      console.log('[Analytics] GA4 loaded successfully')
      resolve()
    }
    
    script.onerror = () => {
      clearTimeout(timeoutHandler)
      console.warn('[Analytics] GA4 load failed, continuing with Baidu only')
      reject(new Error('GA4 load failed'))
    }
    
    document.head.appendChild(script)
  })
}
```

### 3.2 百度统计初始化

```javascript
/**
 * 百度统计初始化（所有用户必须加载）
 */
const initializeBaiduAnalytics = (siteId) => {
  window._hmt = window._hmt || []
  
  const script = document.createElement('script')
  script.async = true
  script.src = `https://hm.baidu.com/hm.js?${siteId}`
  
  script.onload = () => {
    console.log('[Analytics] Baidu Analytics loaded successfully')
  }
  
  script.onerror = () => {
    console.error('[Analytics] Baidu Analytics load failed')
  }
  
  document.head.appendChild(script)
}
```

### 3.3 统一的埋点管理器

```javascript
/**
 * 地域化埋点管理器
 */
class RegionalAnalyticsManager {
  constructor() {
    this.region = detectUserRegion()
    this.isGA4Ready = false
    this.isBaiduReady = false
    this.eventQueue = []
  }
  
  async initialize(config) {
    const { ga4MeasurementId, baiduSiteId } = config
    
    // 百度统计（必须加载）
    initializeBaiduAnalytics(baiduSiteId)
    this.isBaiduReady = true
    
    // GA4（条件加载）
    if (this.region.loadGA4) {
      try {
        await loadGA4WithTimeout(ga4MeasurementId)
        this.isGA4Ready = true
      } catch (error) {
        console.warn('[Analytics] GA4 initialization failed, continuing with Baidu only')
      }
    }
    
    // 处理队列中的事件
    this.processEventQueue()
    
    console.log(`[Analytics] Initialized for region: ${this.region.region}`, {
      ga4Ready: this.isGA4Ready,
      baiduReady: this.isBaiduReady
    })
  }
  
  trackEvent(eventName, eventData = {}) {
    const event = {
      name: eventName,
      data: {
        ...eventData,
        timestamp: Date.now(),
        region: this.region.region,
        user_agent: navigator.userAgent
      }
    }
    
    if (!this.isBaiduReady && !this.isGA4Ready) {
      // 如果埋点系统还未初始化，加入队列
      this.eventQueue.push(event)
      return
    }
    
    // 发送到百度统计
    if (this.isBaiduReady) {
      window._hmt.push(['_trackEvent', eventName, JSON.stringify(eventData)])
    }
    
    // 发送到GA4（如果已加载）
    if (this.isGA4Ready) {
      window.gtag('event', eventName, eventData)
    }
    
    // 发送到Django后端（重要业务数据）
    this.sendToBackend(event)
  }
  
  processEventQueue() {
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift()
      this.trackEvent(event.name, event.data)
    }
  }
  
  sendToBackend(event) {
    // 发送关键业务事件到Django后端
    if (this.isCriticalEvent(event.name)) {
      fetch('/api/analytics/events/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRFToken': this.getCSRFToken()
        },
        body: JSON.stringify(event)
      }).catch(error => {
        console.error('[Analytics] Failed to send event to backend:', error)
      })
    }
  }
  
  isCriticalEvent(eventName) {
    const criticalEvents = [
      'user.register',
      'user.login',
      'payment.success',
      'course.purchase',
      'video.complete'
    ]
    return criticalEvents.includes(eventName)
  }
  
  getCSRFToken() {
    return document.querySelector('[name=csrfmiddlewaretoken]')?.value || ''
  }
}
```

## 4. Vue3集成实现

### 4.1 Composition API Hook

```typescript
// composables/useAnalytics.ts
import { ref, onMounted } from 'vue'

export interface AnalyticsConfig {
  ga4MeasurementId: string
  baiduSiteId: string
}

export const useAnalytics = () => {
  const analyticsManager = ref<RegionalAnalyticsManager | null>(null)
  const isInitialized = ref(false)
  
  const initialize = async (config: AnalyticsConfig) => {
    try {
      analyticsManager.value = new RegionalAnalyticsManager()
      await analyticsManager.value.initialize(config)
      isInitialized.value = true
    } catch (error) {
      console.error('[Analytics] Initialization failed:', error)
    }
  }
  
  const trackEvent = (eventName: string, eventData?: Record<string, any>) => {
    if (!analyticsManager.value) {
      console.warn('[Analytics] Manager not initialized, event ignored:', eventName)
      return
    }
    
    analyticsManager.value.trackEvent(eventName, eventData)
  }
  
  const trackPageView = (pageName: string, pageData?: Record<string, any>) => {
    trackEvent('page.view', {
      page_name: pageName,
      page_url: window.location.href,
      page_referrer: document.referrer,
      ...pageData
    })
  }
  
  return {
    initialize,
    trackEvent,
    trackPageView,
    isInitialized
  }
}
```

### 4.2 全局插件安装

```typescript
// plugins/analytics.ts
import type { App } from 'vue'
import { RegionalAnalyticsManager } from '@/utils/regionalAnalytics'

export default {
  install(app: App, options: AnalyticsConfig) {
    const analyticsManager = new RegionalAnalyticsManager()
    
    // 全局属性注入
    app.config.globalProperties.$analytics = analyticsManager
    
    // 提供注入
    app.provide('analytics', analyticsManager)
    
    // 自动初始化
    analyticsManager.initialize(options)
  }
}
```

## 5. Django后端支持

### 5.1 数据模型设计

```python
# apps/analytics/models.py
from django.db import models
from django.contrib.auth.models import User
import json

class AnalyticsEvent(models.Model):
    REGION_CHOICES = [
        ('mainland', '中国大陆'),
        ('hmt', '港澳台'),
        ('international', '国际'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=64, db_index=True)
    event_name = models.CharField(max_length=128, db_index=True)
    event_data = models.JSONField(default=dict)
    region = models.CharField(max_length=20, choices=REGION_CHOICES, db_index=True)
    user_agent = models.TextField(blank=True)
    ip_address = models.GenericIPAddressField()
    timestamp = models.DateTimeField(auto_now_add=True, db_index=True)
    
    class Meta:
        db_table = 'analytics_events'
        indexes = [
            models.Index(fields=['event_name', 'timestamp']),
            models.Index(fields=['region', 'timestamp']),
            models.Index(fields=['user', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.event_name} - {self.region} - {self.timestamp}"
```

### 5.2 API视图

```python
# apps/analytics/views.py
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.utils import timezone
from .models import AnalyticsEvent
import json

@api_view(['POST'])
@permission_classes([AllowAny])
def track_event(request):
    try:
        data = request.data
        
        # 获取用户IP
        ip_address = get_client_ip(request)
        
        # 创建事件记录
        event = AnalyticsEvent.objects.create(
            user=request.user if request.user.is_authenticated else None,
            session_id=request.session.session_key or '',
            event_name=data.get('name', ''),
            event_data=data.get('data', {}),
            region=data.get('data', {}).get('region', 'unknown'),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            ip_address=ip_address
        )
        
        return Response({
            'status': 200,
            'data': {'event_id': event.id},
            'msg': 'Event tracked successfully'
        })
        
    except Exception as e:
        return Response({
            'status': 400,
            'data': {},
            'msg': f'Failed to track event: {str(e)}'
        }, status=status.HTTP_400_BAD_REQUEST)

def get_client_ip(request):
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip
```

## 6. 环境配置

### 6.1 前端环境变量

```typescript
// .env.production
VITE_GA4_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_BAIDU_SITE_ID=xxxxxxxxxx
VITE_ANALYTICS_TIMEOUT=3000
VITE_ANALYTICS_DEBUG=false
```

### 6.2 Django设置

```python
# settings.py
ANALYTICS_CONFIG = {
    'GA4_MEASUREMENT_ID': os.getenv('GA4_MEASUREMENT_ID', ''),
    'BAIDU_SITE_ID': os.getenv('BAIDU_SITE_ID', ''),
    'TIMEOUT_MS': int(os.getenv('ANALYTICS_TIMEOUT', '3000')),
    'DEBUG': os.getenv('ANALYTICS_DEBUG', 'False').lower() == 'true',
}
```

## 7. 关键事件定义

### 7.1 用户行为事件

```javascript
// 用户生命周期
trackEvent('user.register', {
  registration_method: 'email', // email, phone, wechat
  referrer_source: document.referrer,
  utm_campaign: getUrlParam('utm_campaign')
})

trackEvent('user.login', {
  login_method: 'password', // password, sms, wechat
  is_remember: true
})

trackEvent('user.logout', {
  session_duration: getSessionDuration()
})
```

### 7.2 学习行为事件

```javascript
// 视频学习
trackEvent('video.play.start', {
  course_id: 'course_123',
  lesson_id: 'lesson_456',
  video_duration: 1800, // 秒
  play_position: 0
})

trackEvent('video.pause', {
  course_id: 'course_123',
  lesson_id: 'lesson_456',
  play_position: 300,
  pause_reason: 'user_action' // user_action, network_error, buffer
})

trackEvent('course.progress.update', {
  course_id: 'course_123',
  progress_percentage: 25.5,
  completed_lessons: 3,
  total_lessons: 12
})
```

### 7.3 商业转化事件

```javascript
// 购物车操作
trackEvent('cart.add', {
  course_id: 'course_123',
  course_price: 299.00,
  cart_total: 598.00,
  currency: 'CNY'
})

// 支付成功
trackEvent('payment.success', {
  order_id: 'order_789',
  total_amount: 598.00,
  payment_method: 'alipay', // alipay, wechat, card
  currency: 'CNY',
  course_ids: ['course_123', 'course_456']
})
```

### 7.4 SEO/AEO事件

```javascript
// 搜索引擎来源
trackEvent('search.from.baidu', {
  search_keyword: '人工智能课程',
  landing_page: '/courses/ai-basics',
  search_result_position: 3
})

// FAQ点击
trackEvent('faq.click', {
  faq_id: 'faq_001',
  faq_question: '如何报名课程？',
  page_url: window.location.href
})

// AI搜索引用
trackEvent('ai.referral', {
  ai_source: 'chatgpt', // chatgpt, perplexity, claude
  referral_context: 'course_recommendation',
  landing_page: '/courses'
})
```

## 8. 性能监控与降级

### 8.1 性能指标追踪

```javascript
// 埋点系统性能监控
const performanceMonitor = {
  trackLoadTime: (service, startTime) => {
    const loadTime = Date.now() - startTime
    trackEvent('analytics.load_time', {
      service: service, // 'ga4', 'baidu'
      load_time_ms: loadTime,
      is_success: loadTime < 3000
    })
  },
  
  trackError: (service, error) => {
    trackEvent('analytics.error', {
      service: service,
      error_message: error.message,
      error_type: error.constructor.name
    })
  }
}
```

### 8.2 降级策略实施

```javascript
// 埋点降级策略
const fallbackStrategy = {
  // GA4失败时的处理
  onGA4Failed: () => {
    console.warn('[Analytics] GA4 failed, using Baidu + Backend only')
    trackEvent('analytics.fallback', {
      failed_service: 'ga4',
      fallback_to: 'baidu_backend'
    })
  },
  
  // 百度统计失败时的处理
  onBaiduFailed: () => {
    console.error('[Analytics] Baidu failed, using Backend only')
    trackEvent('analytics.fallback', {
      failed_service: 'baidu',
      fallback_to: 'backend_only'
    })
  },
  
  // 后端失败时的处理
  onBackendFailed: () => {
    console.error('[Analytics] Backend failed, using localStorage cache')
    // 缓存到localStorage，等待网络恢复后重试
    this.cacheEventToLocalStorage(event)
  }
}
```

## 9. 数据隐私与合规

### 9.1 隐私保护原则

- **最小化收集**：仅收集必要的业务指标，不收集敏感个人信息
- **用户ID化**：使用UUID代替真实用户信息
- **数据加密**：传输过程使用HTTPS，敏感数据字段加密存储
- **用户控制**：提供埋点开关，用户可选择退出追踪

### 9.2 GDPR合规配置

```javascript
// 用户隐私控制
const privacyManager = {
  checkConsent: () => {
    const consent = localStorage.getItem('analytics_consent')
    return consent === 'granted'
  },
  
  requestConsent: () => {
    // 显示隐私同意弹窗
    return new Promise((resolve) => {
      // 用户同意后调用 resolve(true)
    })
  },
  
  revokeConsent: () => {
    localStorage.setItem('analytics_consent', 'denied')
    // 停止所有埋点追踪
  }
}
```

## 10. 测试与验证

### 10.1 功能测试用例

| 测试场景 | 预期行为 | 验证方法 |
|----------|----------|----------|
| 国内用户访问 | 仅加载百度统计，不加载GA4 | 检查Network面板，无GA4请求 |
| 港澳台用户访问 | 同时加载百度统计和GA4 | 检查两个埋点脚本都成功加载 |
| GA4超时测试 | 3秒后降级到仅百度统计 | 模拟网络延迟，验证降级逻辑 |
| 关键事件追踪 | 支付等关键事件写入Django后端 | 检查数据库中的事件记录 |

### 10.2 性能测试指标

- **页面加载时间**：国内用户<2秒，海外用户<3秒
- **埋点初始化时间**：<1秒
- **事件发送延迟**：<500ms
- **内存占用**：<5MB

## 11. 部署检查清单

### 11.1 前端部署

- [ ] 环境变量配置（GA4_MEASUREMENT_ID, BAIDU_SITE_ID）
- [ ] 地域检测逻辑测试
- [ ] 超时降级机制验证
- [ ] 事件发送API测试

### 11.2 后端部署

- [ ] analytics应用迁移
- [ ] API端点配置
- [ ] 数据库索引创建
- [ ] CORS配置更新

### 11.3 监控配置

- [ ] 埋点成功率监控
- [ ] 页面性能指标监控
- [ ] 错误日志收集
- [ ] 关键业务指标告警

## 12. 版本规划

### V1.0（即时实施）
- 地域检测与条件加载
- 百度统计 + Django后端埋点
- 关键业务事件追踪

### V1.1（1个月后）
- GA4海外用户支持
- 性能监控与告警
- 数据可视化面板

### V2.0（配合国际版上线）
- 多语言埋点支持
- 国际化用户行为分析
- AI驱动的用户画像

---

**实施优先级**：性能优先 > 数据完整性 > 功能丰富度
**核心原则**：确保国内用户体验不受影响的前提下，最大化数据收集价值