#!/usr/bin/env node
/**
 * 课程图片重命名脚本
 * 将旧的7层体系图片名称统一改为新的3层体系规则
 *
 * 重命名规则：
 * - free-* → {courseName}-basic-*
 * - beginner-* → {courseName}-basic-* (保持语义，beginner对应basic)
 * - advanced-* → {courseName}-intermediate-* (旧的advanced对应新的intermediate)
 * - hands-on-* → {courseName}-intermediate-*
 * - project-* → {courseName}-intermediate-* (项目实战课归为进阶)
 * - vip-* → {courseName}-membership-intermediate-* (会员专享课)
 */

const fs = require('fs')
const path = require('path')

// 图片目录路径
const IMAGES_DIR = path.join(__dirname, '../src/assets/images/courses')

// 阶段映射规则（旧前缀 → 新阶段）
const STAGE_MAPPING = {
  'free': 'basic',
  'beginner': 'basic',
  'advanced': 'intermediate', // 旧的advanced对应新的intermediate
  'hands-on': 'intermediate',
  'project': 'intermediate',
  'vip': 'membership-intermediate' // 会员专享课用membership标识
}

// 课程名称标准化映射
const COURSE_NAME_MAPPING = {
  'ps': 'photoshop',
  'ps2': 'photoshop-advanced', // ps2系列归为photoshop高阶版
  'logo': 'logo-design',
  'logo2': 'logo-design-advanced'
}

/**
 * 解析文件名并生成新文件名
 * @param {string} filename 原文件名
 * @returns {string|null} 新文件名，如果不需要重命名则返回null
 */
function generateNewFilename(filename) {
  // 匹配模式：{stage}-{courseName}-cover-{width}.{ext}
  const match = filename.match(/^([a-z-]+)-([a-z0-9]+)-cover-(\d+)\.(png|webp)$/)

  if (!match) {
    console.warn(`⚠️  跳过非标准格式文件: ${filename}`)
    return null
  }

  const [, oldStage, courseName, width, ext] = match

  // 检查是否是旧阶段
  if (!STAGE_MAPPING[oldStage]) {
    console.log(`✓ 保持不变（已是新格式）: ${filename}`)
    return null
  }

  // 获取新阶段
  const newStage = STAGE_MAPPING[oldStage]

  // 标准化课程名称
  const standardCourseName = COURSE_NAME_MAPPING[courseName] || courseName

  // 生成新文件名
  // 格式：{courseName}-{stage}-cover-{width}.{ext}
  const newFilename = `${standardCourseName}-${newStage}-cover-${width}.${ext}`

  return newFilename
}

/**
 * 执行批量重命名
 */
function renameImages() {
  console.log('🚀 开始执行课程图片重命名...\n')
  console.log(`📁 目标目录: ${IMAGES_DIR}\n`)

  // 读取目录下所有文件
  let files
  try {
    files = fs.readdirSync(IMAGES_DIR)
  } catch (error) {
    console.error(`❌ 读取目录失败: ${error.message}`)
    process.exit(1)
  }

  // 统计信息
  const stats = {
    total: files.length,
    renamed: 0,
    skipped: 0,
    errors: 0
  }

  // 重命名映射表（用于最后汇总显示）
  const renameLog = []

  // 遍历所有文件
  files.forEach(filename => {
    const newFilename = generateNewFilename(filename)

    if (!newFilename) {
      stats.skipped++
      return
    }

    if (newFilename === filename) {
      stats.skipped++
      return
    }

    const oldPath = path.join(IMAGES_DIR, filename)
    const newPath = path.join(IMAGES_DIR, newFilename)

    // 检查目标文件是否已存在
    if (fs.existsSync(newPath)) {
      console.error(`❌ 目标文件已存在: ${newFilename}`)
      stats.errors++
      return
    }

    // 执行重命名
    try {
      fs.renameSync(oldPath, newPath)
      console.log(`✅ ${filename}`)
      console.log(`   → ${newFilename}\n`)
      stats.renamed++
      renameLog.push({ old: filename, new: newFilename })
    } catch (error) {
      console.error(`❌ 重命名失败 ${filename}: ${error.message}`)
      stats.errors++
    }
  })

  // 输出统计信息
  console.log('\n' + '='.repeat(60))
  console.log('📊 重命名完成统计：')
  console.log('='.repeat(60))
  console.log(`总文件数: ${stats.total}`)
  console.log(`✅ 成功重命名: ${stats.renamed}`)
  console.log(`⏭️  跳过（无需改名）: ${stats.skipped}`)
  console.log(`❌ 错误: ${stats.errors}`)
  console.log('='.repeat(60))

  // 输出重命名映射摘要
  if (renameLog.length > 0) {
    console.log('\n📋 重命名映射摘要（按阶段分组）：')
    console.log('='.repeat(60))

    const groupedByStage = {}
    renameLog.forEach(({ old, new: newName }) => {
      const oldStage = old.split('-')[0]
      const newStage = newName.split('-').find(part =>
        ['basic', 'intermediate', 'advanced', 'membership'].includes(part.split('-')[0])
      )

      const key = `${oldStage} → ${newStage}`
      if (!groupedByStage[key]) {
        groupedByStage[key] = []
      }
      groupedByStage[key].push(old)
    })

    Object.entries(groupedByStage).forEach(([mapping, files]) => {
      console.log(`\n${mapping}: ${files.length} 个文件`)
      files.slice(0, 3).forEach(file => console.log(`  - ${file}`))
      if (files.length > 3) {
        console.log(`  ... 还有 ${files.length - 3} 个文件`)
      }
    })
  }

  console.log('\n✨ 重命名脚本执行完毕！\n')

  // 如果有错误，返回非零退出码
  if (stats.errors > 0) {
    process.exit(1)
  }
}

// 执行主函数
renameImages()
