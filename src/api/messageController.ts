import request from '@/request';
import type {
  MessageSendRequest,
  MessageQueryRequest,
  MessageContentDTO,
  MessageSessionDTO,
  Page
} from './typings';

/**
 * 发送消息
 * @param params 消息内容
 */
export function sendMessage(params: MessageSendRequest) {
  return request({
    url: '/message/send',
    method: 'post',
    data: params
  });
}

/**
 * 获取会话列表
 */
export function listSessions() {
  return request({
    url: '/message/session/list',
    method: 'get'
  }).then(res => {
    // 确保返回的数据结构正确
    if (res && res.data && res.data.code === 0) {
      return {
        data: res.data.data || []
      };
    }
    console.error('会话列表返回数据格式错误:', res);
    return { data: [] };
  }).catch(err => {
    console.error('获取会话列表失败:', err);
    return { data: [] };
  });
}

/**
 * 获取所有用户列表
 */
export function getAllUsers() {
  return request({
    url: '/api/user/list/page/vo',
    method: 'post',
    data: {
      // 请求所有用户，设置较大的页面大小
      pageSize: 100,
      current: 1
    }
  }).then(res => {
    if (res && res.data && res.data.code === 0 && res.data.data && res.data.data.records) {
      return {
        data: res.data.data.records || []
      };
    }
    console.error('用户列表返回数据格式错误:', res);
    return { data: [] };
  }).catch(err => {
    console.error('获取用户列表失败:', err);
    return { data: [] };
  });
}

/**
 * 获取会话消息列表
 * @param params 查询参数
 */
export function listMessages(params: MessageQueryRequest) {
  return request({
    url: '/message/list',
    method: 'get',
    params
  }).then(res => {
    // 确保返回的数据结构正确
    if (res && res.data && res.data.code === 0) {
      return {
        data: res.data.data || { records: [], total: 0, size: 0, current: 0, pages: 0 }
      };
    }
    console.error('消息列表返回数据格式错误:', res);
    return { data: { records: [], total: 0, size: 0, current: 0, pages: 0 } };
  }).catch(err => {
    console.error('获取消息列表失败:', err);
    return { data: { records: [], total: 0, size: 0, current: 0, pages: 0 } };
  });
}

/**
 * 标记会话为已读
 * @param sessionId 会话ID
 */
export function markSessionAsRead(sessionId: number) {
  return request({
    url: '/message/session/read',
    method: 'post',
    params: { sessionId }
  });
}

/**
 * 删除会话
 * @param sessionId 会话ID
 */
export function deleteSession(sessionId: number) {
  return request({
    url: '/message/session/delete',
    method: 'post',
    params: { sessionId }
  });
}

/**
 * 获取未读消息数
 */
export function countUnreadMessages() {
  return request({
    url: '/message/unread/count',
    method: 'get'
  });
}
