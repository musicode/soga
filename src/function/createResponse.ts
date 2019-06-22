import {
  Response,
} from '../type'

export default function (
  xhr: XMLHttpRequest,
  headers: Record<string, string>
) {
  function response(): Response {
    return {
      ok: xhr.status >= 200 && xhr.status < 300,
      statusText: xhr.statusText || 'OK',
      status: xhr.status || 200,
      url: xhr.responseURL || headers['x-request-url'] || '',
      headers: {
        get(name: string) {
          return headers[name.toLowerCase()]
        },
        has(name: string) {
          return name.toLowerCase() in headers
        }
      },
      body: xhr.response || xhr.responseText,
      text() {
        return xhr.responseText
      },
      json() {
        return JSON.parse(xhr.responseText)
      },
      blob() {
        return new Blob([xhr.response])
      },
      clone: response,
    }
  }
  return response
}