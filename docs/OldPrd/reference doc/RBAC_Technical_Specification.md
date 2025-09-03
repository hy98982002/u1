# UAI教育平台 RBAC权限管理系统技术规范 v1.0

## 📋 文档概述

**文档目标**：为UAI教育平台构建基于角色的访问控制(RBAC)系统的完整技术规范  
**适用范围**：Vue 3 + Django REST Framework 架构  
**更新日期**：2025-08-31  
**版本**：v1.0  

---

## 🎯 1. RBAC系统概述

### 1.1 目标与理念

**核心目标**：为UAI教育平台构建完整的基于角色的访问控制系统，支撑7层课程体系、会员权益、多角色协作的复杂业务需求。

**设计理念**：
- **最小权限原则**：用户只能访问完成其工作职责所必需的资源
- **角色分离**：明确区分不同业务职能的权限边界  
- **数据安全**：敏感数据分级保护，审计日志全面记录
- **渐进式集成**：兼容现有架构，无需重构

### 1.2 业务价值

- **支撑复杂业务场景**：7层课程体系 + 多类型会员权益
- **提升安全性**：细粒度权限控制 + 审计追踪
- **降低运营成本**：自动化权限管理 + 智能角色推荐
- **支持业务扩展**：多租户架构预留 + 插件化扩展

---

## 👥 2. 角色体系设计

### 2.1 核心角色定义

| 角色名称 | 角色代码 | 人员规模 | 核心职责 | 权限等级 |
|---------|----------|----------|----------|----------|
| **超级管理员** | `super_admin` | 1-2人 | 系统配置、权限分配、危险操作审批 | L4 - 最高权限 |
| **平台管理员** | `platform_admin` | 2-5人 | 业务运营管理权限（除系统配置外） | L3 - 管理权限 |
| **教学主管** | `education_manager` | 1-3人 | 教学内容全流程管理 | L3 - 教学管理 |
| **课程讲师** | `instructor` | 5-20人 | 课程创建、编辑和发布 | L2 - 内容创作 |
| **运营专员** | `operations` | 2-8人 | 营销活动、会员管理、优惠券管理 | L2 - 运营管理 |
| **SEO专员** | `seo_specialist` | 1-3人 | SEO相关内容和配置管理 | L2 - 内容优化 |
| **客服代表** | `customer_service` | 2-10人 | 用户信息查看、订单处理 | L1 - 服务支持 |
| **付费会员** | `premium_member` | 目标1000+ | 会员专区访问、专属优惠 | L1 - 会员权益 |
| **免费用户** | `free_user` | 目标10000+ | 体验课程、基础功能 | L0 - 基础用户 |
| **访客** | `guest` | 无限制 | 公开内容浏览、用户注册 | L0 - 公开访问 |

### 2.2 角色继承关系

```
Super Admin (L4)
    ├── Platform Admin (L3)
    │   ├── Education Manager (L3)
    │   │   └── Instructor (L2)
    │   ├── Operations (L2)
    │   ├── SEO Specialist (L2)
    │   └── Customer Service (L1)
    ├── Premium Member (L1)
    │   └── Free User (L0)
    │       └── Guest (L0)
```

---

## 🏗️ 3. 技术架构设计

### 3.1 后端技术栈

#### 3.1.1 核心组件选型

```python
# 现有技术栈扩展 - 保持架构兼容性
Django 5.2 + Django REST Framework  # 保持现有架构
+ django-guardian                    # 对象级权限控制  
+ django-rules                       # 业务规则引擎
+ django-audit-fields               # 审计日志
+ redis                             # 权限缓存
+ celery                            # 异步权限同步
```

#### 3.1.2 数据库模型设计

```python
# backend/apps/rbac/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Role(models.Model):
    """角色表 - 支持层级和继承"""
    name = models.CharField(max_length=50, unique=True, verbose_name="角色名称")
    code = models.CharField(max_length=20, unique=True, verbose_name="角色代码") 
    description = models.TextField(verbose_name="角色描述")
    is_system = models.BooleanField(default=False, verbose_name="系统角色")  # 系统角色不可删除
    parent = models.ForeignKey('self', null=True, blank=True, on_delete=models.SET_NULL, verbose_name="父角色")
    level = models.IntegerField(default=0, verbose_name="权限等级")  # 0-4权限等级
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'rbac_roles'
        verbose_name = "角色"
        verbose_name_plural = "角色管理"

class Permission(models.Model):
    """权限表 - 资源+动作模式"""  
    resource = models.CharField(max_length=50, verbose_name="资源类型")  # course, user, order
    action = models.CharField(max_length=20, verbose_name="操作动作")     # create, read, update, delete
    conditions = models.JSONField(default=dict, verbose_name="权限条件") # 动态权限条件
    description = models.CharField(max_length=200, verbose_name="权限描述")
    is_system = models.BooleanField(default=False, verbose_name="系统权限")
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'rbac_permissions'
        unique_together = ['resource', 'action']
        verbose_name = "权限"
        verbose_name_plural = "权限管理"
    
class RolePermission(models.Model):
    """角色权限关联表 - 支持权限拒绝"""
    role = models.ForeignKey(Role, on_delete=models.CASCADE, verbose_name="角色")
    permission = models.ForeignKey(Permission, on_delete=models.CASCADE, verbose_name="权限")
    granted = models.BooleanField(default=True, verbose_name="是否授权")  # 支持显式拒绝权限
    conditions = models.JSONField(default=dict, verbose_name="附加条件")
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        db_table = 'rbac_role_permissions'
        unique_together = ['role', 'permission']
        
class UserRole(models.Model):
    """用户角色关联表 - 支持临时权限"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="用户")
    role = models.ForeignKey(Role, on_delete=models.CASCADE, verbose_name="角色")
    granted_at = models.DateTimeField(auto_now_add=True, verbose_name="授权时间")
    expires_at = models.DateTimeField(null=True, blank=True, verbose_name="过期时间")  # 临时权限支持
    granted_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, 
                                 related_name='granted_roles', verbose_name="授权人")
    is_active = models.BooleanField(default=True, verbose_name="是否激活")
    
    class Meta:
        db_table = 'rbac_user_roles'
        unique_together = ['user', 'role']
        
    @property
    def is_expired(self):
        """检查角色是否过期"""
        if self.expires_at:
            return timezone.now() > self.expires_at
        return False

class AuditLog(models.Model):
    """审计日志表 - 记录所有权限敏感操作"""
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, verbose_name="操作用户")
    action = models.CharField(max_length=50, verbose_name="操作类型")  # CREATE, UPDATE, DELETE, VIEW
    resource = models.CharField(max_length=50, verbose_name="资源类型")  # course, user, order
    resource_id = models.IntegerField(verbose_name="资源ID")
    old_values = models.JSONField(default=dict, verbose_name="变更前数据")
    new_values = models.JSONField(default=dict, verbose_name="变更后数据") 
    ip_address = models.GenericIPAddressField(verbose_name="IP地址")
    user_agent = models.TextField(verbose_name="用户代理")
    timestamp = models.DateTimeField(auto_now_add=True, verbose_name="操作时间")
    risk_level = models.CharField(max_length=10, choices=[
        ('LOW', '低风险'),
        ('MEDIUM', '中风险'), 
        ('HIGH', '高风险'),
        ('CRITICAL', '严重风险')
    ], default='LOW', verbose_name="风险等级")
    
    class Meta:
        db_table = 'rbac_audit_logs'
        verbose_name = "审计日志"
        verbose_name_plural = "审计日志"
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['resource', 'timestamp']),
            models.Index(fields=['risk_level', 'timestamp']),
        ]
```

#### 3.1.3 权限检查服务

```python
# backend/apps/rbac/services.py
from typing import Dict, List, Optional, Any
from django.contrib.auth.models import User
from django.core.cache import cache
from .models import Role, Permission, UserRole, RolePermission
import json
import hashlib

class RBACService:
    """RBAC权限检查核心服务"""
    
    CACHE_TTL = {
        'user_permissions': 30 * 60,    # 用户权限缓存30分钟
        'user_roles': 60 * 60,          # 用户角色缓存1小时  
        'role_permissions': 24 * 60 * 60,  # 角色权限缓存24小时
    }
    
    def __init__(self):
        self.cache_prefix = "rbac:"
    
    def _cache_key(self, key_type: str, identifier: str) -> str:
        """生成缓存键"""
        return f"{self.cache_prefix}{key_type}:{identifier}"
    
    def get_user_permissions(self, user: User) -> List[Dict[str, Any]]:
        """获取用户的所有权限（包含继承权限）"""
        cache_key = self._cache_key("user_permissions", str(user.id))
        cached_permissions = cache.get(cache_key)
        
        if cached_permissions:
            return json.loads(cached_permissions)
        
        permissions = []
        user_roles = self.get_user_roles(user)
        
        for role in user_roles:
            role_permissions = self.get_role_permissions(role['id'])
            permissions.extend(role_permissions)
        
        # 去重并处理权限冲突（明确拒绝优先）
        unique_permissions = self._resolve_permission_conflicts(permissions)
        
        # 缓存权限结果
        cache.set(cache_key, json.dumps(unique_permissions), 
                 self.CACHE_TTL['user_permissions'])
        
        return unique_permissions
    
    def check_permission(self, user: User, resource: str, action: str, 
                        context: Optional[Dict] = None) -> bool:
        """核心权限检查方法"""
        # 超级管理员跳过检查
        if self.is_super_admin(user):
            return True
        
        user_permissions = self.get_user_permissions(user)
        
        for permission in user_permissions:
            if (permission['resource'] == resource and 
                permission['action'] == action and
                permission['granted']):
                
                # 检查附加条件
                if self._check_conditions(permission.get('conditions', {}), context):
                    return True
        
        return False
    
    def _check_conditions(self, conditions: Dict, context: Optional[Dict]) -> bool:
        """检查权限附加条件"""
        if not conditions or not context:
            return True
        
        # 示例条件检查逻辑
        if 'owner_only' in conditions and conditions['owner_only']:
            return context.get('owner_id') == context.get('user_id')
        
        if 'course_stage' in conditions:
            allowed_stages = conditions['course_stage']
            return context.get('course_stage') in allowed_stages
        
        return True
    
    def get_user_roles(self, user: User) -> List[Dict[str, Any]]:
        """获取用户角色（包含继承角色）"""
        cache_key = self._cache_key("user_roles", str(user.id))
        cached_roles = cache.get(cache_key)
        
        if cached_roles:
            return json.loads(cached_roles)
        
        # 获取用户直接角色
        user_roles = UserRole.objects.filter(
            user=user, 
            is_active=True
        ).exclude(
            expires_at__lt=timezone.now()  # 排除过期角色
        ).select_related('role')
        
        roles = []
        for user_role in user_roles:
            # 添加角色及其所有父角色
            role_hierarchy = self._get_role_hierarchy(user_role.role)
            roles.extend(role_hierarchy)
        
        # 去重
        unique_roles = {role['id']: role for role in roles}.values()
        roles_list = list(unique_roles)
        
        cache.set(cache_key, json.dumps(roles_list), 
                 self.CACHE_TTL['user_roles'])
        
        return roles_list
    
    def _get_role_hierarchy(self, role: Role) -> List[Dict[str, Any]]:
        """获取角色层级结构（包含所有父角色）"""
        hierarchy = []
        current_role = role
        
        while current_role:
            hierarchy.append({
                'id': current_role.id,
                'name': current_role.name,
                'code': current_role.code,
                'level': current_role.level
            })
            current_role = current_role.parent
        
        return hierarchy
    
    def is_super_admin(self, user: User) -> bool:
        """检查用户是否为超级管理员"""
        return user.is_superuser or self.has_role(user, 'super_admin')
    
    def has_role(self, user: User, role_code: str) -> bool:
        """检查用户是否具有指定角色"""
        user_roles = self.get_user_roles(user)
        return any(role['code'] == role_code for role in user_roles)
    
    def clear_user_cache(self, user: User):
        """清除用户权限缓存"""
        cache.delete(self._cache_key("user_permissions", str(user.id)))
        cache.delete(self._cache_key("user_roles", str(user.id)))

# 全局RBAC服务实例
rbac_service = RBACService()
```

