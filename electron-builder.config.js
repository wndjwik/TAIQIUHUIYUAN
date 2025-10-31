module.exports = {
  appId: 'com.billiard.membership.system',
  productName: '台球厅会员管理系统',
  copyright: 'Copyright © 2024',
  directories: {
    output: 'release'
  },
  files: [
    'dist/**/*',
    'electron/**/*',
    'package.json'
  ],
  extraResources: [
    {
      from: 'backend',
      to: 'backend'
    }
  ],
  win: {
    target: [
      {
        target: 'nsis',
        arch: ['x64']
      }
    ],
    // 禁用签名相关配置
    signingHashAlgorithms: [],
    sign: false
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  },
  // 禁用签名
  signAndEditExecutable: false,
  // 禁用代码签名
  electronLanguages: ['en-US'],
  // 禁用公证
  notarize: false
}