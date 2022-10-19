import request from '@/utils/request'
export function testNode(params) {
  return request({
    method: 'get',
    url: '/v1/executors/test',
    params
  })
}

export function addExecutor(data) {
  return request({
    method: 'post',
    url: '/v1/executors/add_executor',
    data
  })
}

export function listExecutors(params) {
  return request({
    method: 'get',
    url: '/v1/executors/list_executor',
    params
  })
}

export function deleteExecutor(id) {
  return request({
    method: 'delete',
    url: '/v1/executors/del_executor/' + id
  })
}

export function batchDelExecutor(idList) {
  return request({
    method: 'delete',
    url: '/v1/executors/batch_delete',
    data: idList
  })
}

export function refreshExecutor(data, flag) {
  return request({
    method: 'patch',
    url: '/v1/executors/refresh_status',
    params: { 'flag': flag },
    data
  })
}

export function distributeKey(data) {
  return request({
    method: 'put',
    url: '/v1/executors/distribute_key',
    data
  })
}

export function updateExecutor(data) {
  return request({
    method: 'put',
    url: '/v1/executors/update_executor',
    data
  })
}

export function listExecutorOptions() {
  return request({
    method: 'get',
    url: '/v1/executors/option_executor'
  })
}
