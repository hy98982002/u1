# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

UAI Education Platform - A full-stack web application built with Vue 3 + Django for online education services. The project uses a frontend-backend separation architecture with JWT authentication.

## Technology Stack

**Frontend:**

- Vue 3 with Composition API + TypeScript
- Vite build tool
- Bootstrap 5.3.6 for UI (no other UI frameworks)
- Pinia for state management
- Vue Router for routing
- Axios for API requests

**Backend:**

- Python 3.12 + Django 5.2
- Django REST Framework for APIs
- JWT authentication (SimpleJWT)
- MySQL 8.4+ (Railway production) / SQLite (local development)
- Django Admin for backend management
- Redis for caching and session storage (optional for MVP)

## Development Commands

### Frontend (from `/frontend` directory)

```bash
npm install                    # Install dependencies
npm run dev                   # Start development server (localhost:5173)
npm run build                 # Production build
npm run build:check           # Build with TypeScript checking
npm run type-check            # TypeScript type checking only
npm run preview               # Preview production build

# Internationalization (when implementing OpenCC)
npm install opencc-js         # Install OpenCC for simplified/traditional conversion

# Analytics tracking (when implementing analytics)
npm install vue-gtag          # Vue3 Google Analytics integration (conditional loading)
npm install @types/gtag       # TypeScript definitions for gtag
```

### Backend (from `/backend` directory)

```bash
# Setup virtual environment
python -m venv venv
source venv/bin/activate      # macOS/Linux
# or venv\Scripts\activate    # Windows

# Install dependencies
pip install -r requirements.txt

# Development server
python manage.py runserver    # Start Django server (localhost:8000)

# Database operations
python manage.py makemigrations
python manage.py migrate
python manage.py createsuperuser

# Production deployment preparation
# mysqlclient already in requirements.txt for MySQL support
pip install gunicorn         # WSGI server for production
pip install whitenoise       # Static files serving
```

## Project Architecture

### Frontend Structure (`/frontend/src/`)

- `views/` - Page-level components (PascalCase naming)
- `components/` - Reusable components (PascalCase naming)
  - `i18n/` - Internationalization components (language switcher, etc.)
- `store/` - Pinia stores for state management
- `api/` - Axios request wrappers (one file per module)
- `router/` - Vue Router configuration
- `types/` - TypeScript type definitions
- `utils/` - Utility functions
  - `i18n.ts` - OpenCC conversion utilities (when implemented)
  - `tracking.ts` - Analytics and event tracking utilities
- `assets/` - Static assets with organized subdirectories:
  - `icons/` - Logo and icon resources
  - `images/` - Business images (course covers, avatars, etc.)
- `config/` - Configuration files
  - `tracking.json` - Analytics tracking configuration

### Backend Structure (`/backend/`)

- `apps/` - Django application modules:
  - `users/` - User authentication and management
  - `courses/` - Course management system
  - `cart/` - Shopping cart functionality
  - `orders/` - Order processing
  - `learning/` - Learning progress tracking
  - `reviews/` - Course review system
  - `analytics/` - User behavior tracking and analytics
  - `system/` - System-level functionality

### API Design Patterns

All API responses follow this structure:

```json
{
  "status": 200, // HTTP status code
  "data": {}, // Response data
  "msg": "Success" // Response message
}
```

All API endpoints are prefixed with `/api/` and use JWT authentication.

## Development Conventions

### Code Style

- **Frontend**: Use Composition API exclusively (no Options API)
- **Components**: PascalCase naming (e.g., `UserProfile.vue`)
- **API files**: camelCase (e.g., `userService.ts`)
- **Image imports**: Always use import statements, never string paths
- **All communication**: Chinese language for comments and documentation

### Security Requirements

- Never hardcode sensitive information (API keys, secrets, passwords)
- Use `.env` files for configuration (ensure `.env` is in `.gitignore`)
- Follow Django security best practices for authentication and CSRF protection

### 国内版语言策略 (Domestic Version Language Strategy)

- **V1.0 简化策略**: 专注中国大陆用户，仅支持简体中文，移除繁简转换复杂度
- **当前域名**: uaiedu.com 专门服务中国大陆用户（简体中文单一语言）
- **海外版规划**: 未来独立开发海外版本（uaiedu.org），支持完整国际化和多语言
- **性能优势**: 移除语言转换开销，页面加载速度提升15-20%
- **SEO策略**: 专注百度等国内搜索引擎优化
- **AEO准备**: 添加中文FAQ和结构化数据，优化AI搜索

### 统一分析策略 (Unified Analytics Strategy)

