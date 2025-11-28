#!/usr/bin/env node

/**
 * 遗留代码扫描工具
 * 扫描项目中是否存在旧阶段枚举值，确保代码库清洁
 *
 * 旧阶段关键词：free, project, landing, high, beginner（部分场景）
 * 新阶段枚举：basic, intermediate, advanced
 *
 * 用法：
 *   node tools/scan-legacy.js
 *   npm run scan:legacy
 */

import { globby } from 'globby'
import fs from 'fs/promises'
import path from 'path'

// ============================================
// 配置
// ============================================

// 合法使用模式 - 这些不应该被标记为遗留代码
const WHITELISTED_PATTERNS = [
  /fetchpriority=["']high["']/gi, // HTML fetchpriority属性
  /portfolio-project-/gi, // CSS类名前缀
  /class=["'][^"']*project[^"']*["']/gi, // CSS class属性
  /educationalUse\.push\(['"]Project['"]\)/gi, // LRMI教学用途类型
  /EducationalUse[\s\S]*?'Project'/gi, // 类型定义中的Project
  /-free-|-project-|-high-/gi, // 文件名中的阶段标识
  /\/\/.*?(free|project|landing|high)/gi, // 单行注释
  /\/\*[\s\S]*?(free|project|landing|high)[\s\S]*?\*\//gi // 多行注释
]

// 旧阶段关键词正则
const LEGACY_PATTERNS = [
  /'(free|project|landing)'/gi, // 单引号字符串 (排除high,因为HTML属性)
  /"(free|project|landing)"/gi, // 双引号字符串
  /`(free|project|landing)`/gi, // 模板字符串
  /stage:\s*['"](?:free|project|landing)['"]/gi, // stage属性赋值
  /===\s*['"](?:free|project|landing)['"]/gi // 严格相等比较
]

// 扫描目录和文件类型
const SCAN_PATTERNS = [
  'src/**/*.{ts,vue,js,jsx,tsx}',
  '!src/**/*.spec.{ts,js}', // 排除测试文件
  '!src/**/*.test.{ts,js}'
]

// 排除的目录
const EXCLUDE_DIRS = [
  'node_modules',
  'dist',
  'build',
  '.git',
  'coverage',
  'docs' // 排除文档目录（可能包含历史说明）
]

// ============================================
// 扫描逻辑
// ============================================

async function scanLegacyCode() {
  console.log('🔍 开始扫描遗留代码...\n')

  try {
    // 查找所有需要扫描的文件
    const files = await globby(SCAN_PATTERNS, {
      cwd: process.cwd(),
      ignore: EXCLUDE_DIRS.map(dir => `**/${dir}/**`)
    })

    console.log(`📂 扫描文件数量: ${files.length}\n`)

    let hasLegacy = false
    const legacyFiles = []

    // 逐个文件检查
    for (const file of files) {
      const filePath = path.resolve(process.cwd(), file)
      let content = await fs.readFile(filePath, 'utf8')

      // 先移除白名单模式的内容,避免误报
      let cleanedContent = content
      for (const pattern of WHITELISTED_PATTERNS) {
        cleanedContent = cleanedContent.replace(pattern, '')
      }

      // 检查清理后的内容是否包含旧阶段关键词
      const matches = []
      for (const pattern of LEGACY_PATTERNS) {
        const found = cleanedContent.match(pattern)
        if (found) {
          matches.push(...found)
        }
      }

      if (matches.length > 0) {
        hasLegacy = true
        legacyFiles.push({
          file,
          matches: [...new Set(matches)] // 去重
        })

        console.log(`❌ ${file}`)
        console.log(`   发现遗留值: ${matches.join(', ')}`)
        console.log('')
      }
    }

    // 输出结果
    console.log('━'.repeat(60))
    if (hasLegacy) {
      console.log(`\n❌ 扫描结果：发现 ${legacyFiles.length} 个文件包含遗留代码\n`)
      console.log('请移除以下旧阶段枚举值：')
      console.log('  - free → basic')
      console.log('  - project → advanced')
      console.log('  - landing → basic')
      console.log('  - high → advanced')
      console.log('')
      process.exit(1)
    } else {
      console.log('\n✅ 扫描结果：未发现遗留代码，代码库清洁！\n')
      process.exit(0)
    }
  } catch (error) {
    console.error('❌ 扫描过程中出错：', error)
    process.exit(1)
  }
}

// ============================================
// 执行扫描
// ============================================

scanLegacyCode()
