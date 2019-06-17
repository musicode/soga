import parseResponse from './parseResponse'
import setRequestHeaders from './setRequestHeaders'

export default function (url: string, options: RequestInit = {}) {
  return new Promise(function (resolve, reject) {

    const xhr = new XMLHttpRequest()

    xhr.open(options.method || 'get', url, true)

    xhr.onload = function () {
      const response = parseResponse(xhr)
      resolve(response())
    }

    xhr.onerror = reject
    xhr.withCredentials = options.credentials === 'include'

    setRequestHeaders(xhr, options.headers)

    xhr.send(options.body || null)

  })
}