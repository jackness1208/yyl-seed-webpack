const { resolveModule } = require('./util')
const { HappyPack, happyPackLoader } = require('./happypack')

const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const autoprefixer = require('autoprefixer')
const px2rem = require('postcss-px2rem')
const sass = require('sass')

const path = require('path')
const util = require('yyl-util')

const init = (config, iEnv) => {
  const wConfig = {
    module: {
      rules: [{
        test: /\.jsx?$/,
        exclude: (file) => (
          /node_modules/.test(file) &&
          !/\.vue\.js/.test(file)
        ),
        use: happyPackLoader('js')
      }, {
        test: /\.html$/,
        use: resolveModule('html-loader')
      }, {
        test: /\.(pug|jade)$/,
        oneOf: [{
          resourceQuery: /^\?vue/,
          use: resolveModule('pug-plain-loader')
        }, {
          use: resolveModule('pug-loader')
        }]
      }, {
        test: /\.svg$/,
        use: resolveModule('svg-inline-loader')
      }, {
        test: /\.(webp|ico)$/,
        use: resolveModule('url-loader')
      }, {
        // shiming the module
        test: path.join(config.alias.srcRoot, 'js/lib/'),
        use: [{
          loader: resolveModule('imports-loader'),
          query: 'this=>window'
        }]
      }, {
        test: /\.(png|jpg|gif)$/,
        use: [{
          loader: resolveModule('url-loader'),
          options: {
            limit: isNaN(config.base64Limit) ? 3000 : Number(config.base64Limit),
            name: '[name]-[hash:8].[ext]',
            chunkFilename: `async_component/[name]-[chunkhash:8].js`,
            outputPath: path.relative(
              config.alias.jsDest,
              config.alias.imagesDest
            ),
            publicPath: (function () {
              let r = util.path.join(
                config.dest.basePath,
                path.relative(
                  config.alias.root,
                  config.alias.imagesDest
                ),
                '/'
              )
              if (iEnv.proxy || iEnv.remote || iEnv.isCommit) {
                r = util.path.join(config.commit.hostname, r)
              }
              return r
            })()
          }
        }]
      }]
    },
    plugins: [
      new HappyPack({
        id: 'js',
        verbose: false,
        loaders: (() => {
          const loaders = [{
            loader: resolveModule('babel-loader'),
            query: (() => {
              if (!config.babelrc) {
                return {
                  babelrc: false,
                  cacheDirectory: true,
                  presets: [
                    [resolveModule('@babel/preset-env'), { modules: 'commonjs' }]
                  ],
                  plugins: [
                    // Stage 2
                    [resolveModule('@babel/plugin-proposal-decorators'), { 'legacy': true }],
                    [resolveModule('@babel/plugin-proposal-class-properties'), { 'loose': true }],
                    resolveModule('@babel/plugin-proposal-function-sent'),
                    resolveModule('@babel/plugin-proposal-export-namespace-from'),
                    resolveModule('@babel/plugin-proposal-numeric-separator'),
                    resolveModule('@babel/plugin-proposal-throw-expressions'),
                    resolveModule('@babel/plugin-syntax-dynamic-import')
                  ]
                }
              } else {
                return {}
              }
            })()
          }]

          return loaders
        })()
      })
    ]
  }

  // + css & sass
  const cssUse = [
    resolveModule('style-loader'),
    resolveModule('css-loader'),
    {
      loader: resolveModule('postcss-loader'),
      options: {
        ident: 'postcss',
        plugins() {
          const r = []
          if (config.platform === 'pc') {
            r.push(autoprefixer({
              overrideBrowserslist: ['> 1%', 'last 2 versions']
            }))
          } else {
            r.push(autoprefixer({
              overrideBrowserslist: ['iOS >= 7', 'Android >= 4']
            }))
            if (config.px2rem !== false) {
              r.push(px2rem({remUnit: 75}))
            }
          }
          return r
        }
      }
    }
  ]
  if (iEnv.isCommit) { // 发版
    // 去掉 style-loader
    cssUse.shift()

    // 添加 mini-css-extract-plugin loader
    cssUse.unshift({
      loader: MiniCssExtractPlugin.loader,
      options: {}
    })
    wConfig.plugins.push(
      // 样式分离插件
      new MiniCssExtractPlugin({
        filename: util.path.join(
          path.relative(
            config.alias.jsDest,
            path.join(config.alias.cssDest, '[name]-[hash:8].css')
          )
        ),
        chunkFilename: '[name]-[hash:8].css',
        allChunks: true
      })
    )
  }
  wConfig.module.rules = wConfig.module.rules.concat([{
    test: /\.css$/,
    use: cssUse
  }, {
    test: /\.(scss|sass)$/,
    use: cssUse.concat([
      {
        loader: resolveModule('sass-loader'),
        options: {
          implementation: sass
        }
      }
    ])
  }])
  // - css & sass

  return wConfig
}

module.exports = init