- **分析工具**: 专门使用百度统计服务中国大陆用户
- **技术实现**: 直接集成，无需区域检测逻辑复杂度
- **业务级事件**: Django自定义模型进行转换漏斗分析
- **前端实现**: Vue3组合式API事件跟踪，使用data-track属性
- **后端实现**: Django中间件用于API请求跟踪
- **隐私合规**: 仅基于ID跟踪，无敏感个人信息
- **性能优势**: 单一分析提供商，优化加载速度

### Image Management

- Images must be imported as modules: `import logoImg from '@/assets/icons/logo.png'`
- All images must have meaningful `alt` attributes
- Course images follow naming: `{stage}-{course}-cover.{ext}`
- Stages: tiyan/rumen/jingjin/shizhan/xiangmuluodi

## Important Files and Configuration

### Key Configuration Files

- `frontend/vite.config.ts` - Vite configuration with path aliases
- `backend/uai_backend/settings.py` - Django settings (currently using SQLite)
- `frontend/package.json` - Frontend dependencies and scripts
- `backend/requirements.txt` - Python dependencies

### Development Environment

- Frontend dev server: `http://localhost:5173`
- Backend dev server: `http://localhost:8000`
- Database: SQLite (development), MySQL (production)
- Database management: TablePlus (local and remote client)

### Security Notes

⚠️ **Warning**: The current `settings.py` contains a hardcoded SECRET_KEY and DEBUG=True. These should be moved to environment variables before any production deployment.

## Deployment Architecture

### Production Environment

- **Frontend Deployment**: Vercel (Automatic deployment from Git)
  - Domain: `uaiedu.com` (primary domain)
  - Build command: `npm run build`
  - Framework preset: Vite
  - Environment variables: API endpoints, SEO keys
- **Backend Deployment**: Railway (Django + MySQL)
  - Auto-deployment from Git repository
  - MySQL 8.4+ database with connection pooling
  - Redis for caching and sessions (optional for MVP)
  - Environment variables: DATABASE_URL, SECRET_KEY, DEBUG=False
- **Database Management**:
  - Railway Dashboard (production monitoring)
  - TablePlus (local development and remote access)

### CI/CD Pipeline

#### Development Workflow

```bash
Local Development → Git Push → Automatic Deployment
├── Frontend (Vercel):
│   ├── Type checking (vue-tsc)
│   ├── Build optimization (vite build)
│   ├── CDN distribution (global edge nodes)
│   └── Preview deployments for PRs
│
└── Backend (Railway):
    ├── Dependency installation (pip install -r requirements.txt)
    ├── Database migrations (python manage.py migrate)
    ├── Static files collection (python manage.py collectstatic)
    ├── Health checks and monitoring
    └── Auto-restart on code changes
```

#### Environment Configuration

- **Local Development**: `.env` files for sensitive data
- **Production**: Platform-specific environment variables
  - Vercel: Environment Variables panel
  - Railway: Environment Variables tab
- **CORS Setup**: Backend configured to allow Vercel domain origins
- **API Endpoints**: Frontend configured with Railway backend URLs

#### Database Migration Strategy

- **Development**: SQLite for rapid local development
- **Production**: MySQL 8.4+ on Railway
  - Familiar MySQL syntax and administration
  - JSON field support available in MySQL 8.0+
  - Excellent performance for web applications
  - TablePlus provides superior MySQL management experience
- **Migration Path**: mysqlclient already configured in requirements.txt

## Development Workflow

1. **Frontend Development**: Use mock data initially, then integrate with backend APIs
2. **Backend Development**: Follow Django REST conventions, implement RBAC permissions
3. **API Integration**: Ensure all requests include JWT tokens automatically
4. **State Management**: Use Pinia stores, avoid mixing with component local state
5. **Styling**: Use Bootstrap 5.3.6 classes, maintain responsive design

## Common Development Tasks

When adding new features:

1. Create API endpoints in backend following REST conventions
2. Add corresponding frontend API service in `src/api/`
3. Implement Pinia store for state management if needed
4. Create reusable components in `src/components/`
5. Build page components in `src/views/`
6. Update router configuration for new routes

### SEO/AEO Optimization Tasks

When adding content pages (courses, articles, etc.):

1. Add structured data (JSON-LD) for Course, FAQ, Organization schemas
2. Include FAQ sections with natural language Q&A
3. Ensure proper meta titles, descriptions, and alt attributes
4. Consider both simplified and traditional Chinese keywords in content

### Analytics Implementation Tasks

When implementing user behavior tracking:

