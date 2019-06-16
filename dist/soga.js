/**
 * soga.js v0.0.1
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
                  return Promise.resolve(xhr.responseText);
              },
              json: function json() {
                  return Promise.resolve(JSON.parse(xhr.responseText));
              },
              blob: function blob() {
                  return Promise.resolve(new Blob([xhr.response]));
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
          for (var key in options.headers) {
              xhr.setRequestHeader(key, options.headers[key]);
          }
          xhr.send(options.body || null);
      });
  }

  var AjaxUploader = function AjaxUploader(file, hooks) {
      var instance = this;
      this.file = file;
      this.hooks = hooks;
      var xhr = this.xhr = new XMLHttpRequest();
      xhr.onloadstart = function () {
          if (hooks.onUploadStart) {
              hooks.onUploadStart(instance);
          }
      };
      xhr.onloadend = function () {
          if (hooks.onUploadEnd) {
              hooks.onUploadEnd(instance);
          }
      };
      xhr.onload = function () {
          if (hooks.onUploadSuccess) {
              var response = parseResponse(xhr);
              hooks.onUploadSuccess(instance, response());
          }
      };
      xhr.onerror = function () {
          if (hooks.onUploadFailure) {
              hooks.onUploadFailure(instance);
          }
      };
      xhr.onabort = function () {
          if (hooks.onUploadCancel) {
              hooks.onUploadCancel(instance);
          }
      };
      xhr.onprogress = function (event) {
          if (hooks.onUploadProgress) {
              var total = file.size;
              var uploaded = Math.min(total, event.loaded);
              var percent = total > 0 ? uploaded / total : 0;
              hooks.onUploadProgress(instance, {
                  uploaded: uploaded,
                  total: total,
                  percent: percent
              });
          }
      };
  };
  AjaxUploader.prototype.upload = function upload (options) {
      var ref = this;
          var xhr = ref.xhr;
          var file = ref.file;
      for (var key in options.header) {
          xhr.setRequestHeader(name, options.header[key]);
      }
      var formData = new FormData();
      for (var key$1 in options.data) {
          formData.append(key$1, options.data[key$1]);
      }
      formData.append(options.fileName, file);
      xhr.open('post', options.action, true);
      xhr.send(formData);
  };

  exports.AjaxUploader = AjaxUploader;
  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=soga.js.map