### 3.2 前端技术栈

#### 3.2.1 权限控制Composables

```typescript
// frontend/src/composables/useRBAC.ts
import { ref, computed } from 'vue'
import { useAuthStore } from '@/store/authStore'
import { useRBACStore } from '@/store/rbacStore'

interface Permission {
  resource: string
  action: string  
  conditions?: Record<string, any>
  granted: boolean
}

interface RBACContext {
  resource_id?: number
  owner_id?: number
  course_stage?: string
  user_id?: number
  [key: string]: any
}

export const useRBAC = () => {
  const authStore = useAuthStore()
  const rbacStore = useRBACStore()
  
  /**
   * 检查用户是否具有指定权限
   */
  const checkPermission = async (
    resource: string, 
    action: string, 
    context?: RBACContext
  ): Promise<boolean> => {
    try {
      // 未登录用户只能访问公开资源
      if (!authStore.isLoggedIn) {
        return resource === 'public' || action === 'read'
      }
      
      // 超级管理员拥有所有权限
      if (rbacStore.isSuperAdmin) {
        return true
      }
      
      // 检查缓存的权限
      const userPermissions = rbacStore.userPermissions
      
      for (const permission of userPermissions) {
        if (permission.resource === resource && 
            permission.action === action && 
            permission.granted) {
          
          // 检查权限条件
          if (checkConditions(permission.conditions, context)) {
            return true
          }
        }
      }
      
      return false
    } catch (error) {
      console.error('权限检查错误:', error)
      return false
    }
  }
  
  /**
   * 检查权限附加条件
   */
  const checkConditions = (
    conditions?: Record<string, any>, 
    context?: RBACContext
  ): boolean => {
    if (!conditions || !context) return true
    
    // 仅限所有者访问
    if (conditions.owner_only && conditions.owner_only === true) {
      return context.owner_id === authStore.user?.id
    }
    
    // 课程阶段限制
    if (conditions.course_stage) {
      const allowedStages = Array.isArray(conditions.course_stage) 
        ? conditions.course_stage 
        : [conditions.course_stage]
      return allowedStages.includes(context.course_stage)
    }
    
    // 会员等级限制
    if (conditions.membership_level) {
      return authStore.user?.membershipLevel >= conditions.membership_level
    }
    
    return true
  }
  
  /**
   * 检查用户是否具有指定角色
   */
  const hasRole = (roleCode: string): boolean => {
    return rbacStore.userRoles.some(role => role.code === roleCode)
  }
  
  /**
   * 检查用户是否具有任意一个指定角色
   */
  const hasAnyRole = (roleCodes: string[]): boolean => {
    return roleCodes.some(code => hasRole(code))
  }
  
  /**
   * 检查用户是否具有所有指定角色
   */
  const hasAllRoles = (roleCodes: string[]): boolean => {
    return roleCodes.every(code => hasRole(code))
  }
  
  /**
   * 获取用户在指定资源上的权限列表
   */
  const getResourcePermissions = (resource: string): string[] => {
    return rbacStore.userPermissions
      .filter(p => p.resource === resource && p.granted)
      .map(p => p.action)
  }
  
  /**
   * 课程访问权限检查（业务特定）
   */
  const canAccessCourse = async (course: any): Promise<boolean> => {
    // 体验课程：所有人可访问
    if (course.stage === 'tiyan') {
      return true
    }
    
    // 会员专区：仅会员可访问    
    if (course.stage === 'member') {
      return hasRole('premium_member') || hasRole('platform_admin')
    }
    
    // 收费课程：购买后可访问或会员可访问
    if (['rumen', 'jingjin', 'shizhan', 'xiangmuluodi'].includes(course.stage)) {
      const hasPurchased = await checkPermission('course', 'access', {
        resource_id: course.id,
        course_stage: course.stage
      })
      return hasPurchased || hasRole('premium_member')
    }
    
    // 就业课：需要单独购买
    if (course.stage === 'jiuye') {
      return await checkPermission('course', 'access', {
        resource_id: course.id,
        course_stage: course.stage
      })
    }
    
    return false
  }
  
  /**
   * 便捷权限检查方法
   */
  const can = {
    create: (resource: string, context?: RBACContext) => 
      checkPermission(resource, 'create', context),
    read: (resource: string, context?: RBACContext) => 
      checkPermission(resource, 'read', context),
    update: (resource: string, context?: RBACContext) => 
      checkPermission(resource, 'update', context),
    delete: (resource: string, context?: RBACContext) => 
      checkPermission(resource, 'delete', context),
  }
  
  return {
    checkPermission,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    getResourcePermissions,
    canAccessCourse,
    can,
    // 响应式权限状态
    isSuperAdmin: computed(() => rbacStore.isSuperAdmin),
    isPremiumMember: computed(() => hasRole('premium_member')),
    isInstructor: computed(() => hasRole('instructor')),
    isAdmin: computed(() => hasAnyRole(['platform_admin', 'super_admin'])),
  }
}
```

#### 3.2.2 RBAC Pinia Store

```typescript
// frontend/src/store/rbacStore.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { rbacAPI } from '@/api/rbac'
import type { Permission, Role } from '@/types/rbac'

export const useRBACStore = defineStore('rbac', () => {
  // 状态
  const userPermissions = ref<Permission[]>([])
  const userRoles = ref<Role[]>([])
  const loading = ref(false)
  const lastRefreshTime = ref<Date | null>(null)
  
  // 计算属性
  const isSuperAdmin = computed(() => 
    userRoles.value.some(role => role.code === 'super_admin')
  )
  
  const hasAdminRole = computed(() =>
    userRoles.value.some(role => 
      ['super_admin', 'platform_admin'].includes(role.code)
    )
  )
  
  const userRolesCodes = computed(() => 
    userRoles.value.map(role => role.code)
  )
  
  // 权限相关操作
  const refreshPermissions = async () => {
    loading.value = true
    try {
      const response = await rbacAPI.getUserPermissions()
      userPermissions.value = response.data.permissions
      userRoles.value = response.data.roles
      lastRefreshTime.value = new Date()
    } catch (error) {
      console.error('刷新权限失败:', error)
      throw error
    } finally {
      loading.value = false
    }
  }
  
  const clearCache = () => {
    userPermissions.value = []
    userRoles.value = []
    lastRefreshTime.value = null
  }
  
  const needsRefresh = computed(() => {
    if (!lastRefreshTime.value) return true
    
    const now = new Date()
    const diff = now.getTime() - lastRefreshTime.value.getTime()
    const REFRESH_INTERVAL = 30 * 60 * 1000 // 30分钟
    
    return diff > REFRESH_INTERVAL
  })
  
  const ensurePermissions = async () => {
    if (needsRefresh.value) {
      await refreshPermissions()
    }
  }
  
  return {
    // 状态
    userPermissions,
    userRoles,
    loading,
    lastRefreshTime,
    
    // 计算属性
    isSuperAdmin,
    hasAdminRole,
    userRolesCodes,
    needsRefresh,
    
    // 方法
    refreshPermissions,
    clearCache,
    ensurePermissions,
  }
})
```

#### 3.2.3 权限指令和组件

