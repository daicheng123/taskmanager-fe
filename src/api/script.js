import request from '@/utils/request'
export function createScripts(data) {
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
