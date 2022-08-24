import request from '@/utils/request'

export function checkEmailExists(query) {
  return request({
    method: 'get',
    url: '/check_email_exists',
    query
  })
}
export function checkUserCodeExists(params) {
  return request({
    method: 'get',
    url: '/v1/user/user_code/' + params.userCode
  })
}

export function createUser(userForm) {
  return request({
    method: 'post',
    url: '/v1/user/register',
    data: userForm
  })
}

export function login(data) {
  return request({
    method: 'post',
    url: '/v1/user/login',
    data: data
  })
}

export function getInfo() {
  return request({
    url: '/v1/user/user_info',
    method: 'get'
    // params: { token }
  })
}

export function logout() {
  return request({
    url: '/v1/user/logout',
    method: 'post'
    // parmas: { token }
  })
}

export function getEmailCode(data) {
  return request({
    method: 'post',
    url: '/email_code',
    data
  })
}
