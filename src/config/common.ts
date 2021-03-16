import { Env, YylConfig } from 'yyl-config-types'
import { Configuration } from 'webpack'
import { path } from 'yyl-util'
export interface CommonConfigConfigOption {
  env: Env
  yylConfig: YylConfig
}
// TODO: ProgressPlugin
export function commonConfig(option: CommonConfigConfigOption): Configuration {
  const { env, yylConfig } = option
  return {
    resolve: {
      fallback: {
        'url': require.resolve('url/'),
        'punycode': require.resolve('punycode/'),
        'querystring': require.resolve('querystring-es3'),
        'webpack/hot': path.join(require.resolve('webpack/hot/emitter.js'), '..'),
        'webpack/hot/emitter': require.resolve('webpack/hot/emitter.js'),
        'ansi-html': require.resolve('ansi-html'),
        'html-entities': require.resolve('html-entities'),
        'events': require.resolve('events/')
      }
    }
  }
}