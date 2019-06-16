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

  function fetch (url, options) {
      if ( options === void 0 ) options = {};

      return new Promise(function (resolve, reject) {
          var request = new XMLHttpRequest();
          var keys = [];
          var entries = [];
          var headers = {};
          var response = function () {
              return {
                  // 200-299
                  ok: (request.status / 100 | 0) == 2,
                  statusText: request.statusText,
                  status: request.status,
                  url: request.responseURL,
                  headers: {
                      keys: function keys$1() {
                          return keys;
                      },
                      entries: function entries$1() {
                          return entries;
                      },
                      get: function get(key) {
                          return headers[key.toLowerCase()];
                      },
                      has: function has(key) {
                          return key.toLowerCase() in headers;
                      }
                  },
                  text: function text() {
                      return Promise.resolve(request.responseText);
                  },
                  json: function json() {
                      return Promise.resolve(JSON.parse(request.responseText));
                  },
                  blob: function blob() {
                      return Promise.resolve(new Blob([request.response]));
                  },
                  clone: response,
              };
          };
          request.open(options.method || 'get', url, true);
          request.onload = function () {
              request
                  .getAllResponseHeaders()
                  .replace(/^(.*?):[^\S\n]*([\s\S]*?)$/gm, function (match, key, value) {
                  keys.push(key = key.toLowerCase());
                  entries.push([key, value]);
                  headers[key] = headers[key] ? ((headers[key]) + "," + value) : value;
                  return match;
              });
              resolve(response());
          };
          request.onerror = reject;
          request.withCredentials = options.credentials === 'include';
          for (var key in options.headers) {
              request.setRequestHeader(key, options.headers[key]);
          }
          request.send(options.body || null);
      });
  }

  exports.fetch = fetch;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=soga.js.map