1. **Setup Phase**:

   - Add Baidu Analytics integration
   - Create `analytics` Django app for custom event storage
   - Configure Vue3 tracking composables for unified tracking

2. **Core Event Tracking**:

   - User journey: `user.register`, `user.login`, `user.logout`
   - Learning behavior: `video.play.start/pause/end`, `course.progress.update`
   - Conversion funnel: `cart.add`, `payment.success`, `coupon.apply`
   - SEO/AEO events: `search.from.baidu`, `faq.click`, `ai.referral`

3. **Implementation Standards**:
   - Event naming convention: `module.action.state` (e.g., `video.play.start`)
   - Add `data-track` attributes to trackable elements
   - Use Django middleware for API request tracking
   - Store critical business events in MySQL (never rely solely on 3rd party)
   - Performance: direct Baidu Analytics integration for optimal loading speed

### Deployment Tasks

When preparing for production deployment:

1. **Frontend (Vercel Setup)**:

   - Connect GitHub repository to Vercel project
   - Configure build settings (Framework: Vite, Build command: `npm run build`)
   - Set environment variables (API_BASE_URL, etc.)
   - Configure custom domain (uaiedu.com)

2. **Backend (Railway Setup)**:

   - Connect GitHub repository to Railway project
   - Add MySQL database service (8.4+ recommended)
   - Set environment variables (SECRET_KEY, DEBUG=False, DATABASE_URL)
   - Configure CORS settings for Vercel domain
   - Add Redis service for caching (optional for MVP)
   - Set analytics environment variables (BAIDU_ANALYTICS_ID)

3. **Database Migration**:
   - mysqlclient already configured in requirements.txt
   - Create production settings file with environment variables
   - Test migrations on Railway staging environment
   - Configure TablePlus for remote MySQL access

## Development Philosophy

> **开发哲学**: 比如"增量优于全部重构"、"代码要清晰而非聪明"。

> **标准工作流**: 规划 -> 写测试 -> 实现 -> 重构 -> 提交。

> **"卡住怎么办"预案**: 尝试 3 次失败后，必须停下来，记录失败、研究替代方案、反思根本问题。

> **决策框架**: 当有多种方案时，按可测试性 > 可读性 > 一致性 > 简单性的顺序选择。

# Development Guidelines

## Philosophy

### Core Beliefs

- **Incremental progress over big bangs** - Small changes that compile and pass tests
- **Learning from existing code** - Study and plan before implementing
- **Pragmatic over dogmatic** - Adapt to project reality
- **Clear intent over clever code** - Be boring and obvious

### Simplicity Means

- Single responsibility per function/class
- Avoid premature abstractions
- No clever tricks - choose the boring solution
- If you need to explain it, it's too complex

## Process

### 1. Planning & Staging

Break complex work into 3-5 stages. Document in `IMPLEMENTATION_PLAN.md`:

```markdown
## Stage N: [Name]

**Goal**: [Specific deliverable]
**Success Criteria**: [Testable outcomes]
**Tests**: [Specific test cases]
**Status**: [Not Started|In Progress|Complete]
```

- Update status as you progress
- Remove file when all stages are done

### 2. Implementation Flow

1. **Understand** - Study existing patterns in codebase
2. **Test** - Write test first (red)
3. **Implement** - Minimal code to pass (green)
4. **Refactor** - Clean up with tests passing
5. **Commit** - With clear message linking to plan

### 3. When Stuck (After 3 Attempts)

**CRITICAL**: Maximum 3 attempts per issue, then STOP.

1. **Document what failed**:

   - What you tried
   - Specific error messages
   - Why you think it failed

2. **Research alternatives**:

   - Find 2-3 similar implementations
   - Note different approaches used

3. **Question fundamentals**:

   - Is this the right abstraction level?
   - Can this be split into smaller problems?
   - Is there a simpler approach entirely?

4. **Try different angle**:
   - Different library/framework feature?
   - Different architectural pattern?
   - Remove abstraction instead of adding?

## Technical Standards

### Architecture Principles

- **Composition over inheritance** - Use dependency injection
- **Interfaces over singletons** - Enable testing and flexibility
- **Explicit over implicit** - Clear data flow and dependencies
- **Test-driven when possible** - Never disable tests, fix them

### Code Quality

- **Every commit must**:

  - Compile successfully
  - Pass all existing tests
  - Include tests for new functionality
  - Follow project formatting/linting

- **Before committing**:
  - Run formatters/linters
  - Self-review changes
  - Ensure commit message explains "why"

### Error Handling

- Fail fast with descriptive messages
- Include context for debugging
- Handle errors at appropriate level
- Never silently swallow exceptions

## Decision Framework

