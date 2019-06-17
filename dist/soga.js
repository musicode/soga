/**
 * soga.js v0.0.6
 * (c) 2019-2019 musicode
 * Released under the MIT License.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.Soga = {}));
}(this, function (exports) { 'use strict';

  function createResponse (xhr, headers) {
      function response() {
          return {
              ok: xhr.status >= 200 && xhr.status < 300,
              statusText: xhr.statusText || 'OK',
              status: xhr.status || 200,
              url: xhr.responseURL || headers['x-request-url'] || '',
              headers: {
                  get: function get(name) {
                      return headers[name.toLowerCase()];
                  },
                  has: function has(name) {
                      return name.toLowerCase() in headers;
                  }
              },
              body: xhr.response || xhr.responseText,
              text: function text() {
                  return xhr.responseText;
              },
              json: function json() {
                  return JSON.parse(xhr.responseText);
              },
              blob: function blob() {
                  return new Blob([xhr.response]);
              },
              clone: response,
          };
      }
      return response;
  }

  function parseResponse (xhr) {
      var headers = {};
      var rawHeaders = xhr.getAllResponseHeaders() || '';
      rawHeaders.replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, function (match, key, value) {
          headers[key.toLowerCase()] = value;
          return match;
      });
      return createResponse(xhr, headers);
  }

  function setRequestHeaders (xhr, headers) {
      for (var key in headers) {
          xhr.setRequestHeader(key, headers[key]);
      }
  }

  function fetch (url, options) {
      if ( options === void 0 ) options = {};

      return new Promise(function (resolve, reject) {
          var xhr = new XMLHttpRequest();
          xhr.open(options.method || 'get', url, true);
          xhr.onload = function () {
              var response = parseResponse(xhr);
              resolve(response());
          };
          xhr.onerror = reject;
          /**
           * The credentials indicates whether the user agent should send cookies
           * from the other domain in the case of cross-origin requests.
           *
           * omit: Never send or receive cookies
           *
           * include: Always send user credentials (cookies, basic http auth, etc..), even for cross-origin calls
           *
           * same-origin: Send user credentials (cookies, basic http auth, etc..) if the URL is on the same origin as the calling script.
           *              This is the default value.
           */
          if (options.credentials === 'include') {
              xhr.withCredentials = true;
          }
          else if (options.credentials === 'omit') {
              xhr.withCredentials = false;
          }
          setRequestHeaders(xhr, options.headers);
          xhr.send(options.body || null);
      });
  }

  var blobSlice = File.prototype['mozSlice'] || File.prototype['webkitSlice'] || File.prototype.slice;
  var AjaxUploader = function AjaxUploader(file, hooks) {
      var instance = this;
      instance.file = file;
      instance.hooks = hooks;
      // 碰到过传了几个分片之后，file.size 变成 0 的情况
      // 因此先存一下最初的 fileSize
      instance.fileSize = file.size || 0;
      var xhr = instance.xhr = new XMLHttpRequest();
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
          var fileSize = instance.fileSize;
          var chunkInfo = instance.chunkInfo;
          if (chunkInfo) {
              if (chunkInfo.uploaded < fileSize) {
                  chunkInfo.uploaded += chunkInfo.uploading;
                  if (hooks.onUploadChunkSuccess) {
                      hooks.onUploadChunkSuccess({
                          chunkIndex: chunkInfo.options.chunkIndex
                      });
                  }
                  // 还有分片没上传完则继续上传下一个
                  if (chunkInfo.uploaded < fileSize) {
                      chunkInfo.options.chunkIndex++;
                      instance.uploadChunk(chunkInfo.options);
                      return;
                  }
              }
          }
          if (hooks.onUploadSuccess) {
              var response = parseResponse(xhr);
              hooks.onUploadSuccess(response());
          }
      };
      xhr.onerror = function () {
          if (hooks.onUploadError) {
              hooks.onUploadError();
          }
      };
      xhr.onabort = function () {
          if (hooks.onUploadCancel) {
              hooks.onUploadCancel();
          }
      };
      // 下载文件触发的是 xhr.onprogress
      // 上传文件触发的是 xhr.upload.onprogress
      xhr.upload.onprogress = function (event) {
          var fileSize = instance.fileSize;
          var chunkInfo = instance.chunkInfo;
          var uploaded;
          if (chunkInfo) {
              // 当前正在上传的分片 size
              var chunkTotal = chunkInfo.uploading;
              // 不能比当前正在上传的 size 还大
              var chunkUploaded = Math.min(chunkTotal, event.loaded);
              if (hooks.onUploadChunkProgress) {
                  hooks.onUploadChunkProgress({
                      chunkIndex: chunkInfo.options.chunkIndex,
                      uploaded: chunkUploaded,
                      total: chunkTotal,
                      // 怕浏览器有 bug 导致 chunkTotal 为 0
                      percent: chunkTotal > 0 ? chunkUploaded / chunkTotal : 0
                  });
              }
              // 加上之前上传成功的分片 size
              uploaded = chunkInfo.uploaded + chunkUploaded;
          }
          else {
              // 不能比文件 size 还大
              uploaded = Math.min(fileSize, event.loaded);
          }
          if (hooks.onUploadProgress) {
              hooks.onUploadProgress({
                  uploaded: uploaded,
                  total: fileSize,
                  // 怕浏览器有 bug 导致 fileSize 为 0
                  percent: fileSize > 0 ? uploaded / fileSize : 0
              });
          }
      };
  };
  /**
   * 上传整个文件
   */
  AjaxUploader.support = function support () {
      var xhr = new XMLHttpRequest();
      return xhr && 'upload' in xhr && 'onprogress' in xhr.upload;
  };

  AjaxUploader.prototype.upload = function upload (options) {
      var ref = this;
          var xhr = ref.xhr;
          var file = ref.file;
      xhr.open('post', options.action, true);
      var formData = new FormData();
      for (var key in options.data) {
          formData.append(key, options.data[key]);
      }
      formData.append(options.fileName, file);
      setRequestHeaders(xhr, options.headers);
      xhr.send(formData);
  };
  /**
   * 上传文件分片
   */
  AjaxUploader.prototype.uploadChunk = function uploadChunk (options) {
      var ref = this;
          var xhr = ref.xhr;
          var file = ref.file;
          var fileSize = ref.fileSize;
          var chunkInfo = ref.chunkInfo;
      if (!chunkInfo) {
          chunkInfo = this.chunkInfo = {
              uploaded: 0,
              uploading: 0,
              options: options,
          };
      }
      else if (chunkInfo.options !== options) {
          chunkInfo.options = options;
      }
      // 默认从第一个分片开始上传，断点续传可以传入指定的分片
      var chunkIndex = options.chunkIndex || 0;
      // 默认一个分片为 4M
      var chunkSize = options.chunkSize || 4 * 1024 * 1024;
      var start = chunkSize * chunkIndex;
      var end = Math.min(fileSize, chunkSize * (chunkIndex + 1));
      chunkInfo.uploading = end - start;
      xhr.open('post', options.action, true);
      // xhr.setRequestHeader 必须在 open() 方法之后，send() 方法之前调用，否则会报错
      // xhr.setRequestHeader 设置相同的请求头不会覆盖，而是追加，如 key: value1, value2
      // 这里改成覆盖
      var headers = {
          Range: ("bytes " + start + "-" + end + "/" + fileSize)
      };
      for (var key in options.headers) {
          headers[key] = options.headers[key];
      }
      setRequestHeaders(xhr, headers);
      xhr.send(blobSlice.call(file, start, end));
  };
  AjaxUploader.prototype.abort = function abort () {
      this.xhr.abort();
  };

  exports.AjaxUploader = AjaxUploader;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=soga.js.map
