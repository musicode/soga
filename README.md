# Soga

Http Request Library for javascript application.


## Install

```
npm i soga
```

## Fetch

标准 fetch 函数的简化版，兼容 IE8，暂不支持取消请求。

```js
import { fetch } from 'soga'

fetch(
  '接口地址',
  {
    body: JSON.stringify(data),
    // 可选值：include, omit, same-origin（默认）
    credentials: 'same-origin',
    headers: {
      'user-agent': 'Mozilla/4.0 MDN Example',
      'content-type': 'application/json'
    },
    method: 'POST'
  }
)
.then(function (response) {
  return response.json()
})
```

## File Uploader

文件上传，兼容 IE10+

```js
import { AjaxUploader } from 'soga'

// 检查浏览器是否支持
if (!AjaxUploader.support()) {
  alert('Does not support file api')
}

const uploader = new AjaxUploader(file, {
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
})

uploader.upload({
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
})
```