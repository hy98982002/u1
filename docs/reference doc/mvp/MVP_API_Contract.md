# UAI教育平台 - MVP核心API契约

> **文档目标**: 定义前后端接口规范，确保MVP快速开发和对接
> 
> **更新时间**: 2025-08-31  
> **负责人**: 后端架构师 + 前端负责人

## 🎯 MVP API设计原则

**核心原则**: 简洁、一致、快速迭代

- **RESTful风格**: 使用标准HTTP方法和状态码
- **统一响应格式**: 所有API返回格式一致
- **版本控制**: 使用URL路径版本 `/api/v1/`
- **JWT认证**: 无状态token认证
- **错误处理**: 标准化错误码和消息

---

## 📋 API通用规范

### 基础路径
```
开发环境: http://localhost:8000/api/v1/
生产环境: https://api.uaiedu.com/api/v1/
```

### 统一响应格式

```json
{
  "status": 200,
  "data": {},
  "msg": "Success"
}
```

**错误响应格式:**
```json
{
  "status": 400,
  "data": null,
  "msg": "参数验证失败",
  "errors": {
    "email": ["邮箱格式不正确"]
  }
}
```

### 认证Header
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
```

---

## 🔐 1. 用户认证API

### 1.1 用户注册
```http
POST /api/v1/auth/register
Content-Type: application/json

{
  "username": "testuser",
  "email": "user@example.com", 
  "password": "password123",
  "phone_number": "+86-13800138000"  // 可选
}
```

**响应:**
```json
{
  "status": 201,
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "email": "user@example.com",
      "user_type": "registered",
      "created_at": "2025-08-31T10:00:00Z"
    },
    "token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
    "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  },
  "msg": "注册成功"
}
```

### 1.2 用户登录
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

### 1.3 获取用户信息
```http
GET /api/v1/auth/me
Authorization: Bearer <jwt_token>
```

**响应:**
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "username": "testuser",
    "email": "user@example.com",
    "user_type": "registered",
    "profile": {
      "display_name": "测试用户",
      "avatar_url": "https://cdn.uaiedu.com/avatars/default.jpg",
      "bio": "AI设计学习者",
      "location": "北京"
    }
  },
  "msg": "成功"
}
```

### 1.4 Token刷新
```http
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
}
```

---

## 📚 2. 课程管理API

### 2.1 获取课程列表
```http
GET /api/v1/courses?level=beginner&type=free&page=1&size=10
```

**查询参数:**
- `level`: beginner | intermediate | advanced
- `type`: free | paid | premium  
- `page`: 页码，默认1
- `size`: 每页数量，默认10

**响应:**
```json
{
  "status": 200,
  "data": {
    "courses": [
      {
        "id": 1,
        "title": "AI Logo设计入门",
        "slug": "ai-logo-design-basics",
        "description": "学习使用AI工具制作专业Logo",
        "course_level": "beginner",
        "course_type": "free",
        "price": "0.00",
        "cover_image_url": "https://cdn.uaiedu.com/courses/logo-basics.jpg",
        "lesson_count": 8,
        "duration_minutes": 240,
        "is_enrolled": false
      }
    ],
    "pagination": {
      "current_page": 1,
      "total_pages": 3,
      "total_count": 25,
      "has_next": true,
      "has_previous": false
    }
  },
  "msg": "成功"
}
```

### 2.2 获取单个课程详情
```http
GET /api/v1/courses/{course_id}
Authorization: Bearer <jwt_token>  // 可选，影响is_enrolled字段
```

