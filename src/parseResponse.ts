import createResponse from './createResponse'

export default function (xhr: XMLHttpRequest) {

  const keys: string[] = []
  const values: string[] = []
  const entries: string[][] = []

  xhr
    .getAllResponseHeaders()
    .replace(
      /^(.*?):[^\S\n]*([\s\S]*?)$/gm,
      function (match: string, key: string, value: string) {
        keys.push(key = key.toLowerCase())
        values.push(value)
        entries.push([key, value])
        return match
      }
    )

  return createResponse(xhr, keys, values, entries)

}