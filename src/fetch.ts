import parseResponse from './parseResponse'

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

    for (let key in options.headers) {
      xhr.setRequestHeader(key, options.headers[key])
    }

    xhr.send(options.body || null)

  })
}