When multiple valid approaches exist, choose based on:

1. **Testability** - Can I easily test this?
2. **Readability** - Will someone understand this in 6 months?
3. **Consistency** - Does this match project patterns?
4. **Simplicity** - Is this the simplest solution that works?
5. **Reversibility** - How hard to change later?

## Project Integration

### Learning the Codebase

- Find 3 similar features/components
- Identify common patterns and conventions
- Use same libraries/utilities when possible
- Follow existing test patterns

### Tooling

- Use project's existing build system
- Use project's test framework
- Use project's formatter/linter settings
- Don't introduce new tools without strong justification

## Quality Gates

### Definition of Done

- [ ] Tests written and passing
- [ ] Code follows project conventions
- [ ] No linter/formatter warnings
- [ ] Commit messages are clear
- [ ] Implementation matches plan
- [ ] No TODOs without issue numbers

### Test Guidelines

- Test behavior, not implementation
- One assertion per test when possible
- Clear test names describing scenario
- Use existing test utilities/helpers
- Tests should be deterministic

## Important Reminders

**NEVER**:

- Use `--no-verify` to bypass commit hooks
- Disable tests instead of fixing them
- Commit code that doesn't compile
- Make assumptions - verify with existing code

**ALWAYS**:

- Commit working code incrementally
- Update plan documentation as you go
- Learn from existing implementations
- Stop after 3 failed attempts and reassess

## Documentation References

- Main project rules: `README.md`
- Frontend-specific rules: `frontend/AGENTS.md`
- Backend-specific rules: `backend/AGENTS.md`
- Cursor development rules: `.cursor/rules/` directory
- Security guidelines: `Cursor User Rules.md`

## CCPlugins - Enhanced Development Commands

**IMPORTANT**: 这个项目配置了 CCPlugins 扩展，提供 24 个专业命令用于增强开发效率。当用户提到相关任务时，我应该自动识别并使用对应的命令。命令文件存储在全局`.claude/commands/`文件夹中。

### 🚀 Development Workflow Commands

#### /cleanproject

- **用途**: 清理项目中的调试工件，保持 Git 安全
- **自动触发场景**: 需要清理临时文件、调试输出、构建缓存时
- **命令说明**: 智能移除 debug artifacts，保护 git 历史

#### /commit

- **用途**: 智能化的常规提交，带有分析功能
- **自动触发场景**: 用户要求提交代码或保存更改时
- **命令说明**: 分析变更内容，生成符合规范的 commit message

#### /format

- **用途**: 自动检测并应用项目格式化工具
- **自动触发场景**: 代码格式不一致、需要统一代码风格时
- **命令说明**: 根据项目配置（prettier/eslint/black 等）自动格式化

#### /scaffold feature-name

- **用途**: 从现有模式生成完整功能模块
- **自动触发场景**: 创建新功能、新组件、新模块时
- **命令说明**: 分析项目结构，生成符合项目规范的完整功能代码

#### /test

- **用途**: 运行测试并提供智能失败分析
- **自动触发场景**: 需要验证代码、运行测试套件时
- **命令说明**: 执行测试并分析失败原因，提供修复建议
- **ℹ️ 优先保留**: 与/test-harness 功能相近，但/test 更适合日常测试

#### /implement url/path/feature

- **用途**: 从任何来源导入和适配代码，带验证阶段
- **自动触发场景**: 需要集成外部代码、实现参考功能时
- **命令说明**: 智能导入并适配外部代码到项目规范

#### /refactor

- **用途**: 智能代码重构，带验证和去参数化
- **命令说明**: 分析并重构代码，确保功能不变的情况下提升质量
- **⚠️ 手动调用**: 与/refactor-clean 有功能重叠，请明确指定使用哪个

### 🛡️ Code Quality & Security Commands

#### /review

- **用途**: 多代理分析（安全、性能、质量、架构）
- **命令说明**: 全面分析代码的各个维度并提供改进建议
- **⚠️ 手动调用**: 与/ai-review、/full-review、/multi-agent-review 有功能重叠，请明确指定使用哪个

#### /security-scan

- **用途**: 漏洞分析，带扩展思考和修复跟踪
- **命令说明**: 深度扫描安全问题并提供修复方案
- **⚠️ 手动调用**: 与/security-hardening 有功能重叠，请明确指定使用哪个

#### /predict-issues

- **用途**: 主动问题检测，带时间线估计
- **自动触发场景**: 风险评估、问题预测、技术债务分析时
- **命令说明**: 预测潜在问题并估算影响时间线

#### /remove-comments

