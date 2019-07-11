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

    let data = options.body || null

    if (options.data) {
      let query = stringifyQuery(options.data)
      if (query) {
        if (method === 'get') {
          url += '?' + query
        }
        else if (!data) {
          data = query
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

    setRequestHeaders(xhr, options.headers)

    xhr.send(data)

  })
}