```vue
<!-- frontend/src/components/rbac/PermissionGate.vue -->
<template>
  <div v-if="hasPermission" class="permission-gate">
    <slot />
  </div>
  <div v-else-if="showFallback" class="permission-denied">
    <slot name="denied">
      <div class="alert alert-warning">
        <i class="bi bi-shield-exclamation"></i>
        {{ deniedMessage || '权限不足，无法访问此内容' }}
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRBAC } from '@/composables/useRBAC'
import type { RBACContext } from '@/composables/useRBAC'

interface Props {
  permission?: string  // 格式: "resource.action"
  resource?: string
  action?: string
  context?: RBACContext
  roles?: string[]
  requireAll?: boolean // 是否需要所有权限
  showFallback?: boolean // 是否显示拒绝访问提示
  deniedMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  requireAll: false,
  showFallback: true,
})

const { checkPermission, hasRole, hasAnyRole, hasAllRoles } = useRBAC()
const hasPermission = ref(false)

const checkAccess = async () => {
  try {
    let permissionGranted = true
    
    // 检查基于权限字符串的访问
    if (props.permission) {
      const [resource, action] = props.permission.split('.')
      permissionGranted = await checkPermission(resource, action, props.context)
    }
    
    // 检查基于资源和动作的访问
    if (props.resource && props.action) {
      permissionGranted = await checkPermission(props.resource, props.action, props.context)
    }
    
    // 检查角色权限
    if (props.roles && props.roles.length > 0) {
      const roleGranted = props.requireAll 
        ? hasAllRoles(props.roles)
        : hasAnyRole(props.roles)
      
      permissionGranted = permissionGranted && roleGranted
    }
    
    hasPermission.value = permissionGranted
  } catch (error) {
    console.error('权限检查错误:', error)
    hasPermission.value = false
  }
}

onMounted(() => {
  checkAccess()
})
</script>
```

```vue
<!-- frontend/src/components/rbac/RoleGate.vue -->
<template>
  <div v-if="hasRequiredRole" class="role-gate">
    <slot />
  </div>
  <div v-else-if="showFallback" class="role-denied">
    <slot name="denied">
      <div class="alert alert-info">
        <i class="bi bi-person-badge"></i>
        {{ deniedMessage || '需要相应角色才能访问此功能' }}
      </div>
    </slot>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRBAC } from '@/composables/useRBAC'

interface Props {
  roles: string | string[]
  requireAll?: boolean
  showFallback?: boolean
  deniedMessage?: string
}

const props = withDefaults(defineProps<Props>(), {
  requireAll: false,
  showFallback: true,
})

const { hasRole, hasAnyRole, hasAllRoles } = useRBAC()

const hasRequiredRole = computed(() => {
  const roleArray = Array.isArray(props.roles) ? props.roles : [props.roles]
  
  if (roleArray.length === 0) return true
  
  return props.requireAll 
    ? hasAllRoles(roleArray)
    : hasAnyRole(roleArray)
})
</script>
```

#### 3.2.4 Vue指令注册

```typescript
// frontend/src/directives/rbac.ts
import { App, DirectiveBinding } from 'vue'
import { useRBAC } from '@/composables/useRBAC'

interface PermissionBinding {
  permission?: string
  resource?: string
  action?: string
  context?: Record<string, any>
  roles?: string[]
}

export const rbacDirectives = {
  install(app: App) {
    // v-permission 指令
    app.directive('permission', {
      async mounted(el: HTMLElement, binding: DirectiveBinding<string | PermissionBinding>) {
        const { checkPermission } = useRBAC()
        
        let hasPermission = false
        
        if (typeof binding.value === 'string') {
          // v-permission="'course.create'"
          const [resource, action] = binding.value.split('.')
          hasPermission = await checkPermission(resource, action)
        } else if (typeof binding.value === 'object') {
          // v-permission="{ resource: 'course', action: 'create', context: {...} }"
          const { resource, action, permission, context } = binding.value
          
          if (permission) {
            const [res, act] = permission.split('.')
            hasPermission = await checkPermission(res, act, context)
          } else if (resource && action) {
            hasPermission = await checkPermission(resource, action, context)
          }
        }
        
        if (!hasPermission) {
          el.style.display = 'none'
          el.setAttribute('data-permission-denied', 'true')
        }
      }
    })
    
    // v-role 指令
    app.directive('role', {
      mounted(el: HTMLElement, binding: DirectiveBinding<string | string[]>) {
        const { hasRole, hasAnyRole } = useRBAC()
        
        const roles = Array.isArray(binding.value) ? binding.value : [binding.value]
        const hasRequiredRole = hasAnyRole(roles)
        
        if (!hasRequiredRole) {
          el.style.display = 'none'
          el.setAttribute('data-role-denied', 'true')
        }
      }
    })
  }
}
```

---

## 🔐 4. 权限资源模型

### 4.1 资源分类与权限矩阵

| 资源类别 | 具体资源 | 权限动作 | Super Admin | Platform Admin | Education Manager | Instructor | Operations | SEO Specialist | Customer Service | Premium Member | Free User | Guest |
|---------|----------|----------|-------------|----------------|-------------------|------------|------------|----------------|------------------|----------------|-----------|-------|
| **课程管理** | 体验课程 | 创建/编辑/删除 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | 收费课程 | 访问/学习 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 💰 | 试看 |
| | 会员课程 | 访问/学习 | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| | 课程审核 | 审核/发布 | ✅ | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **用户管理** | 用户信息 | 查看/编辑 | ✅ | ✅ | 部分 | ❌ | 部分 | ❌ | 只读 | ❌ | ❌ | ❌ |
| | 权限分配 | 管理 | ✅ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| **订单支付** | 订单查看 | 查看/处理 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | 只看自己 | 只看自己 | ❌ |
| | 退款处理 | 操作 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ❌ |
| **会员系统** | 会员配置 | 管理 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |
| | 优惠券 | 创建/管理 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | 使用 | 使用 | ❌ |
| **SEO管理** | 关键词 | 管理 | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| | 内容发布 | 多平台发布 | ✅ | ✅ | ❌ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ |
| **数据分析** | 学习数据 | 查看 | ✅ | ✅ | ✅ | 只看自己课程 | ✅ | ✅ | ❌ | 只看自己 | 只看自己 | ❌ |
| | 商业数据 | 查看 | ✅ | ✅ | ❌ | ❌ | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

### 4.2 课程分层权限详细设计

```python
# backend/apps/rbac/permissions.py
from django.contrib.auth.models import User
from apps.courses.models import Course
from apps.membership.models import UserMembership
from .services import rbac_service

class CoursePermissionChecker:
    """课程权限检查器 - 处理7层课程体系的复杂权限逻辑"""
    
    @staticmethod
    def can_access_course(user: User, course: Course) -> bool:
        """检查用户是否可以访问指定课程"""
        
        # 管理员和讲师拥有所有课程访问权限
        if rbac_service.has_role(user, 'super_admin') or \
           rbac_service.has_role(user, 'platform_admin'):
            return True
            
        # 讲师可以访问自己创建的课程
        if rbac_service.has_role(user, 'instructor') and course.created_by == user:
            return True
        
        # 根据课程阶段检查权限
        if course.stage == 'tiyan':  # 体验课程
            return True  # 所有人可访问
            
        elif course.stage == 'member':  # 会员专区
            return CoursePermissionChecker._is_premium_member(user)
            
        elif course.stage in ['rumen', 'jingjin', 'shizhan', 'xiangmuluodi']:  # 收费课程
            return (CoursePermissionChecker._has_purchased_course(user, course) or
                   CoursePermissionChecker._is_premium_member(user))
                   
        elif course.stage == 'jiuye':  # 就业课
            return CoursePermissionChecker._has_purchased_course(user, course)
            
        return False
    
    @staticmethod
    def can_edit_course(user: User, course: Course) -> bool:
        """检查用户是否可以编辑指定课程"""
        
        # 管理员可以编辑所有课程
        if rbac_service.has_role(user, 'super_admin') or \
           rbac_service.has_role(user, 'platform_admin'):
            return True
            
        # 教学主管可以编辑所有课程
        if rbac_service.has_role(user, 'education_manager'):
            return True
            
        # 讲师只能编辑自己创建的课程
        if rbac_service.has_role(user, 'instructor'):
            return course.created_by == user
            
        return False
    
    @staticmethod
    def _is_premium_member(user: User) -> bool:
        """检查用户是否为付费会员"""
        if not user.is_authenticated:
            return False
            
        try:
            membership = UserMembership.objects.get(user=user, is_active=True)
            return membership.is_valid()
        except UserMembership.DoesNotExist:
            return False
    
    @staticmethod
    def _has_purchased_course(user: User, course: Course) -> bool:
        """检查用户是否已购买课程"""
        if not user.is_authenticated:
            return False
            
        # 检查订单记录
        from apps.orders.models import OrderItem
        return OrderItem.objects.filter(
            order__user=user,
            course=course,
            order__status='completed'
        ).exists()
```

### 4.3 API权限装饰器

