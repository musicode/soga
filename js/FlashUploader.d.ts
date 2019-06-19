import * as type from './type';
interface IndexedFile {
    index: number;
    status: number;
    name: string;
    type: string;
    size: number;
}
interface FlashDebug {
    text: string;
}
interface FlashFile {
    file: IndexedFile;
}
interface FlashSuccess {
    file: IndexedFile;
    responseText: string;
}
interface FlashError {
    file: IndexedFile;
    code: number;
    detail: Object | void;
}
interface FlashProgress {
    file: IndexedFile;
    uploaded: number;
    total: number;
}
interface FlashUploaderOptions {
    swfUrl: string;
    accept?: string;
    multiple?: boolean;
    debug?: boolean;
    el: Element;
}
interface FlashUploaderHooks {
    onReady?: () => void;
    onFileChange?: () => void;
    onStart?: (file: IndexedFile) => void;
    onEnd?: (file: IndexedFile) => void;
    onError?: (file: IndexedFile, code: number, detail: Object | void) => void;
    onAbort?: (file: IndexedFile) => void;
    onProgress?: (file: IndexedFile, progress: type.UploadProgress) => void;
    onSuccess?: (file: IndexedFile, responseText: string) => void;
}
export default class FlashUploader {
    swf: Element;
    movieName: string;
    hooks: FlashUploaderHooks;
    debug: boolean;
    static instances: {};
    /**
     * 文件状态 - 等待上传
     */
    static STATUS_WAITING: number;
    /**
     * 文件状态 - 正在上传
     */
    static STATUS_UPLOADING: number;
    /**
     * 文件状态 - 上传成功
     */
    static STATUS_UPLOAD_SUCCESS: number;
    /**
     * 文件状态 - 上传失败
     */
    static STATUS_UPLOAD_ERROR: number;
    /**
     * 文件状态 - 上传中止
     */
    static STATUS_UPLOAD_ABORT: number;
    /**
     * 错误码 - 上传出现沙箱安全错误
     */
    static ERROR_SECURITY: number;
    /**
     * 错误码 - 上传 IO 错误
     */
    static ERROR_IO: number;
    constructor(options: FlashUploaderOptions, hooks?: FlashUploaderHooks);
    /**
     * 获得要上传的文件
     */
    getFiles(): IndexedFile[];
    /**
     * 上传
     */
    upload(index: number, options: type.UploadOptions): void;
    /**
     * 取消上传
     */
    abort(index: number): void;
    /**
     * 启用鼠标点击打开文件选择窗口
     */
    enable(): void;
    /**
     * 禁用鼠标点击打开文件选择窗口
     */
    disable(): void;
    /**
     * 销毁对象
     */
    destroy(): void;
    onReady(): void;
    onFileChange(): void;
    onStart(data: FlashFile): void;
    onEnd(data: FlashFile): void;
    onError(data: FlashError): void;
    onAbort(data: FlashFile): void;
    onProgress(data: FlashProgress): void;
    onSuccess(data: FlashSuccess): void;
    onDebug(data: FlashDebug): void;
}
export {};
