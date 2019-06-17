import * as type from './type'
import parseResponse from './function/parseResponse'
import setRequestHeaders from './function/setRequestHeaders'

const blobSlice = File.prototype['mozSlice'] || File.prototype['webkitSlice'] || File.prototype.slice

export default class AjaxUploader implements type.Uploader {

  xhr: XMLHttpRequest

  file: File
  fileSize: number

  hooks: type.UploadHooks

  chunkInfo?: type.ChunkInfo

  public static support() {
    const xhr = new XMLHttpRequest()
    return xhr && 'upload' in xhr && 'onprogress' in xhr.upload
  }

  constructor(file: File, hooks: type.UploadHooks) {

    const instance = this

    instance.file = file
    instance.hooks = hooks

    // 碰到过传了几个分片之后，file.size 变成 0 的情况
    // 因此先存一下最初的 fileSize
    instance.fileSize = file.size || 0

    const xhr = instance.xhr = new XMLHttpRequest()

    xhr.onloadstart = function () {
      if (hooks.onUploadStart) {
        hooks.onUploadStart()
      }
    }
    xhr.onloadend = function () {
      if (hooks.onUploadEnd) {
        hooks.onUploadEnd()
      }
    }
    xhr.onload = function () {

      const { fileSize, chunkInfo } = instance

      if (chunkInfo) {
        if (chunkInfo.uploaded < fileSize) {
          chunkInfo.uploaded += chunkInfo.uploading

          if (hooks.onUploadChunkSuccess) {
            hooks.onUploadChunkSuccess({
              chunkIndex: chunkInfo.options.chunkIndex
            })
          }

          // 还有分片没上传完则继续上传下一个
          if (chunkInfo.uploaded < fileSize) {
            chunkInfo.options.chunkIndex++
            instance.uploadChunk(chunkInfo.options)
            return
          }
        }
      }

      if (hooks.onUploadSuccess) {
        const response = parseResponse(xhr)
        hooks.onUploadSuccess(response())
      }

    }
    xhr.onerror = function () {
      if (hooks.onUploadError) {
        hooks.onUploadError()
      }
    }
    xhr.onabort = function () {
      if (hooks.onUploadCancel) {
        hooks.onUploadCancel()
      }
    }
    // 下载文件触发的是 xhr.onprogress
    // 上传文件触发的是 xhr.upload.onprogress
    xhr.upload.onprogress = function (event) {

      const { fileSize, chunkInfo } = instance

      let uploaded: number

      if (chunkInfo) {
        // 当前正在上传的分片 size
        const chunkTotal = chunkInfo.uploading
        // 不能比当前正在上传的 size 还大
        const chunkUploaded = Math.min(chunkTotal, event.loaded)

        if (hooks.onUploadChunkProgress) {
          hooks.onUploadChunkProgress({
            chunkIndex: chunkInfo.options.chunkIndex,
            uploaded: chunkUploaded,
            total: chunkTotal,
            // 怕浏览器有 bug 导致 chunkTotal 为 0
            percent: chunkTotal > 0 ? chunkUploaded / chunkTotal : 0
          })
        }

        // 加上之前上传成功的分片 size
        uploaded = chunkInfo.uploaded + chunkUploaded

      }
      else {
        // 不能比文件 size 还大
        uploaded = Math.min(fileSize, event.loaded)
      }

      if (hooks.onUploadProgress) {
        hooks.onUploadProgress({
          uploaded,
          total: fileSize,
          // 怕浏览器有 bug 导致 fileSize 为 0
          percent: fileSize > 0 ? uploaded / fileSize : 0
        })
      }

    }

  }

  /**
   * 上传整个文件
   */
  upload(options: type.UploadOptions) {

    const { xhr, file } = this

    xhr.open('post', options.action, true)

    const formData = new FormData()

    for (let key in options.data) {
      formData.append(key, options.data[key])
    }

    formData.append(options.fileName, file)

    setRequestHeaders(xhr, options.headers)

    xhr.send(formData)

  }

  /**
   * 上传文件分片
   */
  uploadChunk(options: type.UploadChunkOptions) {

    let { xhr, file, fileSize, chunkInfo } = this

    if (!chunkInfo) {
      chunkInfo = this.chunkInfo = {
        uploaded: 0,
        uploading: 0,
        options,
      }
    }
    else if (chunkInfo.options !== options) {
      chunkInfo.options = options
    }

    // 默认从第一个分片开始上传，断点续传可以传入指定的分片
    const chunkIndex = options.chunkIndex || 0

    // 默认一个分片为 4M
    const chunkSize = options.chunkSize || 4 * 1024 * 1024

    const start = chunkSize * chunkIndex
    const end = Math.min(fileSize, chunkSize * (chunkIndex + 1))

    chunkInfo.uploading = end - start

    xhr.open('post', options.action, true)

    // xhr.setRequestHeader 必须在 open() 方法之后，send() 方法之前调用，否则会报错

    // xhr.setRequestHeader 设置相同的请求头不会覆盖，而是追加，如 key: value1, value2
    // 这里改成覆盖
    const headers = {
      Range: `bytes ${start}-${end}/${fileSize}`
    }

    for (let key in options.headers) {
      headers[key] = options.headers[key]
    }

    setRequestHeaders(xhr, headers)

    xhr.send(blobSlice.call(file, start, end))

  }

  abort() {
    this.xhr.abort()
  }

}