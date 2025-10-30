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
    ]
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true
  }
}