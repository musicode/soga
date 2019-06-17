import createResponse from './createResponse'

export default function (xhr: XMLHttpRequest) {

  const headers: Record<string, string> = {}

  const rawHeaders = xhr.getAllResponseHeaders() || ''

  rawHeaders.replace(
    /^(.*?):[^\S\n]*([\s\S]*?)$/gm,
    function (match: string, key: string, value: string) {
      headers[key.toLowerCase()] = value
      return match
    }
  )

  return createResponse(xhr, headers)

}