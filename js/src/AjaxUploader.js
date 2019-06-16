import parseResponse from './parseResponse';
export default class AjaxUploader {
    constructor(file, hooks) {
        this.file = file;
        this.hooks = hooks;
        const xhr = this.xhr = new XMLHttpRequest();
        xhr.onloadstart = function () {
            if (hooks.onUploadStart) {
                hooks.onUploadStart();
            }
        };
        xhr.onloadend = function () {
            if (hooks.onUploadEnd) {
                hooks.onUploadEnd();
            }
        };
        xhr.onload = function () {
            if (hooks.onUploadSuccess) {
                const response = parseResponse(xhr);
                hooks.onUploadSuccess(response());
            }
        };
        xhr.onerror = function () {
            if (hooks.onUploadFailure) {
                hooks.onUploadFailure();
            }
        };
        xhr.onabort = function () {
            if (hooks.onUploadCancel) {
                hooks.onUploadCancel();
            }
        };
        xhr.onprogress = function (event) {
            if (hooks.onUploadProgress) {
                const total = file.size;
                const uploaded = Math.min(total, event.loaded);
                const percent = total > 0 ? uploaded / total : 0;
                hooks.onUploadProgress({
                    uploaded,
                    total,
                    percent
                });
            }
        };
    }
    upload(options) {
        const { xhr, file } = this;
        for (let key in options.header) {
            xhr.setRequestHeader(name, options.header[key]);
        }
        const formData = new FormData();
        for (let key in options.data) {
            formData.append(key, options.data[key]);
        }
        formData.append(options.fileName, file);
        xhr.open('post', options.action, true);
        xhr.send(formData);
    }
}
