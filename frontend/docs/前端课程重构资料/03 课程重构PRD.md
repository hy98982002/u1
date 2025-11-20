# 课程级别重构 PRD 文档

## 1. 项目背景

根据提供的 SEO/AEO 最佳实践文档（doviai课程设置新版.md 和 doviai课程五维设置说明.md），当前网站的课程级别体系需要重构，以符合 LRMI + Schema.org + AEO 标准，提升网站的搜索引擎优化效果。

## 2. 重构目标

将当前的课程级别体系从「免费、入门、精进、实战、项目落地」重构为符合标准的三级体系：「入门、进阶、高阶」，并确保网站所有相关组件和数据都能正确适配新的级别体系。

## 3. 涉及修改的 Vue 文件

### 3.1 核心数据结构文件

**文件：** `src/types/index.ts`
- 修改 `STAGES` 枚举，将五级体系替换为三级体系
- 更新 `STAGE_STYLES` 映射，确保新级别的样式正确
- 调整 `COURSE_CARD_TEMPLATES` 中的级别定义

### 3.2 组件文件

**文件：** `src/components/StageTabs.vue`
- 更新阶段标签显示，使用新的三级体系（入门、进阶、高阶）
- 保持会员专区按钮的功能不变

**文件：** `src/components/CourseCard.vue`
- 确保课程卡片正确显示新的级别信息
- 保持其他功能和样式不变

**文件：** `src/components/CampSection.vue`
- 更新课程筛选逻辑，适配新的级别体系
- 保持其他功能不变

**文件：** `src/components/LessonRow.vue`
- 确保课程行显示正确的新级别信息

### 3.3 数据文件

**文件：** `src/store/courseStore.ts`
- 将现有课程数据中的 `level` 字段从旧体系映射到新体系
- 更新课程的 `stage` 字段以匹配新的级别定义

**文件：** `src/utils/stageMap.ts`
- 更新级别映射逻辑，确保正确显示中文级别名称

**文件：** `src/utils/slug.ts`
- 更新课程级别关键词过滤逻辑

## 4. 实现步骤

### 4.1 数据结构修改

修改 `src/types/index.ts` 文件，将五级体系替换为三级体系：

```typescript
// 修改前
export const STAGES = {
  free: '免费',
  basic: '入门',
  advanced: '精进',
  project: '实战',
  landing: '项目落地'
} as const

// 修改后
export const STAGES = {
  basic: '入门',
  intermediate: '进阶',
  advanced: '高阶'
} as const
```

### 4.2 组件更新

修改 `src/components/StageTabs.vue` 组件，使用新的级别体系：

```vue
<template>
  <div class="stage-tabs-container">
    <div class="d-flex justify-content-start flex-wrap gap-2">
      <!-- 普通阶段按钮 -->
      <button
        v-for="(stage, key) in STAGES"
        :key="key"
        :class="['btn', 'stage-tab-btn', { active: activeStage === key && !showVipOnly }]"
        @click="handleStageChange(key)"
      >
        {{ stage }}
      </button>

      <!-- 会员专区按钮 -->
      <button
        :class="['btn', 'stage-tab-btn', 'vip-btn', { active: showVipOnly }]"
        @click="handleVipToggle"
      >
        <i class="fas fa-crown me-1"></i>
        会员专区
      </button>
    </div>
  </div>
</template>
```

### 4.3 数据迁移

更新 `src/store/courseStore.ts` 中的课程数据，将现有级别映射到新的体系：

```typescript
// 示例映射规则
const levelMapping = {
  '入门': '入门',
  '初级': '入门',
  '精进': '进阶',
  '中级': '进阶',
  '实战': '高阶',
  '项目落地': '高阶',
  '高级': '高阶'
}

// 更新课程数据
courses.forEach(course => {
  course.level = levelMapping[course.level] || '入门'
  // 更新stage字段
  if (course.stage === 'free' || course.stage === 'basic') {
    course.stage = 'basic'
  } else if (course.stage === 'advanced' || course.stage === 'project') {
    course.stage = 'intermediate'
  } else if (course.stage === 'landing') {
    course.stage = 'advanced'
  }
})
```

## 5. 技术要点

### 5.1 SEO/AEO 标准支持

- 确保新的级别体系符合 LRMI 教学类型标准
- 为每个级别定义清晰的教育用途（educationalUse）
- 确保 JSON-LD 标记能够正确反映新的级别体系

### 5.2 向后兼容性

- 确保重构后的代码能够正确处理旧的课程数据
- 提供数据迁移脚本，确保现有课程数据能够平滑过渡到新的级别体系

### 5.3 性能优化

- 确保重构不会影响网站的加载性能
- 优化课程筛选和级别切换的响应速度

## 6. 测试计划

1. **功能测试**：
   - 验证新的级别标签能够正确显示
   - 验证课程筛选功能在新级别体系下正常工作
   - 验证课程卡片能够正确显示新的级别信息

2. **SEO/AEO 测试**：
   - 验证页面的 JSON-LD 标记符合标准
   - 验证搜索引擎能够正确识别新的级别体系

3. **响应式测试**：
   - 验证新的级别标签在不同屏幕尺寸下都能正确显示
   - 验证移动端和桌面端的用户体验一致

## 7. 验收标准

1. 网站的课程级别体系已从五级重构为三级（入门、进阶、高阶）
2. 所有相关组件都能正确适配新的级别体系
3. 课程数据已成功迁移到新的级别体系
4. 页面的 JSON-LD 标记符合 SEO/AEO 标准
5. 网站的功能和性能没有受到负面影响

## 8. 风险评估

1. **数据迁移风险**：现有课程数据的级别映射可能存在不一致
   - 缓解措施：提供详细的数据映射规则，确保迁移过程可追溯

2. **SEO 影响风险**：重构可能暂时影响网站的搜索引擎排名
   - 缓解措施：确保重构过程符合 SEO 最佳实践，减少对现有页面结构的影响

3. **用户体验风险**：用户可能需要时间适应新的级别体系
   - 缓解措施：保持界面的其他元素不变，仅修改级别标签，减少用户的学习成本

---

以上是课程级别重构的完整 PRD 文档和需要修改的 Vue 文件列表。如果您对文档有任何疑问或需要进一步的说明，请随时告诉我。