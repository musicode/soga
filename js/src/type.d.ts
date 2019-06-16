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
    blob(): Blob;
    json(): any;
    text(): string;
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
    onUploadStart?: () => void;
    onUploadEnd?: () => void;
    onUploadSuccess?: (response: Response) => void;
    onUploadFailure?: () => void;
    onUploadCancel?: () => void;
    onUploadProgress?: (progress: UploadProgress) => void;
}
export interface Uploader {
    file: File;
    hooks: UploadHooks;
    upload(options: UploadOptions): void;
}