```python
# backend/apps/rbac/decorators.py
from functools import wraps
from django.http import JsonResponse
from django.contrib.auth.decorators import login_required
from .services import rbac_service
from .models import AuditLog
import inspect

def require_permission(resource: str, action: str, context_func=None):
    """权限检查装饰器"""
    def decorator(func):
        @wraps(func)
        @login_required
        def wrapper(request, *args, **kwargs):
            user = request.user
            
            # 获取权限检查上下文
            context = {}
            if context_func and callable(context_func):
                context = context_func(request, *args, **kwargs)
            
            # 执行权限检查
            if not rbac_service.check_permission(user, resource, action, context):
                # 记录权限拒绝日志
                AuditLog.objects.create(
                    user=user,
                    action='PERMISSION_DENIED',
                    resource=resource,
                    resource_id=context.get('resource_id', 0),
                    ip_address=request.META.get('REMOTE_ADDR', ''),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    risk_level='MEDIUM',
                    old_values={'attempted_action': action}
                )
                
                return JsonResponse({
                    'status': 403,
                    'msg': '权限不足',
                    'data': None
                }, status=403)
            
            # 记录权限访问日志（高风险操作）
            if action in ['delete', 'create'] or resource in ['user', 'role', 'permission']:
                AuditLog.objects.create(
                    user=user,
                    action=action.upper(),
                    resource=resource,
                    resource_id=context.get('resource_id', 0),
                    ip_address=request.META.get('REMOTE_ADDR', ''),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    risk_level='HIGH' if action == 'delete' else 'MEDIUM'
                )
            
            return func(request, *args, **kwargs)
        return wrapper
    return decorator

def require_role(role_codes):
    """角色检查装饰器"""
    if isinstance(role_codes, str):
        role_codes = [role_codes]
    
    def decorator(func):
        @wraps(func)
        @login_required
        def wrapper(request, *args, **kwargs):
            user = request.user
            
            # 检查用户角色
            user_roles = rbac_service.get_user_roles(user)
            user_role_codes = [role['code'] for role in user_roles]
            
            if not any(role_code in user_role_codes for role_code in role_codes):
                return JsonResponse({
                    'status': 403,
                    'msg': f'需要以下角色之一：{", ".join(role_codes)}',
                    'data': None
                }, status=403)
            
            return func(request, *args, **kwargs)
        return wrapper
    return decorator

def audit_action(resource: str, action: str, get_resource_id=None, risk_level='MEDIUM'):
    """操作审计装饰器"""
    def decorator(func):
        @wraps(func)
        def wrapper(request, *args, **kwargs):
            user = getattr(request, 'user', None)
            
            # 获取资源ID
            resource_id = 0
            if get_resource_id and callable(get_resource_id):
                resource_id = get_resource_id(request, *args, **kwargs)
            elif 'pk' in kwargs:
                resource_id = kwargs['pk']
            elif 'id' in kwargs:
                resource_id = kwargs['id']
            
            # 执行原函数
            result = func(request, *args, **kwargs)
            
            # 记录审计日志
            if user and user.is_authenticated:
                AuditLog.objects.create(
                    user=user,
                    action=action.upper(),
                    resource=resource,
                    resource_id=resource_id,
                    ip_address=request.META.get('REMOTE_ADDR', ''),
                    user_agent=request.META.get('HTTP_USER_AGENT', ''),
                    risk_level=risk_level
                )
            
            return result
        return wrapper
    return decorator

# 使用示例
class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    
    @require_permission('course', 'create')
    def create(self, request):
        """创建课程 - 需要课程创建权限"""
        return super().create(request)
    
    @require_permission('course', 'update', 
                       context_func=lambda req, *args, **kwargs: {
                           'resource_id': kwargs.get('pk'),
                           'owner_id': Course.objects.get(pk=kwargs.get('pk')).created_by_id
                       })
    def update(self, request, *args, **kwargs):
        """更新课程 - 需要更新权限且检查所有者"""
        return super().update(request, *args, **kwargs)
    
    @require_role(['instructor', 'education_manager', 'platform_admin'])
    def list(self, request):
        """课程列表 - 需要相关角色"""
        return super().list(request)
```

---

## 🔒 5. 安全策略设计

### 5.1 数据安全分级

#### 5.1.1 敏感数据分类标准

| 安全等级 | 数据类型 | 访问控制 | 示例数据 | 审计要求 |
|----------|----------|----------|----------|----------|
| **L0 - 公开数据** | 营销内容、课程介绍 | 无限制 | 课程描述、价格、评价 | 无 |
| **L1 - 内部数据** | 用户行为数据 | 需要登录 | 学习进度、浏览记录 | 基础日志 |
| **L2 - 业务数据** | 商业运营数据 | 需要相关权限 | 订单统计、转化率 | 详细审计 |
| **L3 - 敏感数据** | 个人信息 | 需要管理员权限 | 手机号、邮箱、地址 | 完整审计 |
| **L4 - 机密数据** | 财务和系统数据 | 仅超级管理员 | 支付密钥、系统配置 | 严格审计 |

#### 5.1.2 字段级权限控制

```python
# backend/apps/rbac/field_permissions.py
from django.db import models
from django.contrib.auth.models import User

class FieldPermissionMixin:
    """字段级权限控制混入类"""
    
    # 定义字段安全等级
    FIELD_SECURITY_LEVELS = {
        'L0': ['name', 'title', 'description', 'price'],  # 公开字段
        'L1': ['created_at', 'updated_at', 'status'],      # 内部字段
        'L2': ['email', 'phone', 'address'],               # 敏感字段
        'L3': ['payment_info', 'id_number'],               # 机密字段
        'L4': ['password_hash', 'secret_key'],             # 系统字段
    }
    
    def filter_fields_by_permission(self, user: User, fields_data: dict) -> dict:
        """根据用户权限过滤字段数据"""
        from .services import rbac_service
        
        filtered_data = {}
        user_level = self._get_user_security_level(user)
        
        for field_name, field_value in fields_data.items():
            field_level = self._get_field_security_level(field_name)
            
            if self._can_access_field_level(user_level, field_level):
                filtered_data[field_name] = field_value
            else:
                # 敏感数据脱敏
                filtered_data[field_name] = self._mask_sensitive_data(
                    field_name, field_value
                )
        
        return filtered_data
    
    def _get_user_security_level(self, user: User) -> int:
        """获取用户安全访问等级"""
        from .services import rbac_service
        
        if rbac_service.has_role(user, 'super_admin'):
            return 4
        elif rbac_service.has_role(user, 'platform_admin'):
            return 3
        elif rbac_service.has_any_role(user, ['education_manager', 'operations']):
            return 2
        elif user.is_authenticated:
            return 1
        else:
            return 0
    
    def _get_field_security_level(self, field_name: str) -> int:
        """获取字段安全等级"""
        for level, fields in self.FIELD_SECURITY_LEVELS.items():
            if field_name in fields:
                return int(level[1])  # 提取等级数字
        return 0  # 默认公开
    
    def _can_access_field_level(self, user_level: int, field_level: int) -> bool:
        """检查用户是否可以访问指定等级的字段"""
        return user_level >= field_level
    
    def _mask_sensitive_data(self, field_name: str, field_value) -> str:
        """敏感数据脱敏"""
        if field_name == 'phone':
            return f"{str(field_value)[:3]}****{str(field_value)[-4:]}"
        elif field_name == 'email':
            parts = str(field_value).split('@')
            return f"{parts[0][:2]}***@{parts[1]}"
        elif field_name in ['id_number', 'payment_info']:
            return "***敏感信息已隐藏***"
        else:
            return "***"
```

### 5.2 审计日志系统

#### 5.2.1 审计日志服务

```python
# backend/apps/rbac/audit.py
from django.contrib.auth.models import User
from django.utils import timezone
from .models import AuditLog
from typing import Dict, Any, Optional
import json

class AuditService:
    """审计日志服务"""
    
    RISK_LEVELS = {
        'LOW': ['read', 'list', 'view'],
        'MEDIUM': ['create', 'update'],
        'HIGH': ['delete', 'permission_change', 'role_assign'],
        'CRITICAL': ['system_config', 'user_data_export', 'bulk_delete']
    }
    
    @classmethod
    def log_action(cls, 
                   user: Optional[User],
                   action: str,
                   resource: str,
                   resource_id: int = 0,
                   old_values: Dict[str, Any] = None,
                   new_values: Dict[str, Any] = None,
                   ip_address: str = '',
                   user_agent: str = '',
                   additional_context: Dict[str, Any] = None) -> AuditLog:
        """记录操作审计日志"""
        
        risk_level = cls._determine_risk_level(action, resource)
        
        # 敏感数据脱敏
        safe_old_values = cls._sanitize_values(old_values or {})
        safe_new_values = cls._sanitize_values(new_values or {})
        
        audit_log = AuditLog.objects.create(
            user=user,
            action=action.upper(),
            resource=resource,
            resource_id=resource_id,
            old_values=safe_old_values,
            new_values=safe_new_values,
            ip_address=ip_address,
            user_agent=user_agent,
            risk_level=risk_level
        )
        
        # 高风险操作实时告警
        if risk_level in ['HIGH', 'CRITICAL']:
            cls._send_security_alert(audit_log, additional_context)
        
        return audit_log
    
    @classmethod
    def _determine_risk_level(cls, action: str, resource: str) -> str:
        """确定操作风险等级"""
        action_lower = action.lower()
        
        # 系统级资源的操作风险更高
        if resource in ['user', 'role', 'permission', 'system']:
            base_risk = 'MEDIUM'
        else:
            base_risk = 'LOW'
        
        # 根据操作类型调整风险等级
        for level, actions in cls.RISK_LEVELS.items():
            if action_lower in actions:
                if level == 'CRITICAL' or (level == 'HIGH' and base_risk == 'MEDIUM'):
                    return 'CRITICAL'
                elif level == 'HIGH':
                    return 'HIGH'
                elif level == 'MEDIUM':
                    return 'MEDIUM' if base_risk == 'LOW' else 'HIGH'
        
        return base_risk
    
    @classmethod
    def _sanitize_values(cls, values: Dict[str, Any]) -> Dict[str, Any]:
        """脱敏敏感数据"""
        sanitized = {}
        sensitive_fields = ['password', 'token', 'secret', 'key', 'phone', 'email']
        
        for key, value in values.items():
            if any(field in key.lower() for field in sensitive_fields):
                sanitized[key] = '***MASKED***'
            else:
                sanitized[key] = value
        
        return sanitized
    
    @classmethod
    def _send_security_alert(cls, audit_log: AuditLog, context: Dict[str, Any] = None):
        """发送安全告警"""
        # 这里可以集成邮件、短信、钉钉等告警方式
        print(f"SECURITY ALERT: {audit_log.risk_level} risk action detected")
        print(f"User: {audit_log.user}")
        print(f"Action: {audit_log.action} on {audit_log.resource}")
        print(f"Time: {audit_log.timestamp}")
        
        # 实际实现可以发送到监控系统
        # AlertingService.send_alert(audit_log, context)

    @classmethod
    def get_user_activity_summary(cls, user: User, days: int = 30) -> Dict[str, Any]:
        """获取用户活动摘要"""
        from datetime import timedelta
        
        start_date = timezone.now() - timedelta(days=days)
        
        logs = AuditLog.objects.filter(
            user=user,
            timestamp__gte=start_date
        )
        
        return {
            'total_actions': logs.count(),
            'risk_distribution': {
                level: logs.filter(risk_level=level).count()
                for level in ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
            },
            'resource_access': {
                resource: logs.filter(resource=resource).count()
                for resource in logs.values_list('resource', flat=True).distinct()
            },
            'recent_high_risk': logs.filter(
                risk_level__in=['HIGH', 'CRITICAL']
            ).order_by('-timestamp')[:10]
        }

# 中间件集成
class AuditMiddleware:
    """审计中间件 - 自动记录API请求"""
    
    def __init__(self, get_response):
        self.get_response = get_response
    
    def __call__(self, request):
        # 请求处理前
        start_time = timezone.now()
        
        response = self.get_response(request)
        
        # 请求处理后 - 记录审计日志
        if self._should_audit(request, response):
            self._log_request(request, response, start_time)
        
        return response
    
    def _should_audit(self, request, response) -> bool:
        """判断是否需要审计"""
        # 只审计API请求
        if not request.path.startswith('/api/'):
            return False
        
        # 只审计认证用户的请求
        if not hasattr(request, 'user') or not request.user.is_authenticated:
            return False
        
        # 只审计非GET请求或敏感GET请求
        if request.method == 'GET' and not self._is_sensitive_read(request.path):
            return False
        
        return True
    
    def _is_sensitive_read(self, path: str) -> bool:
        """判断是否为敏感的读取操作"""
        sensitive_paths = ['/api/users/', '/api/orders/', '/api/analytics/']
        return any(sensitive_path in path for sensitive_path in sensitive_paths)
    
    def _log_request(self, request, response, start_time):
        """记录请求日志"""
        action = self._get_action_from_request(request)
        resource = self._get_resource_from_path(request.path)
        
        AuditService.log_action(
            user=request.user,
            action=action,
            resource=resource,
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
            additional_context={
                'method': request.method,
                'path': request.path,
                'status_code': response.status_code,
                'duration_ms': (timezone.now() - start_time).total_seconds() * 1000
            }
        )
    
    def _get_action_from_request(self, request) -> str:
        """从HTTP请求推断操作类型"""
        method_action_map = {
            'GET': 'read',
            'POST': 'create', 
            'PUT': 'update',
            'PATCH': 'update',
            'DELETE': 'delete'
        }
        return method_action_map.get(request.method, 'unknown')
    
    def _get_resource_from_path(self, path: str) -> str:
        """从请求路径推断资源类型"""
        path_parts = path.strip('/').split('/')
        if len(path_parts) >= 2 and path_parts[0] == 'api':
            return path_parts[1].rstrip('s')  # 移除复数形式
        return 'unknown'
```

