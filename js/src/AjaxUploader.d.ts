import * as type from './type';
export default class AjaxUploader implements type.Uploader {
    xhr: XMLHttpRequest;
    file: File;
    hooks: type.UploadHooks;
    constructor(file: File, hooks: type.UploadHooks);
    upload(options: type.UploadOptions): void;
}
