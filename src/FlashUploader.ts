import {
  UploadOptions,
  UploadProgress,
} from './type'

interface IndexedFile {
  index: number
  status: number
  name: string
  type: string
  size: number
}

interface FlashDebug {
  text: string
}

interface FlashFile {
  file: IndexedFile
}

interface FlashSuccess {
  file: IndexedFile
  responseText: string
}

interface FlashError {
  file: IndexedFile,
  code: number,
  detail: Object | void
}

interface FlashProgress {
  file: IndexedFile
  uploaded: number
  total: number
}

interface FlashUploaderOptions {
  // swf 文件所在地址
  swfUrl: string
  // 可上传的文件格式，如 'jpg,png'
  accept?: string
  // 是否支持多文件上传
  multiple?: boolean
  // 是否开启调试模式
  debug?: boolean
  // 放置 <object> 标签的占位元素
  el: Element
}

interface FlashUploaderHooks {
  onReady?: () => void
  onFileChange?: () => void
  onStart?: (file: IndexedFile) => void
  onEnd?: (file: IndexedFile) => void
  onError?: (file: IndexedFile, code: number, detail: Object | void) => void
  onAbort?: (file: IndexedFile) => void
  onProgress?: (file: IndexedFile, progress: UploadProgress) => void
  onSuccess?: (file: IndexedFile, responseText: string) => void
}

export default class FlashUploader {

  swf: Element

  movieName: string

  hooks: FlashUploaderHooks

  debug: boolean

  public static instances = {}

  /**
   * 文件状态 - 等待上传
   */
  public static STATUS_WAITING = 0

  /**
   * 文件状态 - 正在上传
   */
  public static STATUS_UPLOADING = 1

  /**
   * 文件状态 - 上传成功
   */
  public static STATUS_UPLOAD_SUCCESS = 2

  /**
   * 文件状态 - 上传失败
   */
  public static STATUS_UPLOAD_ERROR = 3

  /**
   * 文件状态 - 上传中止
   */
  public static STATUS_UPLOAD_ABORT = 4

  /**
   * 错误码 - 上传出现沙箱安全错误
   */
  public static ERROR_SECURITY = 0

  /**
   * 错误码 - 上传 IO 错误
   */
  public static ERROR_IO = 1

  constructor(options: FlashUploaderOptions, hooks: FlashUploaderHooks = {}) {

    const movieName = createMovieName()

    const swf = createSWF(
      movieName,
      options.swfUrl,
      createFlashVars(movieName, options.accept || '', options.multiple || false)
    )

    const { el } = options
    if (el.parentNode) {
      el.parentNode.replaceChild(swf, el)
    }
    else {
      throw new Error('el.parentNode is not found.')
    }

    this.swf = swf
    this.movieName = movieName
    this.hooks = hooks
    this.debug = !!options.debug

    FlashUploader.instances[movieName] = this

  }

  /**
   * 获得要上传的文件
   */
  getFiles(): IndexedFile[] {
    return this.swf['getFiles']()
  }

  /**
   * 上传
   */
  upload(index: number, options: UploadOptions) {
    this.swf['upload'](index, options.action, options.fileName, options.data, options.headers)
  }

  /**
   * 取消上传
   */
  abort(index: number) {
    this.swf['abort'](index)
  }

  /**
   * 启用鼠标点击打开文件选择窗口
   */
  enable() {
    this.swf['enable']()
  }

  /**
   * 禁用鼠标点击打开文件选择窗口
   */
  disable() {
    this.swf['disable']()
  }

  /**
   * 销毁对象
   */
  destroy() {
    const files = this.getFiles()
    for (let i = 0, len = files.length; i < len; i++) {
      this.abort(files[i].index)
    }
    this.swf['destroy']()
    FlashUploader.instances[this.movieName] = null
    // 清除 IE 引用
    window[this.movieName] = null
  }

  onReady() {
    // swf 文件初始化成功
    const { onReady } = this.hooks
    if (onReady) {
      onReady()
    }
  }

  onFileChange() {
    // 用户选择文件
    const { onFileChange } = this.hooks
    if (onFileChange) {
      onFileChange()
    }
  }

  onStart(data: FlashFile) {
    const { onStart } = this.hooks
    if (onStart) {
      onStart(data.file)
    }
  }

  onEnd(data: FlashFile) {
    const { onEnd } = this.hooks
    if (onEnd) {
      onEnd(data.file)
    }
  }

  onError(data: FlashError) {
    const { onError } = this.hooks
    if (onError) {
      onError(data.file, data.code, data.detail)
    }
  }

  onAbort(data: FlashFile) {
    const { onAbort } = this.hooks
    if (onAbort) {
      onAbort(data.file)
    }
  }

  onProgress(data: FlashProgress) {
    const { onProgress } = this.hooks
    if (onProgress) {
      const { file, uploaded, total } = data
      onProgress(
        file,
        {
          uploaded,
          total,
          percent: total > 0 ? uploaded / total : 0
        }
      )
    }
  }

  onSuccess(data: FlashSuccess) {
    const { onSuccess } = this.hooks
    if (onSuccess) {
      onSuccess(data.file, data.responseText)
    }
  }

  onDebug(data: FlashDebug) {
    if (this.debug) {
      console.log(data.text)
    }
  }

}

/**
 * 项目名称 AS 会用 projectName.instances[movieName] 找出当前实例
 */
const projectName = 'Soga_Flash_Uploader'

/**
 * 暴露给全局的对象，这样 AS 才能调到
 */
window[projectName] = FlashUploader

/**
 * guid 初始值
 */
let guid = 0

/**
 * 创建新的唯一的影片剪辑名称
 */
function createMovieName() {
  return projectName + (guid++)
}

/**
 * 创建 swf 元素
 *
 * 无需兼容 IE67 用现有方法即可
 *
 * 如果想兼容 IE67，有两种方法：
 *
 * 1. 把 wmode 改成 opaque
 * 2. 用 swfobject 或别的库重写此方法
 *
 * 这里不兼容 IE67 是因为要判断浏览器实在太蛋疼了。。。
 */
function createSWF(id: string, swfUrl: string, flashVars: string) {

  const div = document.createElement('div')

  // 不加 ID 在 IE 下没法运行
  div.innerHTML = '<object id="' + id + '" class="' + projectName.toLowerCase()
    + '" type="application/x-shockwave-flash" data="' + swfUrl + '">'
    + '<param name="movie" value="' + swfUrl + '" />'
    + '<param name="allowscriptaccess" value="always" />'
    + '<param name="wmode" value="transparent" />'
    + '<param name="flashvars" value="' + flashVars + '" />'
    + '</object>'

  return div.children[0]

}

/**
 * 拼装给 swf 用的参数
 */
function createFlashVars(movieName: string, accept: string, multiple: boolean) {

  const result = [
    'projectName=' + projectName,
    'movieName=' + movieName,
    'accept=' + encodeURIComponent(accept),
    'multiple=' + (multiple ? 'true' : 'false')
  ]

  return result.join('&amp;')

}
