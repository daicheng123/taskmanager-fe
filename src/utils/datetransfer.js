export function formatDateTime(dateStr) {
  const time = new Date(Date.parse(dateStr))
  time.setTime(time.setHours(time.getHours() + 8))

  const Y = time.getFullYear() + '-'
  const M = addZero(time.getMonth() + 1) + '-'
  const D = addZero(time.getDate()) + ' '
  const h = addZero(time.getHours()) + ':'
  const m = addZero(time.getMinutes()) + ':'
  const s = addZero(time.getSeconds())

  return Y + M + D + h + m + s
}

function addZero(num) {
  return num < 10 ? '0' + num : num
}
