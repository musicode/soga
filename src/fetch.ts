import {
  Response,
  FetchOptions,
} from './type'

import parseResponse from './function/parseResponse'
import setRequestHeaders from './function/setRequestHeaders'
import stringifyQuery from './function/stringifyQuery'

export default function fetch(url: string, options: FetchOptions = {}): Promise<Response> {
  return new Promise(function (resolve, reject) {

    const xhr = new XMLHttpRequest()

    const method = options.method
      ? options.method.toLowerCase()
      : 'get'

    let headers = options.headers
    let data = options.body || null

    // 提供一个便利参数
    if (options.data) {
      if (method === 'get') {
        const query = stringifyQuery(options.data)
        if (query) {
          url += '?' + query
        }
      }
      else if (!data) {
        data = JSON.stringify(options.data)
        // 如果指定了 headers，可以理解为用户知道自己在干嘛
        if (!headers) {
          headers = {
            'content-type': 'application/json'
          }
        }
      }
    }

    xhr.open(method, url, true)

    xhr.onload = function () {
      const response = parseResponse(xhr)
      resolve(response())
    }

    xhr.onerror = reject

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
      xhr.withCredentials = true
    }
    else if (options.credentials === 'omit') {
      xhr.withCredentials = false
    }

    setRequestHeaders(xhr, headers)

    xhr.send(data)

  })
}