**响应:**
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "title": "AI Logo设计入门",
    "slug": "ai-logo-design-basics",
    "description": "详细的课程描述...",
    "course_level": "beginner",
    "course_type": "free",
    "price": "0.00",
    "cover_image_url": "https://cdn.uaiedu.com/courses/logo-basics.jpg",
    "lesson_count": 8,
    "duration_minutes": 240,
    "is_enrolled": true,
    "lessons": [
      {
        "id": 1,
        "title": "什么是AI设计",
        "description": "AI设计的基础概念",
        "order_index": 1,
        "lesson_type": "video",
        "duration_minutes": 30,
        "is_free": true,
        "is_completed": false
      }
    ],
    "progress": {
      "completed_lessons": 2,
      "total_lessons": 8,
      "completion_percentage": 25
    }
  },
  "msg": "成功"
}
```

### 2.3 注册课程
```http
POST /api/v1/courses/{course_id}/enroll
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "enrollment_type": "free"  // free | paid | premium
}
```

---

## 📖 3. 学习进度API

### 3.1 获取我的课程
```http
GET /api/v1/my/courses?status=in_progress&page=1&size=10
Authorization: Bearer <jwt_token>
```

**查询参数:**
- `status`: all | not_started | in_progress | completed

### 3.2 更新学习进度
```http
POST /api/v1/lessons/{lesson_id}/progress
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "completion_percentage": 80,
  "status": "in_progress"  // not_started | in_progress | completed
}
```

**响应:**
```json
{
  "status": 200,
  "data": {
    "lesson_id": 1,
    "completion_percentage": 80,
    "status": "in_progress",
    "started_at": "2025-08-31T10:00:00Z",
    "last_accessed_at": "2025-08-31T11:30:00Z"
  },
  "msg": "进度更新成功"
}
```

### 3.3 获取课程学习统计
```http
GET /api/v1/my/stats
Authorization: Bearer <jwt_token>
```

**响应:**
```json
{
  "status": 200,
  "data": {
    "total_courses": 5,
    "completed_courses": 2,
    "in_progress_courses": 3,
    "total_lessons_completed": 45,
    "total_study_time_minutes": 1200,
    "current_streak_days": 7,
    "monthly_progress": {
      "august": {
        "lessons_completed": 15,
        "study_time_minutes": 450
      }
    }
  },
  "msg": "成功"
}
```

---

## 💳 4. 订单支付API

### 4.1 创建订单
```http
POST /api/v1/orders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "items": [
    {
      "course_id": 1,
      "quantity": 1
    }
  ]
}
```

**响应:**
```json
{
  "status": 201,
  "data": {
    "order": {
      "id": 1,
      "order_number": "ORD202508310001",
      "total_amount": "199.00",
      "payment_status": "pending",
      "order_status": "created",
      "items": [
        {
          "course_id": 1,
          "course_title": "AI Logo设计进阶",
          "price": "199.00",
          "quantity": 1
        }
      ],
      "created_at": "2025-08-31T10:00:00Z"
    }
  },
  "msg": "订单创建成功"
}
```

### 4.2 发起支付
```http
POST /api/v1/orders/{order_id}/pay
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "payment_method": "alipay"  // alipay | wechat | stripe
}
```

**响应:**
```json
{
  "status": 200,
  "data": {
    "payment_url": "https://openapi.alipay.com/gateway.do?...",
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...",
    "order_number": "ORD202508310001"
  },
  "msg": "支付链接已生成"
}
```

### 4.3 查询订单状态
```http
GET /api/v1/orders/{order_id}
Authorization: Bearer <jwt_token>
```

### 4.4 获取我的订单
```http
GET /api/v1/my/orders?status=paid&page=1&size=10
Authorization: Bearer <jwt_token>
```

---

## ⚙️ 5. 系统配置API

### 5.1 获取系统配置
```http
GET /api/v1/config
```

**响应:**
```json
{
  "status": 200,
  "data": {
    "site_name": "UAI教育平台",
    "site_description": "专业的AI+设计在线教育平台",
    "support_email": "support@uaiedu.com",
    "payment_methods": ["alipay", "wechat"],
    "available_timezones": [
      "Asia/Shanghai",
      "America/New_York",
      "Europe/London"
    ]
  },
  "msg": "成功"
}
```

---

## 📊 MVP API优先级

### P0 APIs（MVP必需）
1. **认证**: 注册、登录、获取用户信息、刷新Token
2. **课程**: 课程列表、课程详情、注册免费课程
3. **学习**: 更新学习进度、获取我的课程
4. **配置**: 系统配置获取

### P1 APIs（增强体验）
1. **支付**: 创建订单、发起支付、查询订单
2. **用户**: 更新个人资料
3. **统计**: 学习统计数据

### P2 APIs（后续扩展）
1. **搜索**: 课程搜索
2. **社交**: 用户互动、评论
3. **管理**: 后台管理接口

---

## 🚨 错误码规范

| 状态码 | 说明 | 场景 |
|--------|------|------|
| 200 | 成功 | 正常请求 |
| 201 | 创建成功 | 注册、创建订单等 |
| 400 | 请求错误 | 参数验证失败 |
| 401 | 未认证 | Token过期或无效 |
| 403 | 权限不足 | 访问受限资源 |
| 404 | 资源不存在 | 课程不存在等 |
| 409 | 冲突 | 重复注册等 |
| 500 | 服务器错误 | 系统异常 |

---

## 🔧 开发约定

### 命名规范
- URL使用小写字母和连字符
- 字段名使用snake_case
- 时间字段统一使用ISO 8601格式

### 分页参数
- `page`: 页码，从1开始
- `size`: 每页数量，默认10，最大100

### 排序参数
- `order_by`: 排序字段
- `order`: asc | desc

### 测试数据
开发阶段提供标准测试数据和Mock API响应

---

*此API文档将与开发进度同步更新，确保前后端开发的一致性*