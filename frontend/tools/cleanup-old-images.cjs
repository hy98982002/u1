#!/usr/bin/env node
/**
 * 清理旧格式的重复图片文件
 * 这些文件已经有对应的新格式版本，可以安全删除
 */

const fs = require('fs')
const path = require('path')

const IMAGES_DIR = path.join(__dirname, '../src/assets/images/courses')

// 需要删除的旧前缀（这些文件已经有新格式版本）
const OLD_PREFIXES = ['free-', 'hands-on-', 'project-ps-']

/**
 * 检查并删除旧格式文件
 */
function cleanupOldImages() {
  console.log('🧹 开始清理重复的旧格式图片...\n')
  console.log(`📁 目标目录: ${IMAGES_DIR}\n`)

  let files
  try {
    files = fs.readdirSync(IMAGES_DIR)
  } catch (error) {
    console.error(`❌ 读取目录失败: ${error.message}`)
    process.exit(1)
  }

  const stats = {
    total: 0,
    deleted: 0,
    errors: 0
  }

  const deletedFiles = []

  // 遍历所有文件
  files.forEach(filename => {
    // 检查是否是旧前缀
    const isOldFormat = OLD_PREFIXES.some(prefix => filename.startsWith(prefix))

    if (!isOldFormat) {
      return
    }

    stats.total++
    const filePath = path.join(IMAGES_DIR, filename)

    try {
      fs.unlinkSync(filePath)
      console.log(`🗑️  删除: ${filename}`)
      stats.deleted++
      deletedFiles.push(filename)
    } catch (error) {
      console.error(`❌ 删除失败 ${filename}: ${error.message}`)
      stats.errors++
    }
  })

  // 输出统计
  console.log('\n' + '='.repeat(60))
  console.log('📊 清理完成统计：')
  console.log('='.repeat(60))
  console.log(`旧格式文件总数: ${stats.total}`)
  console.log(`✅ 成功删除: ${stats.deleted}`)
  console.log(`❌ 错误: ${stats.errors}`)
  console.log('='.repeat(60))

  if (deletedFiles.length > 0) {
    console.log('\n📋 已删除的文件（按前缀分组）：')
    console.log('='.repeat(60))

    OLD_PREFIXES.forEach(prefix => {
      const files = deletedFiles.filter(f => f.startsWith(prefix))
      if (files.length > 0) {
        console.log(`\n${prefix}: ${files.length} 个文件`)
        files.slice(0, 3).forEach(f => console.log(`  - ${f}`))
        if (files.length > 3) {
          console.log(`  ... 还有 ${files.length - 3} 个文件`)
        }
      }
    })
  }

  console.log('\n✨ 清理脚本执行完毕！\n')

  if (stats.errors > 0) {
    process.exit(1)
  }
}

// 执行清理
cleanupOldImages()
