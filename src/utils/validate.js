/**
 * Created by PanJiaChen on 16/11/18.
 */

/**
 * @param {string} path
 * @returns {Boolean}
 */
export function isExternal(path) {
  return /^(https?:|mailto:|tel:)/.test(path)
}

/**
 * @param {string} str
 * @returns {Boolean}
 */
export function validUsername(str) {
  const valid_map = ['admin', 'editor']
  return valid_map.indexOf(str.trim()) >= 0
}

/* 验证端口是否在[0,65535]之间 */
export function isPort(rule, value, callback) {
  if (!value) {
    return callback()
  }
  setTimeout(() => {
    if (value === '' || typeof (value) === undefined) {
      callback(new Error('请输入端口值'))
    } else {
      const re = /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/
      const rsCheck = re.test(value)
      if (!rsCheck) {
        callback(new Error('请输入在[0-65535]之间的端口值'))
      } else {
        callback()
      }
    }
  }, 100)
}

/* 是否合法IP地址 */
export function validateIP(rule, value, callback) {
  if (value === '' || value === undefined || value === null) {
    callback()
  } else {
    const reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    if ((!reg.test(value)) && value !== '') {
      callback(new Error('请输入正确的IP地址'))
    } else {
      callback()
    }
  }
}