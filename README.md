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

文件上传

```js
import { AjaxUploader } from 'soga'

// 检查浏览器是否支持
if (!AjaxUploader.support()) {
  alert('这个浏览器不行啊')
}

const uploader = new AjaxUploader(file, {
  onUploadStart?: () => void
  onUploadEnd?: () => void
  onUploadError?: () => void
  onUploadCancel?: () => void
  onUploadProgress?: (progress: UploadProgress) => void
  onUploadSuccess?: (response: Response) => void
})

uploader.upload({
  action: '上传接口',
  fileName: '跟后端约定的文件名',
  // 跟随文件上传的其他数据，可选
  data: {

  },
  // 请求头，可选
  headers: {

  }
})
```