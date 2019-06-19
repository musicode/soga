import * as type from './type'
import parseResponse from './function/parseResponse'
import setRequestHeaders from './function/setRequestHeaders'

export default function (url: string, options: type.FetchOptions = {}) {
  return new Promise(function (resolve, reject) {

    const xhr = new XMLHttpRequest()

    xhr.open(options.method || 'get', url, true)

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

    xhr.send(options.body || null)

  })
}