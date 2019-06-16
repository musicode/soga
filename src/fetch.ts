export default function (url: string, options: RequestInit = {}) {
  return new Promise(function (resolve, reject) {

    const request = new XMLHttpRequest()
    const keys: string[] = []
    const entries: string[][] = []
    const headers: Record<string, string> = {}

    const response = function () {
      return {
        // 200-299
        ok: (request.status / 100 | 0) == 2,
        statusText: request.statusText,
        status: request.status,
        url: request.responseURL,
        headers: {
          keys() {
            return keys
          },
          entries() {
            return entries
          },
          get(key: string) {
            return headers[key.toLowerCase()]
          },
          has(key: string) {
            return key.toLowerCase() in headers
          }
        },
        text() {
          return Promise.resolve(request.responseText)
        },
        json() {
          return Promise.resolve(JSON.parse(request.responseText))
        },
        blob() {
          return Promise.resolve(new Blob([request.response]))
        },
        clone: response,
      }
    }

    request.open(options.method || 'get', url, true)

    request.onload = () => {
      request
      .getAllResponseHeaders()
      .replace(
        /^(.*?):[^\S\n]*([\s\S]*?)$/gm,
        function (match: string, key: string, value: string) {
          keys.push(key = key.toLowerCase())
          entries.push([key, value])
          headers[key] = headers[key] ? `${headers[key]},${value}` : value
          return match
        }
      )
      resolve(response())
    }

    request.onerror = reject

    request.withCredentials = options.credentials === 'include'

    for (let key in options.headers) {
      request.setRequestHeader(key, options.headers[key])
    }

    request.send(options.body || null)

  })
}