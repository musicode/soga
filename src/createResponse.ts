import * as type from './type'

export default function (
  xhr: XMLHttpRequest,
  keys: string[],
  values: string[],
  entries: string[][]
) {
  function response(): type.Response {
    return {
      // 200-299
      ok: (xhr.status / 100 | 0) == 2,
      statusText: xhr.statusText,
      status: xhr.status,
      url: xhr.responseURL,
      headers: {
        keys() {
          return keys
        },
        values() {
          return values
        },
        entries() {
          return entries
        }
      },
      text() {
        return Promise.resolve(xhr.responseText)
      },
      json() {
        return Promise.resolve(JSON.parse(xhr.responseText))
      },
      blob() {
        return Promise.resolve(new Blob([xhr.response]))
      },
      clone: response,
    }
  }
  return response
}