import request from '@/utils/request'
export function createScript(data) {
  return request({
    method: 'post',
    url: '/v1/scripts/add_script',
    data
  })
}

export function testScript(data) {
  return request({
    method: 'put',
    url: '/v1/scripts/test_script',
    data
  })
}

export function listScript(params) {
  return request({
    method: 'get',
    url: '/v1/scripts/list_script',
    params
  })
}

export function fetchScript(id) {
  return request({
    method: 'get',
    url: '/v1/scripts/retrieve_script/' + id
  })
}

export function delete_script(id) {
  return request({
    method: 'delete',
    url: '/v1/scripts/delete_script/' + id
  })
}

export function update_script(data) {
  return request({
    method: 'put',
    url: '/v1/scripts/update_script',
    data
  })
}

export function debug_script(data) {
  return request({
    method: 'post',
    url: '/v1/scripts/debug_script',
    data
  })
}