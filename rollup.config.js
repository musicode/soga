// 根据 tsconfig.json 把 ts 转成 js
import typescript from 'rollup-plugin-typescript'
// 替换代码中的变量
import replace from 'rollup-plugin-replace'
// 输出打包后的文件大小
import filesize from 'rollup-plugin-filesize'
// ES6 转 ES5
import buble from 'rollup-plugin-buble'
// 压缩
import { terser } from 'rollup-plugin-terser'
// 本地服务器
import serve from 'rollup-plugin-serve'

import { name, version, author, license } from './package.json'

const banner =
  `${'/**\n' + ' * '}${name}.js v${version}\n` +
  ` * (c) 2017-${new Date().getFullYear()} ${author}\n` +
  ` * Released under the ${license} License.\n` +
  ` */\n`;

const sourcemap = true

let suffix = '.js'

const env = process.env.NODE_ENV
const minify = process.env.NODE_MINIFY === 'true'
const port = process.env.NODE_PORT

const replaces = {
  'process.env.NODE_ENV': JSON.stringify(env),
  'process.env.NODE_VERSION': JSON.stringify(version)
}

let plugins = [
  replace(replaces)
]

if (minify) {
  suffix = '.min' + suffix
}

const output = []

if (process.env.NODE_FORMAT === 'es') {
  plugins.push(
    typescript({
      target: 'es6'
    })
  )
  output.push({
    file: `dist/${name}.esm${suffix}`,
    format: 'es',
    banner,
    sourcemap,
  })
}
else {
  plugins.push(
    typescript(),
    buble()
  )
  output.push({
    file: `dist/${name}${suffix}`,
    format: 'umd',
    name: 'Soga',
    banner,
    sourcemap,
  })
}

if (minify) {
  plugins.push(
    terser()
  )
}

plugins.push(
  filesize()
)

if (port) {
  plugins.push(
    serve({
      port,
      contentBase: ['']
    })
  )
}

module.exports = [
  {
    input: 'index.ts',
    output,
    plugins
  }
]