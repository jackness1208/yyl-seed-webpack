
const path = require('path');

const config = {};

// + setting
const setting = {
  localserver: {
    root: './dist',
    port: 5000
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

const DEST_BASE_PATH = path.join(setting.localserver.root, setting.dest.basePath);
const WORKFLOW = 'webpack';

// + base
Object.assign(config, {
  localserver: setting.localserver,
  dest: setting.dest,
  workflow: WORKFLOW,
  platform: 'pc',
  seed: 'typescript',
  px2rem: false,
  concat: {
    '{$jsDest}/shim.js': [
      '{$srcRoot}/js/lib/shim/es5-shim.min.js',
      '{$srcRoot}/js/lib/shim/es5-sham.min.js',
      '{$srcRoot}/js/lib/shim/json3.min.js',
      '{$srcRoot}/js/lib/shim/es6-shim.min.js',
      '{$srcRoot}/js/lib/shim/es6-sham.min.js'
    ]
  }
});
// - base

// + alias
Object.assign(config, {
  alias: {
    // 输出目录中 到 html, js, css, image 层 的路径
    'root': DEST_BASE_PATH,
    // rev 输出内容的相对地址
    'revRoot': DEST_BASE_PATH,
    // dest 地址
    'destRoot': setting.localserver.root,
    // src 地址
    'srcRoot': './src',
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
    'jquery': path.join('./src/js/lib/jquery/jquery-1.11.1.js'),
    'babel-polyfill': path.join('./src/js/lib/babel-polyfill/babel-polyfill.js')
    // + yyl make
    // - yyl make
  }
});
// - alias

Object.assign(config, {
  providePlugin: {
    '$': 'jquery'
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
