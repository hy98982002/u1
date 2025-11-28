#!/usr/bin/env node

/**
 * 扫描代码中的旧阶段枚举值
 * 阻止包含遗留阶段名的代码进入主分支
 */

const fs = require('fs')
const path = require('path')

// 旧阶段枚举值（需要被移除的）
// 注意：advanced 是新体系的合法值，不应检测
const LEGACY_STAGES = [
  'tiyan',
  'rumen',
  'jingjin',
  'shizhan',
  'xiangmuluodi',
  'free',
  'beginner',
  'hands-on',
  'project',
  'vip',
  'landing'
]

// 排除的目录
const EXCLUDED_DIRS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  'tools', // 排除tools目录本身
  'docs'
]

// 需要扫描的文件扩展名
const SCAN_EXTENSIONS = ['.ts', '.js', '.vue', '.tsx', '.jsx']

let hasLegacy = false
const foundIssues = []

/**
 * 递归扫描目录
 */
function scanDirectory(dir) {
  const files = fs.readdirSync(dir)

  for (const file of files) {
    const filePath = path.join(dir, file)
    const stat = fs.statSync(filePath)

    if (stat.isDirectory()) {
      if (!EXCLUDED_DIRS.includes(file)) {
        scanDirectory(filePath)
      }
    } else if (stat.isFile()) {
      const ext = path.extname(file)
      if (SCAN_EXTENSIONS.includes(ext)) {
        scanFile(filePath)
      }
    }
  }
}

/**
 * 扫描单个文件
 */
function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n')

  lines.forEach((line, index) => {
    // 跳过注释行
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
      return
    }

    // 跳过LEGACY_相关的映射代码（这些是合法的迁移代码）
    if (line.includes('LEGACY_STAGE_MAP') || line.includes('旧字段：将映射')) {
      return
    }

    // 跳过类型定义中的遗留类型（LegacyStage等）
    if (line.includes('LegacyStage') || line.includes('LegacyTemplate')) {
      return
    }

    // 跳过fetchpriority属性（这是HTML优先级，不是阶段）
    if (line.includes('fetchpriority')) {
      return
    }

    // 跳过type定义行（如 | 'free'）
    if (line.trim().startsWith('|')) {
      return
    }

    // 跳过filename前缀检查（如 startsWith('free-')）
    if (line.includes('startsWith(') || line.includes('filename')) {
      return
    }

    // 跳过URL slug映射（如 basic: 'beginner'）
    if (line.includes('LEVEL_SLUG_MAP') || line.includes('SLUG_')) {
      return
    }

    // 跳过注释中的示例文本（如 // 如："Beginner"）
    if (line.includes('如：') || line.includes('例如：')) {
      return
    }

    // 跳过映射语句（如 basic: 'beginner', intermediate: 'advanced'）
    if (/:\s*['"`](beginner|free|hands-on|project|vip)['"`]/.test(line) &&
        (line.includes('basic:') || line.includes('intermediate:') || line.includes('advanced:'))) {
      return
    }

    // 跳过StageMeta对象定义（如 'hands-on': { ... }）
    if (line.trim().match(/^['"`](beginner|free|hands-on|project|vip)['"`]:\s*\{/)) {
      return
    }

    // 检查每个旧阶段值
    LEGACY_STAGES.forEach(stage => {
      // 使用正则匹配，确保是完整的单词
      const regex = new RegExp(`['"\`]${stage}['"\`]`, 'gi')
      if (regex.test(line)) {
        hasLegacy = true
        const issue = {
          file: path.relative(process.cwd(), filePath),
          line: index + 1,
          stage,
          content: line.trim()
        }
        foundIssues.push(issue)
      }
    })
  })
}

// 开始扫描
console.log('🔍 开始扫描遗留阶段枚举值...\n')

const srcPath = path.join(__dirname, '../src')
if (fs.existsSync(srcPath)) {
  scanDirectory(srcPath)
}

// 输出结果
if (hasLegacy) {
  console.log('❌ 发现遗留阶段枚举值！\n')
  console.log('以下文件包含旧的阶段值，需要更新为新的三级体系（basic/intermediate/advanced）：\n')

  foundIssues.forEach(issue => {
    console.log(`📁 ${issue.file}:${issue.line}`)
    console.log(`   阶段值: "${issue.stage}"`)
    console.log(`   代码: ${issue.content}`)
    console.log('')
  })

  console.log('请将旧的阶段值更新为：')
  console.log('  - basic (基础)')
  console.log('  - intermediate (进阶)')
  console.log('  - advanced (高级)')
  console.log('')

  process.exit(1)
} else {
  console.log('✅ 未发现遗留阶段枚举值')
  console.log('✅ 代码符合纯新阶段标准\n')
  process.exit(0)
}