### 5.3 零信任安全架构

```python
# backend/apps/rbac/zero_trust.py
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.cache import cache
from .services import rbac_service
from .models import AuditLog
import hashlib
import json

class ZeroTrustValidator:
    """零信任安全验证器"""
    
    def __init__(self):
        self.max_permission_cache_age = 5 * 60  # 5分钟缓存
        self.suspicious_action_threshold = 10    # 可疑操作阈值
    
    def validate_access(self, user: User, resource: str, action: str, 
                       context: dict = None, request=None) -> dict:
        """零信任访问验证"""
        
        validation_result = {
            'allowed': False,
            'confidence_score': 0,
            'risk_factors': [],
            'additional_verification_required': False
        }
        
        # 1. 基础身份验证
        if not self._verify_user_identity(user):
            validation_result['risk_factors'].append('invalid_user_identity')
            return validation_result
        
        # 2. 权限实时验证（不依赖缓存）
        fresh_permission_check = self._verify_fresh_permissions(user, resource, action, context)
        if not fresh_permission_check['allowed']:
            validation_result['risk_factors'].extend(fresh_permission_check['reasons'])
            return validation_result
        
        # 3. 行为模式分析
        behavior_analysis = self._analyze_user_behavior(user, resource, action, request)
        validation_result['confidence_score'] = behavior_analysis['confidence']
        validation_result['risk_factors'].extend(behavior_analysis['risk_factors'])
        
        # 4. 上下文验证
        context_validation = self._validate_access_context(user, resource, context, request)
        if not context_validation['valid']:
            validation_result['risk_factors'].extend(context_validation['issues'])
        
        # 5. 最终访问决策
        final_score = validation_result['confidence_score'] - len(validation_result['risk_factors']) * 10
        
        if final_score >= 80:
            validation_result['allowed'] = True
        elif final_score >= 60:
            validation_result['allowed'] = True
            validation_result['additional_verification_required'] = True
        else:
            validation_result['allowed'] = False
        
        # 记录验证结果
        self._log_access_validation(user, resource, action, validation_result, request)
        
        return validation_result
    
    def _verify_user_identity(self, user: User) -> bool:
        """验证用户身份有效性"""
        if not user or not user.is_authenticated:
            return False
        
        # 检查账户状态
        if not user.is_active:
            return False
        
        # 检查会话有效性
        if self._is_session_compromised(user):
            return False
        
        return True
    
    def _verify_fresh_permissions(self, user: User, resource: str, action: str, context: dict) -> dict:
        """实时权限验证，不依赖缓存"""
        # 强制刷新用户权限（跳过缓存）
        rbac_service.clear_user_cache(user)
        
        # 重新获取权限
        has_permission = rbac_service.check_permission(user, resource, action, context)
        
        result = {'allowed': has_permission, 'reasons': []}
        
        if not has_permission:
            result['reasons'].append('insufficient_permissions')
        
        return result
    
    def _analyze_user_behavior(self, user: User, resource: str, action: str, request) -> dict:
        """用户行为模式分析"""
        analysis = {
            'confidence': 100,
            'risk_factors': []
        }
        
        # 获取用户近期行为
        recent_logs = AuditLog.objects.filter(
            user=user,
            timestamp__gte=timezone.now() - timezone.timedelta(hours=1)
        )
        
        # 异常访问频率检测
        if recent_logs.count() > self.suspicious_action_threshold:
            analysis['risk_factors'].append('high_frequency_access')
            analysis['confidence'] -= 20
        
        # 异常访问时间检测
        current_hour = timezone.now().hour
        if current_hour < 6 or current_hour > 22:  # 非工作时间
            analysis['risk_factors'].append('unusual_access_time')
            analysis['confidence'] -= 10
        
        # IP地址变化检测
        if request and self._detect_ip_anomaly(user, request):
            analysis['risk_factors'].append('ip_address_change')
            analysis['confidence'] -= 15
        
        # 权限升级检测
        if self._detect_privilege_escalation(user, resource, action):
            analysis['risk_factors'].append('privilege_escalation_attempt')
            analysis['confidence'] -= 25
        
        return analysis
    
    def _validate_access_context(self, user: User, resource: str, context: dict, request) -> dict:
        """访问上下文验证"""
        validation = {'valid': True, 'issues': []}
        
        # 资源所有者验证
        if context and 'owner_id' in context:
            if context['owner_id'] != user.id and not rbac_service.has_role(user, 'platform_admin'):
                validation['issues'].append('resource_ownership_violation')
        
        # 地理位置验证
        if request and self._is_suspicious_location(user, request):
            validation['issues'].append('suspicious_geographic_location')
        
        # 设备指纹验证
        if request and self._is_unknown_device(user, request):
            validation['issues'].append('unknown_device_access')
        
        validation['valid'] = len(validation['issues']) == 0
        return validation
    
    def _is_session_compromised(self, user: User) -> bool:
        """检查会话是否可能被盗用"""
        # 这里可以实现会话安全检查逻辑
        # 例如：检查并发会话数量、会话创建时间等
        return False
    
    def _detect_ip_anomaly(self, user: User, request) -> bool:
        """检测IP地址异常"""
        current_ip = request.META.get('REMOTE_ADDR', '')
        if not current_ip:
            return False
        
        # 获取用户最近的IP地址
        recent_ips = AuditLog.objects.filter(
            user=user,
            timestamp__gte=timezone.now() - timezone.timedelta(days=7)
        ).values_list('ip_address', flat=True).distinct()
        
        # 如果是全新的IP地址，标记为异常
        return current_ip not in recent_ips
    
    def _detect_privilege_escalation(self, user: User, resource: str, action: str) -> bool:
        """检测权限升级尝试"""
        # 检查用户是否尝试访问比平时更高权限的资源
        user_roles = rbac_service.get_user_roles(user)
        max_user_level = max([role.get('level', 0) for role in user_roles] or [0])
        
        # 定义资源权限等级
        resource_levels = {
            'system': 4,
            'user': 3,
            'role': 3,
            'permission': 3,
            'order': 2,
            'course': 1
        }
        
        required_level = resource_levels.get(resource, 0)
        
        return required_level > max_user_level
    
    def _is_suspicious_location(self, user: User, request) -> bool:
        """检测可疑地理位置"""
        # 这里可以集成地理位置检测服务
        # 例如通过IP地址获取地理位置，与用户常用地址比较
        return False
    
    def _is_unknown_device(self, user: User, request) -> bool:
        """检测未知设备"""
        user_agent = request.META.get('HTTP_USER_AGENT', '')
        if not user_agent:
            return True
        
        # 生成设备指纹
        device_fingerprint = hashlib.md5(user_agent.encode()).hexdigest()
        
        # 检查是否为已知设备
        cache_key = f"known_device:{user.id}:{device_fingerprint}"
        is_known = cache.get(cache_key)
        
        if not is_known:
            # 记录新设备
            cache.set(cache_key, True, 30 * 24 * 60 * 60)  # 30天
            return True
        
        return False
    
    def _log_access_validation(self, user: User, resource: str, action: str, 
                              validation_result: dict, request):
        """记录访问验证结果"""
        risk_level = 'HIGH' if not validation_result['allowed'] else 'MEDIUM'
        
        AuditLog.objects.create(
            user=user,
            action='ZERO_TRUST_VALIDATION',
            resource=resource,
            resource_id=0,
            ip_address=request.META.get('REMOTE_ADDR', '') if request else '',
            user_agent=request.META.get('HTTP_USER_AGENT', '') if request else '',
            risk_level=risk_level,
            old_values={
                'requested_action': action,
                'validation_result': validation_result
            }
        )

# 零信任中间件
class ZeroTrustMiddleware:
    """零信任安全中间件"""
    
    def __init__(self, get_response):
        self.get_response = get_response
        self.validator = ZeroTrustValidator()
    
    def __call__(self, request):
        # 对敏感操作进行零信任验证
        if self._requires_zero_trust_validation(request):
            validation_result = self._perform_validation(request)
            
            if not validation_result['allowed']:
                return self._create_access_denied_response(validation_result)
            
            if validation_result['additional_verification_required']:
                # 可以在这里添加额外的验证步骤
                # 例如：要求二次认证、发送验证码等
                pass
        
        response = self.get_response(request)
        return response
    
    def _requires_zero_trust_validation(self, request) -> bool:
        """判断是否需要零信任验证"""
        # 敏感操作或高权限接口需要零信任验证
        sensitive_paths = [
            '/api/users/',
            '/api/roles/', 
            '/api/permissions/',
            '/api/admin/',
            '/api/system/'
        ]
        
        sensitive_actions = ['POST', 'PUT', 'DELETE']
        
        return (any(path in request.path for path in sensitive_paths) and
                request.method in sensitive_actions)
    
    def _perform_validation(self, request):
        """执行零信任验证"""
        # 从请求中提取验证参数
        user = getattr(request, 'user', None)
        resource = self._extract_resource_from_path(request.path)
        action = self._map_method_to_action(request.method)
        
        return self.validator.validate_access(user, resource, action, request=request)
    
    def _extract_resource_from_path(self, path: str) -> str:
        """从请求路径提取资源类型"""
        parts = path.strip('/').split('/')
        if len(parts) >= 2:
            return parts[1].rstrip('s')
        return 'unknown'
    
    def _map_method_to_action(self, method: str) -> str:
        """HTTP方法映射到操作"""
        mapping = {
            'GET': 'read',
            'POST': 'create',
            'PUT': 'update', 
            'PATCH': 'update',
            'DELETE': 'delete'
        }
        return mapping.get(method, 'unknown')
    
    def _create_access_denied_response(self, validation_result):
        """创建访问拒绝响应"""
        from django.http import JsonResponse
        
        return JsonResponse({
            'status': 403,
            'msg': '访问被拒绝：安全验证失败',
            'data': {
                'risk_factors': validation_result['risk_factors'],
                'confidence_score': validation_result['confidence_score']
            }
        }, status=403)
```

