import request from '@/utils/request'
export function createTag(data) {
  return request({
    method: 'post',
    url: '/v1/tags/add',
    data
  })
}

export function listTags(params) {
  return request({
    method: 'get',
    url: '/v1/tags/tag_list',
    params
  })
}

export function delTag(id) {
  return request({
    method: 'delete',
    url: '/v1/tags/del/' + id
  })
}

export function updateTag(data) {
  return request({
    method: 'put',
    url: '/v1/tags/edit',
    data
  })
}
