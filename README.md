# umi-plugin-gtj

![npm peer dependency version](https://img.shields.io/npm/dependency-version/umi-plugin-qrcode/peer/umi.svg)

## Usage
Install
```bash
yarn add umi-plugin-gtj --dev
```
Configure in `.umirc.js`,

```js
export default {
  plugins: [
    ['umi-plugin-gtj', options],
  ],
}
```

## Options
`entry`: `string`

default `./src`
处理目录

`out`: `string`

生成文件，不要在./src下，否则循环编译


`increment`: `boolean`

default `true`, 
是否增量编译


## LICENSE

MIT

