export interface Response {
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly url: string;
    readonly headers: {
        get(name: string): string | void;
        has(name: string): boolean;
    };
    readonly body: any;
    blob(): Blob;
    json(): any;
    text(): string;
    clone(): Response;
}
export interface UploadOptions {
    data?: Record<string, any>;
    headers?: HeadersInit;
    fileName: string;
    action: string;
}
export interface UploadChunkOptions {
    headers?: HeadersInit;
    chunkIndex: number;
    chunkSize: number;
    action: string;
}
export interface UploadProgress {
    uploaded: number;
    total: number;
    percent: number;
}
export interface UploadChunkProgress {
    chunkIndex: number;
    uploaded: number;
    total: number;
    percent: number;
}
export interface UploadChunkSuccess {
    chunkIndex: number;
}
export interface ChunkInfo {
    uploaded: number;
    uploading: number;
    options: UploadChunkOptions;
}
export interface UploadHooks {
    onUploadStart?: () => void;
    onUploadEnd?: () => void;
    onUploadError?: () => void;
    onUploadCancel?: () => void;
    onUploadProgress?: (progress: UploadProgress) => void;
    onUploadSuccess?: (response: Response) => void;
    onUploadChunkProgress?: (progress: UploadChunkProgress) => void;
    onUploadChunkSuccess?: (success: UploadChunkSuccess) => void;
}
export interface Uploader {
    file: File;
    fileSize: number;
    hooks: UploadHooks;
    upload(options: UploadOptions): void;
}
