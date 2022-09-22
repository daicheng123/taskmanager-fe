import request from '@/utils/request'
export function dangercmdAdd(data) {
  return request({
    method: 'post',
    url: '/v1/dangerous_command/add',
    data
  })
}

export function dangercmdUpdate(data) {
  return request({
    method: 'put',
    url: '/v1/dangerous_command/update',
    data
  })
}

export function dangercmdDelete(id) {
  return request({
    method: 'delete',
    url: '/v1/dangerous_command/del/' + id
  })
}

export function dangercmdList(params) {
  return request({
    method: 'get',
    url: '/v1/dangerous_command/list',
    params
  })
}

