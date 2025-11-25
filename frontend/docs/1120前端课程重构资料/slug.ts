// slug.ts
// 生成课程 slug，符合三引擎 AEO（Google / Bing / 百度）最佳规则

// 课程级别英文映射
const LEVEL_SLUG_MAP: Record<string, string> = {
  basic: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced'
}

// 清理文本：去掉中文括号、特殊符号、空格
function normalizeTitle(title: string): string {
  return title
    .replace(/（.*?）/g, '') // 去掉中文括号内容：例如 “设计课（入门）”
    .replace(/\(.*?\)/g, '') // 去掉英文括号内容
    .replace(/[·•—–]/g, ' ') // 替换特殊分隔符
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5 ]/g, '') // 保留中英文+数字
    .trim()
}

// 中文转 slug-friendly 拼音（可选，前端阶段暂用英文关键词）
function chineseToSlugKeyword(str: string): string {
  // 你的标题一般是：AI / Photoshop / 设计课 → 不需要转拼音
  // 若未来需要支持中文拼音，可在此加入 pinyin 库
  return str
}

// 转连字符 slug
function toSlug(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-') // 空格转连字符
    .replace(/-+/g, '-') // 合并多余的 -
}

// 主函数：生成课程 slug
export function generateCourseSlug(title: string, level: string): string {
  const normalized = normalizeTitle(title)

  // 若含中文并需要词根，可在此定制提取逻辑
  // 当前阶段：直接使用英文关键词切词结构
  const mainPart = toSlug(chineseToSlugKeyword(normalized))

  const levelSlug = LEVEL_SLUG_MAP[level] || 'beginner'

  // 最终结构：topic-topic-topic-level
  return `${mainPart}-${levelSlug}`
}

// 用于 Program JSON-LD、路径显示等
export function getLevelSlug(level: string): string {
  return LEVEL_SLUG_MAP[level] || 'beginner'
}
