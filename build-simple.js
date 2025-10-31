const fs = require('fs-extra');
const path = require('path');

console.log('🚀 开始构建台球厅会员管理系统...');

// 创建输出目录
const outputDir = path.join(__dirname, 'release-builds');
fs.emptyDirSync(outputDir);
console.log(`✅ 创建输出目录: ${outputDir}`);

// 复制必要的文件
const copyFiles = async () => {
  try {
    // 复制electron目录
    await fs.copy(path.join(__dirname, 'electron'), path.join(outputDir, 'electron'));
    console.log('✅ 复制electron目录');
    
    // 复制已构建的dist目录
    await fs.copy(path.join(__dirname, 'dist'), path.join(outputDir, 'dist'));
    console.log('✅ 复制dist目录');
    
    // 复制package.json
    await fs.copy(path.join(__dirname, 'package.json'), path.join(outputDir, 'package.json'));
    console.log('✅ 复制package.json');
    
    // 复制后端服务
    await fs.copy(path.join(__dirname, 'backend'), path.join(outputDir, 'backend'));
    console.log('✅ 复制backend目录');
    
    // 创建启动脚本
    const startScriptContent = `const { spawn } = require('child_process');
const path = require('path');
const electron = require('electron');

// 启动Electron应用
spawn(electron, [path.join(__dirname, 'electron', 'main.js')], {
  stdio: 'inherit'
});`;
    
    await fs.writeFile(path.join(outputDir, 'start.js'), startScriptContent);
    console.log('✅ 创建启动脚本');
    
    console.log('🎉 构建完成！应用文件已准备在 release-builds 目录中');
    console.log('📋 使用方法:');
    console.log('  1. 进入 release-builds 目录');
    console.log('  2. 运行: npm install');
    console.log('  3. 运行: node start.js');
    
  } catch (error) {
    console.error('❌ 构建过程中出现错误:', error);
    process.exit(1);
  }
};

// 安装fs-extra依赖并开始复制文件
const setupAndBuild = async () => {
  try {
    // 检查是否有fs-extra
    let fsExtraInstalled = false;
    try {
      require('fs-extra');
      fsExtraInstalled = true;
    } catch (e) {
      // fs-extra not installed
    }
    
    if (!fsExtraInstalled) {
      console.log('🔧 安装必要的依赖 fs-extra...');
      const { execSync } = require('child_process');
      execSync('npm install fs-extra --no-save', { stdio: 'inherit' });
      console.log('✅ fs-extra 安装完成');
    }
    
    // 重新加载fs-extra
    delete require.cache[require.resolve('fs-extra')];
    global.fs = require('fs-extra');
    
    // 开始复制文件
    await copyFiles();
  } catch (error) {
    console.error('❌ 准备过程中出现错误:', error);
    process.exit(1);
  }
};

setupAndBuild();