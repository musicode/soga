export interface Response {
    readonly ok: boolean;
    readonly status: number;
    readonly statusText: string;
    readonly headers: {
        keys(): string[];
        values(): string[];
        entries(): string[][];
    };
    readonly url: string;
    blob(): Promise<Blob>;
    json(): Promise<any>;
    text(): Promise<string>;
    clone(): Response;
}
export interface UploadOptions {
    data?: Record<string, any>;
    header?: Record<string, string>;
    fileName: string;
    action: string;
}
export interface UploadProgress {
    uploaded: number;
    total: number;
    percent: number;
}
export interface UploadHooks {
    onUploadStart?: (uploader: Uploader) => void;
    onUploadEnd?: (uploader: Uploader) => void;
    onUploadSuccess?: (uploader: Uploader, response: Response) => void;
    onUploadFailure?: (uploader: Uploader) => void;
    onUploadCancel?: (uploader: Uploader) => void;
    onUploadProgress?: (uploader: Uploader, progress: UploadProgress) => void;
}
export interface Uploader {
    file: File;
    hooks: UploadHooks;
    upload(options: UploadOptions): void;
}
