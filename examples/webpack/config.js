/* eslint indent: ["error", 2, { "SwitchCase": 1 }] */
const path = require('path');

const config = {};

// + vars
const SRC_ROOT = './src';
const WORKFLOW = 'webpack';
// - vars

// + setting
const setting = {
  localserver: {
    root: './dist'
  },
  dest: {
    basePath: '/pc',
    jsPath: 'js',
    jslibPath: 'js/lib',
    cssPath: 'css',
    htmlPath: 'html',
    imagesPath: 'images',
    tplPath: 'tpl',
    revPath: 'assets'
  }
};
// - setting

// + base
Object.assign(config, {
  localserver: setting.localserver,
  dest: setting.dest,
  seed: 'webpack',
  plugins: ['yyl-flexlayout']
});
// - base

// + alias
const DEST_BASE_PATH = path.join(setting.localserver.root, setting.dest.basePath);
Object.assign(config, {
  alias: {
    // 输出目录中 到 html, js, css, image 层 的路径
    'root': DEST_BASE_PATH,
    // rev 输出内容的相对地址
    'revRoot': DEST_BASE_PATH,
    // dest 地址
    'destRoot': setting.localserver.root,
    // src 地址
    'srcRoot': SRC_ROOT,
    // 项目根目录
    'dirname': './',
    // js 输出地址
    'jsDest': path.join(DEST_BASE_PATH, setting.dest.jsPath),
    // js lib 输出地址
    'jslibDest': path.join(DEST_BASE_PATH, setting.dest.jslibPath),
    // html 输出地址
    'htmlDest': path.join(DEST_BASE_PATH, setting.dest.htmlPath),
    // css 输出地址
    'cssDest': path.join(DEST_BASE_PATH, setting.dest.cssPath),
    // images 输出地址
    'imagesDest': path.join(DEST_BASE_PATH, setting.dest.imagesPath),
    // assets 输出地址
    'revDest': path.join(DEST_BASE_PATH, setting.dest.revPath),
    // tpl 输出地址
    'tplDest': path.join(DEST_BASE_PATH, setting.dest.tplPath),
    // webpackconfig 中的 alias
    '@': SRC_ROOT,
    '~@': path.join(SRC_ROOT, 'components')
    // + yyl make
    // - yyl make
  }
});

// + commit
Object.assign(config, {
  commit: {
    hostname: '//yyweb.yystatic.com/',
    revAddr: `//yyweb.yystatic.com/${setting.dest.basePath}/${setting.dest.revPath}/rev-manifest.json`
  }
});
// - commit

module.exports = config;
