import * as type from './type';
export default class AjaxUploader implements type.Uploader {
    xhr: XMLHttpRequest;
    file: File;
    fileSize: number;
    hooks: type.UploadHooks;
    chunkInfo?: type.ChunkInfo;
    static support(): boolean;
    constructor(file: File, hooks: type.UploadHooks);
    /**
     * 上传整个文件
     */
    upload(options: type.UploadOptions): void;
    /**
     * 上传文件分片
     */
    uploadChunk(options: type.UploadChunkOptions): void;
    abort(): void;
}
