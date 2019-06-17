export default function (xhr: XMLHttpRequest, headers?: HeadersInit) {
  for (let key in headers) {
    xhr.setRequestHeader(key, headers[key])
  }
}