function stringifyValue(value: any) {
  const type = typeof value
  if (type === 'string') {
    return encodeURIComponent(value)
  }
  else if (type !== 'undefined') {
    return '' + value
  }
}

export default function (data: Record<string, any>) {
  const list: string[] = []
  for (let key in data) {
    let value = data[key]
    if (Array.isArray(value)) {
      for (let i = 0, len = value.length; i < len; i++) {
        let item = stringifyValue(value[i])
        if (typeof item === 'string') {
          list.push(key + '[]=' + item)
        }
      }
    }
    else {
      value = stringifyValue(value)
      if (typeof value === 'string') {
        list.push(key + '=' + value)
      }
    }
  }
  return list.join('&')
}