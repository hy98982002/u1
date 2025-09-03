# API Specification - API接口规范文档

## 基础规范

### 请求格式
- **Base URL**: `http://localhost:8000/api/` (开发环境)
- **认证方式**: JWT Bearer Token
- **内容类型**: `application/json`

### 响应格式
```json
{
  "status": 200,        // HTTP状态码
  "data": {},          // 响应数据
  "msg": "Success"     // 响应消息
}
```

## 用户认证模块 (/api/auth/)

### 用户注册
```http
POST /api/auth/register/
Content-Type: application/json

{
  "phone": "13800138000",
  "verification_code": "123456",
  "nickname": "用户昵称"
}
```

**响应:**
```json
{
  "status": 201,
  "data": {
    "user": {
      "id": 1,
      "phone": "13800138000",
      "nickname": "用户昵称",
      "avatar": null,
      "is_member": false,
      "member_level": null,
      "member_expires": null
    },
    "tokens": {
      "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
      "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
    }
  },
  "msg": "注册成功"
}
```

### 用户登录
```http
POST /api/auth/login/
Content-Type: application/json

{
  "phone": "13800138000",
  "verification_code": "123456"
}
```

### 获取用户信息
```http
GET /api/auth/profile/
Authorization: Bearer <access_token>
```

## 课程模块 (/api/courses/)

### 获取课程列表
```http
GET /api/courses/?stage=tiyan&page=1&limit=12
Authorization: Bearer <access_token>
```

**查询参数:**
- `stage`: 课程阶段 (tiyan/rumen/jingjin/shizhan/xiangmuluodi)
- `page`: 页码
- `limit`: 每页数量
- `search`: 搜索关键词

**响应:**
```json
{
  "status": 200,
  "data": {
    "count": 24,
    "next": "http://localhost:8000/api/courses/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "title": "Illustrator快速制作Logo",
        "stage": "tiyan",
        "stage_display": "体验专区",
        "price": "0.00",
        "original_price": "199.00",
        "cover_image": "tiyan-logo-cover.jpg",
        "duration": "2小时",
        "students_count": 1250,
        "rating": 4.8,
        "reviews_count": 89,
        "instructor": {
          "name": "张老师",
          "avatar": "avatar1.png"
        },
        "is_free": true,
        "is_member_only": false,
        "created_at": "2025-01-15T10:30:00Z"
      }
    ]
  },
  "msg": "获取成功"
}
```

### 获取课程详情
```http
GET /api/courses/{course_id}/
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "status": 200,
  "data": {
    "id": 1,
    "title": "Illustrator快速制作Logo",
    "description": "通过本课程，您将快速掌握AI Logo制作的基本技能...",
    "stage": "tiyan",
    "price": "0.00",
    "cover_image": "tiyan-logo-cover.jpg",
    "chapters": [
      {
        "id": 1,
        "title": "第一章：AI基础操作",
        "lessons": [
          {
            "id": 1,
            "title": "AI界面介绍",
            "duration": "15:30",
            "is_free": true,
            "video_url": "lesson1.mp4"
          }
        ]
      }
    ],
    "instructor": {
      "name": "张老师",
      "bio": "资深平面设计师，10年行业经验"
    },
    "requirements": ["无需基础", "安装Adobe Illustrator"],
    "learning_outcomes": ["掌握AI基本操作", "独立制作Logo"]
  },
  "msg": "获取成功"
}
```

## 购物车模块 (/api/cart/)

### 添加商品到购物车
```http
POST /api/cart/items/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "course_id": 1
}
```

### 获取购物车内容
```http
GET /api/cart/
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "status": 200,
  "data": {
    "items": [
      {
        "id": 1,
        "course": {
          "id": 2,
          "title": "Logo设计基础教程",
          "price": "199.00",
          "cover_image": "rumen-logo-cover.jpg"
        },
        "added_at": "2025-01-29T14:30:00Z"
      }
    ],
    "total_amount": "199.00",
    "items_count": 1
  },
  "msg": "获取成功"
}
```

## 会员模块 (/api/membership/)

### 获取会员等级和权益
```http
GET /api/membership/levels/
```

**响应:**
```json
{
  "status": 200,
  "data": {
    "levels": [
      {
        "id": 1,
        "name": "月会员",
        "price": "129.00",
        "duration_months": 1,
        "benefits": [
          "会员专区访问权限",
          "1张普通课7折券",
          "就业班9折券"
        ]
      }
    ]
  },
  "msg": "获取成功"
}
```

### 购买会员
```http
POST /api/membership/purchase/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "level_id": 1,
  "payment_method": "alipay"
}
```

## 订单模块 (/api/orders/)

### 创建订单
```http
POST /api/orders/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "items": [
    {
      "course_id": 2,
      "price": "139.30"  // 应用优惠券后价格
    }
  ],
  "coupon_code": "NEW_USER_70",
  "payment_method": "alipay"
}
```

**响应:**
```json
{
  "status": 201,
  "data": {
    "order_id": "ORD20250129001",
    "payment_url": "https://qr.alipay.com/...",
    "total_amount": "139.30",
    "original_amount": "199.00",
    "discount_amount": "59.70",
    "expires_at": "2025-01-29T15:44:30Z"
  },
  "msg": "订单创建成功"
}
```

### 查询订单状态
```http
GET /api/orders/{order_id}/status/
Authorization: Bearer <access_token>
```

## 优惠券模块 (/api/coupons/)

### 获取用户可用优惠券
```http
GET /api/coupons/available/
Authorization: Bearer <access_token>
```

**响应:**
```json
{
  "status": 200,
  "data": {
    "coupons": [
      {
        "id": 1,
        "code": "NEW_USER_70",
        "name": "新用户7折券",
        "discount_type": "percentage",
        "discount_value": 30,
        "min_amount": "100.00",
        "expires_at": "2025-02-05T23:59:59Z",
        "applicable_stages": ["rumen", "jingjin", "shizhan", "xiangmuluodi"]
      }
    ]
  },
  "msg": "获取成功"
}
```

## 数据追踪模块 (/api/analytics/)

### 上报用户事件
```http
POST /api/analytics/events/
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "event_name": "course.play.start",
  "event_data": {
    "course_id": 1,
    "lesson_id": 3,
    "timestamp": "2025-01-29T14:30:00Z"
  }
}
```

### 获取学习进度
```http
GET /api/analytics/progress/?course_id=1
Authorization: Bearer <access_token>
```

## 错误响应格式

### 400 Bad Request
```json
{
  "status": 400,
  "data": null,
  "msg": "请求参数错误",
  "errors": {
    "phone": ["手机号格式不正确"]
  }
}
```

### 401 Unauthorized
```json
{
  "status": 401,
  "data": null,
  "msg": "认证失败，请重新登录"
}
```

### 404 Not Found
```json
{
  "status": 404,
  "data": null,
  "msg": "资源不存在"
}
```

## 状态码对照表

| 状态码 | 含义 | 使用场景 |
|-------|------|----------|
| 200 | 成功 | 获取数据成功 |
| 201 | 创建成功 | 注册、创建订单成功 |
| 400 | 请求错误 | 参数验证失败 |
| 401 | 认证失败 | Token过期或无效 |
| 403 | 权限不足 | 访问会员专区无权限 |
| 404 | 资源不存在 | 课程或订单不存在 |
| 500 | 服务器错误 | 系统异常 |

---
*该API规范基于PRD v2.1业务需求设计，为前后端开发提供接口对接标准*