const sanitizedURLSearchParams = (values, { repeatMode }) => {
  const params = new URLSearchParams()
  Object.entries(values).forEach(([key, value]) => {
    if (repeatMode && Array.isArray(value)) {
      value.forEach((elem) => params.append(key, elem))
    } else {
      params.append(key, value)
    }
  })

  const keysForDel = []
  params.forEach((value, key) => {
    if (
      value === '' ||
      value === 'undefined' ||
      value === 'null' ||
      value === undefined ||
      values === null
    ) {
      keysForDel.push(key)
    }
  })
  keysForDel.forEach((key) => {
    params.delete(key)
  })
  return params
}

export {
  sanitizedURLSearchParams
}
