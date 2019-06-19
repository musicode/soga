import * as type from './type';
export default class AjaxUploader {
    xhr: XMLHttpRequest;
    file: File | Blob;
    fileSize: number;
    hooks: type.UploadHooks;
    chunkInfo?: type.ChunkInfo;
    static support(): boolean;
    constructor(file: File | Blob, hooks: type.UploadHooks);
    /**
     * 上传整个文件
     */
    upload(options: type.UploadOptions): void;
    /**
     * 上传文件分片
     */
    uploadChunk(options: type.UploadChunkOptions): void;
    /**
     * 取消上传
     */
    abort(): void;
    /**
     * 销毁
     */
    destroy(): void;
}