---

## 🚀 6. 实施计划

### 6.1 四阶段实施路线图

#### **Phase 1: 基础RBAC框架搭建 (2-3周)**

**目标**：建立基础权限控制框架

**主要任务**：
1. **数据库设计和迁移**
   - 创建Role、Permission、UserRole、RolePermission模型
   - 设计审计日志AuditLog模型
   - 编写数据迁移脚本

2. **后端核心服务开发**
   - 实现RBACService权限检查服务  
   - 开发权限检查装饰器和中间件
   - 创建基础API接口

3. **前端权限组件**
   - 开发useRBAC composables
   - 创建PermissionGate和RoleGate组件
   - 实现Vue权限指令

4. **基础角色配置**
   - 创建10个核心角色的初始数据
   - 配置基础权限和角色关系
   - 设置超级管理员账户

**验收标准**：
- [ ] 所有数据库表创建完成且通过测试
- [ ] 基础权限检查API可正常调用
- [ ] 前端权限控制组件可正常使用
- [ ] 能够分配角色并验证基础权限

#### **Phase 2: 业务权限集成 (3-4周)**

**目标**：集成业务系统权限控制

**主要任务**：
1. **课程分层访问控制**
   - 实现7层课程体系的权限逻辑
   - 集成会员权益验证系统
   - 开发课程访问权限API

2. **订单支付权限控制**
   - 订单查看权限按角色分配
   - 退款操作权限控制
   - 敏感财务数据访问控制

3. **SEO模块权限管理**
   - SEO专员角色权限配置
   - 多平台内容发布权限
   - 关键词管理权限控制

4. **用户数据访问控制**
   - 个人信息查看权限分级
   - 用户管理操作权限
   - 客服查看用户数据权限

**验收标准**：
- [ ] 不同角色用户访问课程时权限正确
- [ ] 会员和非会员访问权限区分正确
- [ ] 订单数据按权限正确显示
- [ ] SEO功能按角色权限正确开放

#### **Phase 3: 管理界面和审计系统 (2-3周)**

**目标**：完善权限管理和安全审计

**主要任务**：
1. **权限管理后台开发**
   - 角色管理界面（增删改查）
   - 权限配置界面（可视化权限树）
   - 用户角色分配界面
   - 权限继承关系管理

2. **审计日志系统**
   - AuditService审计服务实现
   - 审计日志查询和分析界面
   - 风险操作实时告警
   - 用户行为分析报告

3. **安全策略实现**
   - 数据脱敏功能
   - 字段级权限控制
   - 敏感操作二次验证
   - 权限变更审批流程

4. **权限报告和监控**
   - 权限使用统计报告
   - 异常权限访问监控
   - 定期权限审计报告
   - 权限健康检查

**验收标准**：
- [ ] 管理员可通过界面管理所有权限
- [ ] 所有敏感操作都有审计日志记录
- [ ] 异常权限操作能及时告警
- [ ] 权限报告数据准确完整

#### **Phase 4: 性能优化和扩展功能 (1-2周)**

**目标**：优化性能和扩展功能

**主要任务**：
1. **性能优化**
   - Redis权限缓存优化
   - 批量权限检查优化
   - 数据库查询性能调优
   - 前端权限检查缓存

2. **零信任安全架构**
   - ZeroTrustValidator实现
   - 零信任中间件集成
   - 行为分析算法优化
   - 设备指纹识别

3. **扩展功能开发**
   - 临时权限授予功能
   - 权限委托机制
   - 智能权限推荐
   - 权限自动化工作流

4. **测试和文档**
   - 完整的单元测试
   - 集成测试和性能测试
   - 用户操作手册
   - 技术文档完善

**验收标准**：
- [ ] 权限检查响应时间<100ms
- [ ] 零信任安全验证正常工作
- [ ] 所有扩展功能通过测试
- [ ] 技术文档和用户手册完整

### 6.2 里程碑和交付物

| 阶段 | 里程碑 | 主要交付物 | 完成标准 |
|------|--------|------------|----------|
| **Phase 1** | 基础框架完成 | 数据库Schema、核心API、前端组件 | 基础权限控制可用 |
| **Phase 2** | 业务集成完成 | 课程权限、订单权限、SEO权限 | 业务功能权限正确 |
| **Phase 3** | 管理系统完成 | 管理界面、审计系统、监控告警 | 完整权限管理能力 |
| **Phase 4** | 系统优化完成 | 性能优化、安全增强、扩展功能 | 生产环境就绪 |

### 6.3 风险评估和应对策略

| 风险类别 | 具体风险 | 风险等级 | 应对策略 |
|----------|----------|----------|----------|
| **技术风险** | 权限检查性能影响 | 中等 | 分层缓存、异步处理、性能监控 |
| **安全风险** | 权限绕过漏洞 | 高等 | 代码审核、安全测试、零信任架构 |
| **业务风险** | 权限配置错误导致业务中断 | 高等 | 权限变更审批、灰度发布、回滚机制 |
| **集成风险** | 与现有系统集成困难 | 中等 | 渐进式集成、向后兼容、充分测试 |
| **人员风险** | 开发团队对RBAC理解不足 | 中等 | 技术培训、文档完善、代码审查 |

---

## 🔧 7. 技术选型详解

### 7.1 后端技术栈对比分析

| 方案 | 优势 | 劣势 | 适用性评分 |
|------|------|------|------------|
| **Django + django-guardian (推荐)** | 与现有架构兼容、对象级权限、成熟稳定 | 学习成本、性能开销 | ⭐⭐⭐⭐⭐ |
| **Django + django-rules** | 灵活的规则引擎、易于维护 | 性能相对较低 | ⭐⭐⭐⭐ |
| **Custom RBAC Implementation** | 完全可控、性能最优 | 开发成本高、风险大 | ⭐⭐⭐ |
| **Casbin (Python)** | 功能强大、多语言支持 | 过于复杂、学习成本高 | ⭐⭐ |

**推荐方案**：Django + django-guardian + Redis缓存

**理由**：
1. **兼容性最佳**：与现有Django架构无缝集成
2. **功能完整**：支持对象级权限控制，满足复杂业务需求
3. **性能可控**：通过Redis缓存优化性能
4. **风险较低**：成熟稳定的解决方案，社区支持良好

### 7.2 前端技术栈选型

| 技术组件 | 选择方案 | 替代方案 | 选择理由 |
|----------|----------|----------|----------|
| **状态管理** | Pinia (推荐) | Vuex | 更好的TypeScript支持、更简洁的API |
| **权限控制** | Composables | Mixins | 更符合Vue 3最佳实践、更好的复用性 |
| **缓存策略** | 内存缓存 + localStorage | 纯内存缓存 | 提升用户体验、减少API调用 |
| **类型安全** | TypeScript接口 | 运行时校验 | 编译期错误检查、更好的开发体验 |

### 7.3 缓存架构设计

```typescript
// 三层缓存架构
interface CacheLayer {
  name: string
  ttl: number
  storage: 'memory' | 'localStorage' | 'redis'
  priority: number
}

const cacheStrategy: CacheLayer[] = [
  {
    name: 'L1 - 浏览器内存',
    ttl: 5 * 60 * 1000,      // 5分钟
    storage: 'memory',
    priority: 1
  },
  {
    name: 'L2 - 本地存储',
    ttl: 30 * 60 * 1000,     // 30分钟  
    storage: 'localStorage',
    priority: 2
  },
  {
    name: 'L3 - Redis缓存',
    ttl: 24 * 60 * 60 * 1000, // 24小时
    storage: 'redis',
    priority: 3
  }
]
```

---

## 📊 8. 性能优化策略

### 8.1 数据库优化

