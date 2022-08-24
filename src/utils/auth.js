import Cookies from 'js-cookie'

const TokenKey = 'Admin-Token'

export function getToken() {
  return Cookies.get(TokenKey)
}

export function setToken(token) {
  var expireTime = new Date(new Date().getTime() + 2 * 60 * 60 * 1000)
  return Cookies.set(TokenKey, token, {
    expires: expireTime
  })
}

export function removeToken() {
  return Cookies.remove(TokenKey)
}