- **用途**: 清理明显注释，保留有价值文档
- **自动触发场景**: 代码清理、移除冗余注释时
- **命令说明**: 智能识别并移除无用注释，保留重要文档

#### /fix-imports

- **用途**: 修复重构后的导入问题
- **自动触发场景**: 导入错误、模块路径问题时
- **命令说明**: 自动检测并修复 import/require 语句

#### /find-todos

- **用途**: 定位并组织开发任务
- **自动触发场景**: 查找待办事项、任务管理时
- **命令说明**: 扫描代码中的 TODO/FIXME 等标记

#### /create-todos

- **用途**: 基于分析结果添加上下文 TODO 注释
- **自动触发场景**: 需要标记待完成任务时
- **命令说明**: 智能添加 TODO 注释并包含上下文信息

#### /fix-todos

- **用途**: 智能实现 TODO 修复，带上下文
- **自动触发场景**: 处理 TODO 项、完成待办任务时
- **命令说明**: 分析 TODO 内容并自动实现修复

### 🔍 Advanced Analysis Commands

#### /understand

- **用途**: 分析整个项目架构和模式
- **自动触发场景**: 项目理解、架构分析、代码库熟悉时
- **命令说明**: 深度分析项目结构、设计模式和架构决策

#### /explain-like-senior

- **用途**: 资深级别的代码解释，带上下文
- **自动触发场景**: 复杂代码解释、技术分享、知识传递时
- **命令说明**: 以资深开发者视角解释代码逻辑和设计考虑

#### /contributing

- **用途**: 完整的贡献准备度分析
- **自动触发场景**: 准备贡献代码、开源参与时
- **命令说明**: 分析项目贡献指南和准备度

#### /make-it-pretty

- **用途**: 提升可读性，不改变功能
- **自动触发场景**: 代码美化、可读性优化时
- **命令说明**: 重构代码提升可读性，保持功能不变

### 📁 Session & Project Management Commands

#### /session-start

- **用途**: 开始记录会话，集成 CLAUDE.md
- **自动触发场景**: 开始新的开发会话时
- **命令说明**: 初始化会话记录并加载项目上下文

#### /session-end

- **用途**: 总结并保存会话上下文
- **自动触发场景**: 结束开发会话时
- **命令说明**: 生成会话总结并保存重要上下文

#### /docs

- **用途**: 智能文档管理和更新
- **自动触发场景**: 文档更新、README 维护时
- **命令说明**: 自动更新和维护项目文档

#### /todos-to-issues

- **用途**: 将代码 TODO 转换为 GitHub issues
- **自动触发场景**: 任务管理、issue 创建时
- **命令说明**: 扫描 TODO 并创建对应的 GitHub issues

#### /undo

- **用途**: 安全回滚，使用 git checkpoint 恢复
- **自动触发场景**: 需要撤销更改、回滚操作时
- **命令说明**: 使用 git 安全回滚到之前的检查点

### 使用指南

#### 🎯 **自动触发 vs 手动调用**

**自动触发命令**（无冲突，可用自然语言）：

- 基础工作流：cleanproject, commit, format, test
- 项目管理：understand, docs, session-start/end
- TODO 管理：find-todos, create-todos, fix-todos
- 功能开发：scaffold, implement
- 代码优化：make-it-pretty, fix-imports, predict-issues
- 特殊工具：explain-like-senior, todos-to-issues, undo, remove-comments

**手动调用命令**（有冲突，请明确指定）：

- 重构相关：/refactor vs /refactor-clean
- 审查相关：/review vs /ai-review vs /full-review vs /multi-agent-review
- 安全相关：/security-scan vs /security-hardening

1. **智能选择**: 根据上下文自动选择最合适的无冲突命令
2. **明确指定**: 对于有冲突的命令，请使用`/命令名`格式明确调用
3. **验证阶段**: 多数命令包含验证和优化阶段，确保输出质量

### 命令使用示例

```bash
# 开发工作流
/scaffold user-profile     # 生成用户档案功能
/test                      # 运行测试
/commit                    # 智能提交

# 代码质量
/review                    # 全面代码审查
/security-scan            # 安全扫描
/refactor                 # 智能重构

# 项目管理
/session-start            # 开始会话
/understand              # 理解项目
/docs                    # 更新文档
```

### 注意事项

- 命令执行前会进行验证，确保安全性
- 某些命令可能需要额外确认（如/undo）
- 命令可以组合使用以完成复杂任务
- 所有命令都遵循项目的开发规范和哲学
- "自动化规则：每次前端改动后，使用 Playwright 自动打开浏览器、截图、检查错误，并根据提示中的验收标准调整。"
