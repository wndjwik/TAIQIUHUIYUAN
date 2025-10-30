const { execSync } = require('child_process')
const fs = require('fs')
const path = require('path')

console.log('🚀 开始构建台球厅会员管理系统桌面应用...')

// 检查必要文件
const requiredFiles = [
  'package.json',
  'vite.config.js',
  'electron/main.js',
  'electron-builder.config.js',
  'src/',
  'backend/'
]

console.log('🔍 检查项目文件...')
for (const file of requiredFiles) {
  if (!fs.existsSync(path.join(__dirname, file))) {
    console.error(`❌ 缺少必要文件: ${file}`)
    process.exit(1)
  }
}
console.log('✅ 项目文件检查完成')

// 构建步骤
async function build() {
  try {
    // 1. 构建前端应用
    console.log('📦 构建前端应用...')
    execSync('npm run build', { stdio: 'inherit', cwd: __dirname })
    console.log('✅ 前端应用构建完成')

    // 2. 检查构建输出
    const distFiles = fs.readdirSync(path.join(__dirname, 'dist'))
    if (distFiles.length === 0) {
      throw new Error('前端构建失败，dist目录为空')
    }
    console.log('✅ 构建输出验证完成')

    // 3. 构建Electron应用
    console.log('💻 构建Electron桌面应用...')
    execSync('npm run electron:dist', { stdio: 'inherit', cwd: __dirname })
    console.log('✅ Electron应用构建完成')

    // 4. 检查构建结果
    const releaseDir = path.join(__dirname, 'release')
    if (fs.existsSync(releaseDir)) {
      const releaseFiles = fs.readdirSync(releaseDir)
      console.log('📁 生成的安装包文件:')
      releaseFiles.forEach(file => {
        const filePath = path.join(releaseDir, file)
        const stats = fs.statSync(filePath)
        console.log(`   📄 ${file} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`)
      })
    }

    console.log('🎉 桌面应用构建完成！')
    console.log('📍 安装包位置: release/ 目录')
    console.log('🚀 可以分发安装包给用户使用了')

  } catch (error) {
    console.error('❌ 构建失败:', error.message)
    process.exit(1)
  }
}

// 执行构建
build()