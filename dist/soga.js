/**
 * soga.js v0.0.3
 * (c) 2019-2019 musicode
 * Released under the MIT License.
 */

(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory(global.Soga = {}));
}(this, function (exports) { 'use strict';

  function createResponse (xhr, keys, values, entries) {
      function response() {
          return {
              // 200-299
              ok: (xhr.status / 100 | 0) == 2,
              statusText: xhr.statusText,
              status: xhr.status,
              url: xhr.responseURL,
              headers: {
                  keys: function keys$1() {
                      return keys;
                  },
                  values: function values$1() {
                      return values;
                  },
                  entries: function entries$1() {
                      return entries;
                  }
              },
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
      var keys = [];
      var values = [];
      var entries = [];
      xhr
          .getAllResponseHeaders()
          .replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, function (match, key, value) {
          keys.push(key = key.toLowerCase());
          values.push(value);
          entries.push([key, value]);
          return match;
      });
      return createResponse(xhr, keys, values, entries);
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
          xhr.withCredentials = options.credentials === 'include';
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
      instance.fileSize = file.size;
      var xhr = instance.xhr = new XMLHttpRequest();
      xhr.upload.onloadstart = function () {
          if (hooks.onUploadStart) {
              hooks.onUploadStart();
          }
      };
      xhr.upload.onloadend = function () {
          if (hooks.onUploadEnd) {
              hooks.onUploadEnd();
          }
      };
      xhr.upload.onload = function () {
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
      xhr.upload.onerror = function () {
          if (hooks.onUploadFailure) {
              hooks.onUploadFailure();
          }
      };
      xhr.upload.onabort = function () {
          if (hooks.onUploadCancel) {
              hooks.onUploadCancel();
          }
      };
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
      setRequestHeaders(xhr, options.headers);
      var formData = new FormData();
      for (var key in options.data) {
          formData.append(key, options.data[key]);
      }
      formData.append(options.fileName, file);
      xhr.open('post', options.action, true);
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
      setRequestHeaders(xhr, {
          Range: ("bytes " + start + "-" + end + "/" + fileSize)
      });
      setRequestHeaders(xhr, options.headers);
      xhr.open('post', options.action, true);
      xhr.send(blobSlice.call(file, start, end));
  };

  exports.AjaxUploader = AjaxUploader;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=soga.js.map
