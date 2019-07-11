export default function (data: Record<string, any>) {
  const list: string[] = []
  for (let key in data) {
    let value = data[key]
    if (Array.isArray(value)) {
      for (let i = 0, len = value.length; i < len; i++) {
        list.push(key + '[]=' + encodeURIComponent(value[i]))
      }
    }
    else if (typeof value === 'string') {
      list.push(key + '=' + encodeURIComponent(value))
    }
    else if (typeof value !== 'undefined') {
      list.push(key + '=' + value)
    }
  }
  return list.join('&')
}