```sql
-- 权限查询优化索引
CREATE INDEX idx_user_roles_active ON rbac_user_roles(user_id, is_active) 
WHERE expires_at IS NULL OR expires_at > NOW();

CREATE INDEX idx_role_permissions ON rbac_role_permissions(role_id, granted);

CREATE INDEX idx_audit_logs_user_time ON rbac_audit_logs(user_id, timestamp);

CREATE INDEX idx_audit_logs_resource_risk ON rbac_audit_logs(resource, risk_level, timestamp);

-- 权限检查查询优化
CREATE INDEX idx_permissions_resource_action ON rbac_permissions(resource, action);
```

### 8.2 缓存优化策略

```python
# backend/apps/rbac/cache.py
from django.core.cache import cache
from typing import List, Dict, Any
import json
import hashlib

class RBACCacheManager:
    """RBAC缓存管理器"""
    
    # 缓存键前缀
    CACHE_PREFIXES = {
        'user_permissions': 'rbac:up:',
        'user_roles': 'rbac:ur:',
        'role_permissions': 'rbac:rp:',
        'permission_check': 'rbac:pc:',
    }
    
    # 缓存TTL配置
    CACHE_TTL = {
        'user_permissions': 30 * 60,        # 30分钟
        'user_roles': 60 * 60,              # 1小时
        'role_permissions': 24 * 60 * 60,   # 24小时
        'permission_check': 10 * 60,        # 10分钟
    }
    
    @classmethod
    def get_user_permissions(cls, user_id: int) -> List[Dict[str, Any]]:
        """获取用户权限（带缓存）"""
        cache_key = f"{cls.CACHE_PREFIXES['user_permissions']}{user_id}"
        
        cached_data = cache.get(cache_key)
        if cached_data:
            return json.loads(cached_data)
        
        # 缓存未命中，从数据库获取
        permissions = cls._fetch_user_permissions_from_db(user_id)
        
        # 缓存结果
        cache.set(cache_key, json.dumps(permissions), cls.CACHE_TTL['user_permissions'])
        
        return permissions
    
    @classmethod
    def get_permission_check_result(cls, user_id: int, resource: str, 
                                   action: str, context_hash: str = None) -> bool:
        """获取权限检查结果（带缓存）"""
        # 生成缓存键
        cache_components = [str(user_id), resource, action]
        if context_hash:
            cache_components.append(context_hash)
        
        cache_key = f"{cls.CACHE_PREFIXES['permission_check']}" + \
                   hashlib.md5('|'.join(cache_components).encode()).hexdigest()
        
        cached_result = cache.get(cache_key)
        if cached_result is not None:
            return cached_result
        
        # 缓存未命中，执行权限检查
        result = cls._perform_permission_check(user_id, resource, action, context_hash)
        
        # 缓存结果（较短TTL，确保安全性）
        cache.set(cache_key, result, cls.CACHE_TTL['permission_check'])
        
        return result
    
    @classmethod
    def invalidate_user_cache(cls, user_id: int):
        """清除用户相关缓存"""
        cache_patterns = [
            f"{cls.CACHE_PREFIXES['user_permissions']}{user_id}",
            f"{cls.CACHE_PREFIXES['user_roles']}{user_id}",
        ]
        
        for pattern in cache_patterns:
            cache.delete(pattern)
        
        # 清除权限检查缓存（使用通配符）
        cls._invalidate_permission_check_cache(user_id)
    
    @classmethod
    def batch_permission_check(cls, user_id: int, 
                              checks: List[Dict[str, str]]) -> Dict[str, bool]:
        """批量权限检查优化"""
        results = {}
        uncached_checks = []
        
        # 第一轮：检查缓存
        for check in checks:
            resource = check['resource']
            action = check['action']
            context_hash = check.get('context_hash')
            
            check_key = f"{resource}.{action}"
            if context_hash:
                check_key += f".{context_hash}"
            
            cached_result = cls.get_permission_check_result(
                user_id, resource, action, context_hash
            )
            
            if cached_result is not None:
                results[check_key] = cached_result
            else:
                uncached_checks.append((check_key, check))
        
        # 第二轮：批量处理未缓存的检查
        if uncached_checks:
            batch_results = cls._batch_perform_permission_checks(user_id, uncached_checks)
            results.update(batch_results)
        
        return results
    
    @classmethod
    def _generate_context_hash(cls, context: Dict) -> str:
        """生成上下文哈希"""
        if not context:
            return ''
        
        # 排序确保一致性
        sorted_context = json.dumps(context, sort_keys=True)
        return hashlib.md5(sorted_context.encode()).hexdigest()[:8]
    
    @classmethod
    def _fetch_user_permissions_from_db(cls, user_id: int) -> List[Dict[str, Any]]:
        """从数据库获取用户权限"""
        # 这里实现实际的数据库查询逻辑
        pass
    
    @classmethod
    def _perform_permission_check(cls, user_id: int, resource: str, 
                                 action: str, context_hash: str) -> bool:
        """执行实际的权限检查"""
        # 这里实现实际的权限检查逻辑
        pass
    
    @classmethod
    def _invalidate_permission_check_cache(cls, user_id: int):
        """清除权限检查缓存"""
        # 这里可以实现基于模式的缓存清除
        # 或者使用缓存标记机制
        pass
    
    @classmethod  
    def _batch_perform_permission_checks(cls, user_id: int, 
                                        checks: List[tuple]) -> Dict[str, bool]:
        """批量执行权限检查"""
        # 这里实现批量权限检查逻辑
        pass
```

### 8.3 前端性能优化

```typescript
// frontend/src/composables/useRBACOptimized.ts
import { ref, computed, onMounted } from 'vue'
import { debounce } from 'lodash-es'

export const useRBACOptimized = () => {
  // 权限检查结果缓存
  const permissionCache = new Map<string, boolean>()
  const cacheTimeout = new Map<string, number>()
  const CACHE_TTL = 5 * 60 * 1000 // 5分钟缓存
  
  /**
   * 批量权限检查优化
   */
  const batchCheckPermissions = async (
    checks: Array<{resource: string, action: string, context?: any}>
  ): Promise<Map<string, boolean>> => {
    const results = new Map<string, boolean>()
    const uncachedChecks: typeof checks = []
    
    // 检查缓存
    for (const check of checks) {
      const cacheKey = generateCacheKey(check.resource, check.action, check.context)
      
      if (isValidCache(cacheKey)) {
        results.set(cacheKey, permissionCache.get(cacheKey)!)
      } else {
        uncachedChecks.push(check)
      }
    }
    
    // 批量处理未缓存的检查
    if (uncachedChecks.length > 0) {
      const batchResults = await rbacAPI.batchCheckPermissions({
        checks: uncachedChecks.map(check => ({
          resource: check.resource,
          action: check.action,
          context: check.context
        }))
      })
      
      // 更新缓存
      batchResults.forEach((result, index) => {
        const check = uncachedChecks[index]
        const cacheKey = generateCacheKey(check.resource, check.action, check.context)
        
        updateCache(cacheKey, result)
        results.set(cacheKey, result)
      })
    }
    
    return results
  }
  
  /**
   * 防抖权限检查
   */
  const debouncedPermissionCheck = debounce(async (
    resource: string, 
    action: string, 
    context?: any
  ) => {
    const cacheKey = generateCacheKey(resource, action, context)
    
    if (isValidCache(cacheKey)) {
      return permissionCache.get(cacheKey)
    }
    
    const result = await rbacAPI.checkPermission(resource, action, context)
    updateCache(cacheKey, result)
    
    return result
  }, 100) // 100ms防抖
  
  /**
   * 智能预加载权限
   */
  const preloadPermissions = async (userId: number) => {
    // 根据用户角色预加载常用权限
    const userRoles = rbacStore.userRoles
    const commonPermissions = getCommonPermissionsByRoles(userRoles)
    
    // 批量预加载
    await batchCheckPermissions(commonPermissions)
  }
  
  /**
   * 权限变更时清除缓存
   */
  const clearPermissionCache = () => {
    permissionCache.clear()
    cacheTimeout.clear()
  }
  
  // 工具函数
  const generateCacheKey = (resource: string, action: string, context?: any): string => {
    const contextStr = context ? JSON.stringify(context) : ''
    return `${resource}.${action}.${btoa(contextStr).slice(0, 8)}`
  }
  
  const isValidCache = (cacheKey: string): boolean => {
    if (!permissionCache.has(cacheKey)) return false
    
    const timeout = cacheTimeout.get(cacheKey)
    if (!timeout || Date.now() > timeout) {
      permissionCache.delete(cacheKey)
      cacheTimeout.delete(cacheKey)
      return false
    }
    
    return true
  }
  
  const updateCache = (cacheKey: string, result: boolean) => {
    permissionCache.set(cacheKey, result)
    cacheTimeout.set(cacheKey, Date.now() + CACHE_TTL)
  }
  
  const getCommonPermissionsByRoles = (roles: Array<{code: string}>) => {
    const commonPermissions = []
    
    // 根据角色预定义常用权限
    const rolePermissionMap = {
      'instructor': [
        {resource: 'course', action: 'create'},
        {resource: 'course', action: 'update'},
        {resource: 'course', action: 'read'},
      ],
      'premium_member': [
        {resource: 'course', action: 'access'},
        {resource: 'member_content', action: 'read'},
      ],
      // ... 其他角色的常用权限
    }
    
    roles.forEach(role => {
      const permissions = rolePermissionMap[role.code as keyof typeof rolePermissionMap]
      if (permissions) {
        commonPermissions.push(...permissions)
      }
    })
    
    return commonPermissions
  }
  
  return {
    batchCheckPermissions,
    debouncedPermissionCheck,
    preloadPermissions,
    clearPermissionCache,
  }
}
```

---

## 🎯 9. 快速启动指南

### 9.1 立即可执行的bmad命令

基于你的项目现状和RBAC需求，以下是可以立即使用的bmad命令序列：

```bash
# 1. 深度分析项目架构（必须首先执行）
/understand

# 2. 生成RBAC模块脚手架
/scaffold rbac-module

# 3. 安全扫描现有代码
/security-scan

# 4. 全面代码质量审查
/review

# 5. 实现权限控制设计模式
/implement rbac-patterns

# 6. 性能测试和优化
/test

# 7. 清理和优化代码
/refactor

# 8. 提交变更
/commit
```

