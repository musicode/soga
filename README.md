# Soga

超级轻量的 HTTP 请求库（gziped size: 2KB），非常模块化的解决了前端常见的几大难题：

1. 找不到好用的 IE8 请求库
2. 怎么上传文件
3. 低版本 IE 怎么上传文件
4. 请求库能不能小一些，越小越好
5. 请求库能不能简单一些，能不能不要过度封装

这些问题，`Soga` 通通帮你解决。

> `Soga` 在日文中的意思是“这样啊”，用了它，你会发现 `HTTP 请求` 就是这样的简单。

## Install

NPM

```
npm i soga
```

YARN

```
yarn add soga
```

## Fetch

标准 [Fetch](https://developer.mozilla.org/zh-CN/docs/Web/API/Fetch_API/Using_Fetch) 函数的简化版，为了兼容 IE8，仅支持 `method`, `data`, `body`, `credentials`, `headers` 等五个配置项。


```js
import { fetch } from 'soga'

fetch(
  '接口地址',
  // 可选配置
  {
    // 请求正文，一般是请求参数
    body: JSON.stringify({
      username: '',
      password: ''
    }),
    // 直接使用 body 可能比较麻烦，因此提供了一个扩展字段
    // data 可以把对象序列化成查询参数，即 username=xx&password=yy 的格式
    data: {
      username: '',
      password: ''
    },
    // 跨域是否发送 cookie
    // 可选值：include（发送）, omit（不发送）, same-origin（默认，同源发送）
    credentials: 'same-origin',
    // 请求头
    headers: {
      'user-agent': 'Mozilla/4.0 MDN Example',
      'content-type': 'application/json'
    },
    // 可选，默认是 GET
    method: 'POST'
  }
)
.then(function (response) {
  return response.json()
})
```

`fetch` 函数依赖 `Promise` 和 `Array.isArray`，因此必须给 IE 打补丁，如下：

```html
<!--[if IE]>
<script src="https://cdn.bootcss.com/es6-promise/4.1.1/es6-promise.auto.min.js"></script>
<![endif]-->

<!--[if lt IE 9]>
<script src="https://cdn.bootcss.com/es5-shim/4.5.13/es5-shim.min.js"></script>
<script src="https://cdn.bootcss.com/es5-shim/4.5.13/es5-sham.min.js"></script>
<![endif]-->
```

## Ajax Uploader

利用 `XMLHttpRequest` 上传文件，浏览器要求 IE10+。

```js
import { AjaxUploader } from 'soga'

// 检查浏览器是否支持
if (!AjaxUploader.support()) {
  alert('AjaxUploader can not work.')
}

const ajaxUploader = new AjaxUploader(
  // 传入 <input type="file"> 选择的文件
  // 也可以传入 Blob 对象，比如图片裁剪后通过 dataURItoBlob() 获得的 Blob
  file,
  // 钩子配置，可选
  {
    // 上传开始，可选
    onStart: function () {

    },
    // 上传结束，可选
    onEnd: function () {

    },
    // 网络异常，可选
    onError: function () {

    },
    // 上传被中断，可选
    onAbort: function () {

    },
    // 上传进度，可选
    onProgress: function (progress) {
      // 已经上传的字节数
      progress.uploaded
      // 需要上传的总字节数
      progress.total
      // 上传进度 0-1
      progress.percent
    },
    // 上传成功，可选
    onSuccess: function (response) {
      response.json()
    }
  }
)

// 上传文件
ajaxUploader.upload({
  // 上传接口
  action: 'http://xxx.com/upload',
  // 跟后端约定的文件名
  fileName: 'file',
  // 跨域是否发送 cookie
  // 可选值：include（发送）, omit（不发送）, same-origin（默认，同源发送）
  credentials: 'same-origin',
  // 跟随文件上传的其他数据，可选
  data: {

  },
  // 请求头，可选
  headers: {

  }
})

// 中止
ajaxUploader.abort()

// 销毁
ajaxUploader.destroy()
```

## Flash Uploader

利用 `Flash` 插件实现文件上传，兼容 IE8/IE9。

`FlashUploader` 需要传入初始化配置项，它的作用是创建 `<object>` 标签，当我们点击 `<object>` 标签，`Flash` 会自动弹出文件选择框，你可以通过 `accept` 配置可以选择哪些类型的文件，也可以通过 `multiple` 设置是否支持文件多选。

这个流程是 Flash 插件必需的，无法逃避，也就是说，你无法像 `AjaxUploader` 那样传入一个 `file` 对象，因为所有选中的文件都被 `Flash` 管理着，你无法手动设置，只能通过 `getFiles()` 方法获取。

`Flash` 返回的文件格式如下：

```js
{
  index: number,  // 在文件列表中的索引
  status: number, // 文件当前的状态，枚举值来自 FlashUploader.STATUS_XX
  name: string,
  size: number,
  type: string    // 文件类型，注意，它不是 mimeType，而是 png 或 jpg 这样的后缀名
}
```

下面看一个完整的例子：

```js
import { FlashUploader } from 'soga'

const flashUploader = new FlashUploader(
  // 基本配置
  {
    // 占位元素，会被内部创建的 <object> 元素替换
    el: document.getElementById('xx'),
    // swf 文件的 url
    swfUrl: 'your-path/uploader.swf',
    // 可选择的文件格式
    accept: 'jpg,jpeg,png,gif',
    // 是否支持多选
    multiple: false,
    // 是否开启 debug 模式，遇到问题可开启
    debug: false
  },
  // 钩子配置，可选
  {
    onFileChange: function () {
      console.log('onFileChange')
    },
    onStart: function (file) {
      console.log('onStart', file)
    },
    onEnd: function (file) {
      console.log('onEnd', file)
    },
    onAbort: function (file) {
      console.log('onAbort', file)
    },
    onProgress: function (file, progress) {
      console.log('onProgress', file, progress)
    },
    onSuccess: function (file, responseText) {
      console.log('onSuccess', file, responseText)
    },
    onError: function (file, code, detail) {
      switch (code) {
        case FlashUploader.ERROR_SECURITY:
          console.log('安全沙箱错误')
          break
        case FlashUploader.ERROR_IO:
          console.log('IO 错误')
          break
      }
      console.log('onError', file, code, detail)
    }
  }
)

// 获取当前选择的文件列表
flashUploader.getFiles()

// 上传指定 index 的文件
flashUploader.upload(
  // 上传第一个文件
  0,
  {
    // 上传接口
    action: 'http://xxx.com/upload',
    // 跟后端约定的文件名
    fileName: 'file',
    // 跟随文件上传的其他数据，可选
    data: {

    },
    // 请求头，可选
    headers: {

    }
  }
)

// 中止指定 index 的文件上传
flashUploader.abort(0)

// 销毁
flashUploader.destroy()
```