### 9.2 开发环境快速配置

```bash
# 安装RBAC相关依赖
cd backend
pip install django-guardian django-rules redis

# 前端依赖
cd frontend  
npm install @vueuse/core lodash-es

# 创建RBAC应用
cd backend
python manage.py startapp rbac
```

### 9.3 数据库快速初始化

```sql
-- 创建基础角色数据
INSERT INTO rbac_roles (name, code, description, level, is_system) VALUES
('超级管理员', 'super_admin', '系统最高权限', 4, true),
('平台管理员', 'platform_admin', '平台运营管理', 3, true),
('教学主管', 'education_manager', '教学内容管理', 3, true),
('课程讲师', 'instructor', '课程创建和管理', 2, true),
('运营专员', 'operations', '营销和用户运营', 2, true),
('SEO专员', 'seo_specialist', 'SEO和内容优化', 2, true),
('客服代表', 'customer_service', '用户服务支持', 1, true),
('付费会员', 'premium_member', '付费会员用户', 1, true),
('免费用户', 'free_user', '注册用户', 0, true),
('访客', 'guest', '未注册访客', 0, true);

-- 创建基础权限数据
INSERT INTO rbac_permissions (resource, action, description) VALUES
('course', 'create', '创建课程'),
('course', 'read', '查看课程'),
('course', 'update', '更新课程'),
('course', 'delete', '删除课程'),
('course', 'access', '访问课程内容'),
('user', 'create', '创建用户'),
('user', 'read', '查看用户信息'),
('user', 'update', '更新用户信息'),
('user', 'delete', '删除用户'),
('order', 'create', '创建订单'),
('order', 'read', '查看订单'),
('order', 'update', '更新订单'),
('order', 'refund', '订单退款');
```

---

## 🔍 10. 监控和维护

### 10.1 权限健康检查

```python
# backend/apps/rbac/health_check.py
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from ..models import Role, Permission, UserRole, RolePermission
from ..services import rbac_service

class Command(BaseCommand):
    help = '权限系统健康检查'
    
    def handle(self, *args, **options):
        self.stdout.write('开始权限系统健康检查...')
        
        # 检查孤儿权限
        orphan_permissions = self.check_orphan_permissions()
        if orphan_permissions:
            self.stdout.write(
                self.style.WARNING(f'发现 {len(orphan_permissions)} 个孤儿权限')
            )
        
        # 检查过期角色
        expired_roles = self.check_expired_user_roles()
        if expired_roles:
            self.stdout.write(
                self.style.WARNING(f'发现 {len(expired_roles)} 个过期角色分配')
            )
        
        # 检查权限冲突
        conflicts = self.check_permission_conflicts()
        if conflicts:
            self.stdout.write(
                self.style.ERROR(f'发现 {len(conflicts)} 个权限冲突')
            )
        
        # 检查超级管理员
        super_admins = self.check_super_admins()
        self.stdout.write(f'当前超级管理员数量: {len(super_admins)}')
        
        self.stdout.write(self.style.SUCCESS('权限健康检查完成'))
    
    def check_orphan_permissions(self):
        """检查没有被任何角色使用的权限"""
        return Permission.objects.filter(
            rolepermission__isnull=True
        )
    
    def check_expired_user_roles(self):
        """检查过期的用户角色分配"""
        from django.utils import timezone
        return UserRole.objects.filter(
            expires_at__lt=timezone.now(),
            is_active=True
        )
    
    def check_permission_conflicts(self):
        """检查权限冲突（同一用户的不同角色有相冲突的权限）"""
        conflicts = []
        users_with_multiple_roles = User.objects.filter(
            userrole__isnull=False
        ).distinct().annotate(
            role_count=models.Count('userrole')
        ).filter(role_count__gt=1)
        
        for user in users_with_multiple_roles:
            user_permissions = rbac_service.get_user_permissions(user)
            # 检查是否有granted=False和granted=True的同一权限
            permission_map = {}
            for perm in user_permissions:
                key = f"{perm['resource']}.{perm['action']}"
                if key not in permission_map:
                    permission_map[key] = []
                permission_map[key].append(perm['granted'])
            
            for perm_key, granted_list in permission_map.items():
                if True in granted_list and False in granted_list:
                    conflicts.append({
                        'user': user,
                        'permission': perm_key,
                        'conflict': '同时存在授予和拒绝'
                    })
        
        return conflicts
    
    def check_super_admins(self):
        """检查超级管理员账户"""
        return User.objects.filter(
            userrole__role__code='super_admin',
            userrole__is_active=True
        )
```

### 10.2 权限使用统计

```python
# backend/apps/rbac/analytics.py
from django.db.models import Count, Q
from django.utils import timezone
from datetime import timedelta
from .models import AuditLog, UserRole, Role

class RBACAnalytics:
    """RBAC系统分析统计"""
    
    @staticmethod
    def get_permission_usage_stats(days: int = 30) -> dict:
        """获取权限使用统计"""
        start_date = timezone.now() - timedelta(days=days)
        
        # 权限访问频率
        permission_access = AuditLog.objects.filter(
            timestamp__gte=start_date
        ).values('resource', 'action').annotate(
            count=Count('id')
        ).order_by('-count')
        
        # 高风险操作统计
        high_risk_operations = AuditLog.objects.filter(
            timestamp__gte=start_date,
            risk_level__in=['HIGH', 'CRITICAL']
        ).values('action', 'resource').annotate(
            count=Count('id')
        )
        
        # 用户活跃度统计
        user_activity = AuditLog.objects.filter(
            timestamp__gte=start_date
        ).values('user').annotate(
            action_count=Count('id')
        ).order_by('-action_count')[:10]
        
        return {
            'permission_access': list(permission_access),
            'high_risk_operations': list(high_risk_operations),
            'top_active_users': list(user_activity),
            'total_operations': AuditLog.objects.filter(
                timestamp__gte=start_date
            ).count()
        }
    
    @staticmethod
    def get_role_distribution() -> dict:
        """获取角色分布统计"""
        role_stats = Role.objects.annotate(
            user_count=Count('userrole', filter=Q(userrole__is_active=True))
        ).values('name', 'code', 'user_count')
        
        return {
            'role_distribution': list(role_stats),
            'total_roles': Role.objects.count(),
            'active_assignments': UserRole.objects.filter(is_active=True).count()
        }
    
    @staticmethod
    def get_security_metrics(days: int = 7) -> dict:
        """获取安全指标"""
        start_date = timezone.now() - timedelta(days=days)
        
        # 权限拒绝统计
        permission_denials = AuditLog.objects.filter(
            timestamp__gte=start_date,
            action='PERMISSION_DENIED'
        ).count()
        
        # 异常访问模式
        unusual_access = AuditLog.objects.filter(
            timestamp__gte=start_date,
            risk_level='HIGH'
        ).values('user').annotate(
            count=Count('id')
        ).filter(count__gt=10)
        
        return {
            'permission_denials': permission_denials,
            'unusual_access_users': list(unusual_access),
            'critical_operations': AuditLog.objects.filter(
                timestamp__gte=start_date,
                risk_level='CRITICAL'
            ).count()
        }
```

---

## 📚 11. 总结与后续规划

### 11.1 核心价值总结

通过实施这套RBAC权限管理系统，UAI教育平台将获得以下核心价值：

1. **业务支撑能力**
   - 完美支撑7层课程体系的复杂权限需求
   - 灵活的会员权益管控机制
   - 多角色协作的权限边界清晰

2. **安全保障能力**
   - 细粒度的数据访问控制
   - 完整的操作审计追踪
   - 零信任安全架构防护

3. **运营效率提升**
   - 自动化权限管理减少人工成本
   - 智能权限推荐提升配置效率
   - 可视化管理界面降低操作门槛

4. **系统可扩展性**
   - 支持未来多租户业务扩展
   - 插件化架构支持定制需求
   - 高性能设计支撑业务增长

### 11.2 后续发展规划

#### 短期优化 (3-6个月)
- **AI权限助手**：基于用户行为的智能权限建议
- **移动端适配**：扩展权限控制到移动应用
- **第三方集成**：支持钉钉、企微等企业应用集成

#### 中期扩展 (6-12个月)  
- **多租户架构**：支持多机构、多品牌独立权限管理
- **权限工作流**：复杂权限申请和审批流程
- **合规审计**：满足教育行业监管要求的审计功能

#### 长期愿景 (1-2年)
- **权限智能化**：机器学习驱动的权限优化建议
- **跨系统权限**：统一身份认证和权限管理平台
- **权限即服务**：为其他教育平台提供权限管理SaaS

### 11.3 成功指标定义

| 指标类别 | 具体指标 | 目标值 | 测量方式 |
|----------|----------|--------|----------|
| **性能指标** | 权限检查响应时间 | <100ms | API监控 |
| **安全指标** | 未授权访问拦截率 | >99% | 审计日志分析 |
| **业务指标** | 权限配置错误率 | <1% | 错误日志统计 |
| **用户体验** | 权限相关用户投诉 | <5件/月 | 客服系统统计 |
| **运营效率** | 权限管理人工时间 | 减少70% | 工作量对比 |

### 11.4 风险控制措施

1. **技术风险控制**
   - 完整的自动化测试覆盖
   - 灰度发布和快速回滚机制
   - 多环境验证确保稳定性

2. **业务风险控制**  
   - 权限变更必须经过审批
   - 关键操作需要双人确认
   - 定期权限审计和清理

3. **安全风险控制**
   - 代码安全审查流程
   - 渗透测试和漏洞扫描
   - 应急响应预案制定

---

**🎉 祝你在UAI教育平台的RBAC实施过程中一切顺利！**

这份技术规范提供了完整的实施路线图，结合bmad命令工具的使用，将帮助你快速构建一个安全、高效、可扩展的权限管理系统。记住，权限管理是一个持续优化的过程，保持对新技术和最佳实践的关注，让系统始终保持先进性和安全性。