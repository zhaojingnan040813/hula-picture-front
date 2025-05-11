<template>
  <div class="message-sidebar">
    <div class="search-bar">
      <a-input-search
        v-model="searchText"
        placeholder="搜索联系人..."
        style="width: 100%"
        @search="onSearch"
      />
    </div>

    <div class="session-list">
      <a-spin :spinning="loading">
        <div v-if="combinedUsers.length === 0 && !loading" class="empty-tip">
          <a-empty description="暂无联系人" />
        </div>

        <a-list v-else>
          <a-list-item
            v-for="user in filteredUsers"
            :key="user.id"
            class="session-item"
            :class="{ active: selectedUserId === user.id }"
            @click="selectUser(user)"
          >
            <div class="session-avatar">
              <a-badge v-if="user.unreadCount" :count="user.unreadCount > 0 ? user.unreadCount : 0" :dot="false">
                <a-avatar :src="user.userAvatar || 'https://joeschmoe.io/api/v1/random'">
                  {{ user.userName?.substring(0, 1) }}
                </a-avatar>
              </a-badge>
              <a-avatar v-else :src="user.userAvatar || 'https://joeschmoe.io/api/v1/random'">
                {{ user.userName?.substring(0, 1) }}
              </a-avatar>
              <span class="online-status" :class="{ online: user.isOnline }"></span>
            </div>
            <div class="session-info">
              <div class="session-header">
                <span class="session-name">{{ user.userName || '未知用户' }}</span>
                <span v-if="user.lastActiveTime" class="session-time">{{ formatTime(user.lastActiveTime) }}</span>
              </div>
              <div class="session-message">{{ user.lastMessage || '点击开始聊天' }}</div>
            </div>
          </a-list-item>
        </a-list>
      </a-spin>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { message } from 'ant-design-vue';
import { listSessions, getAllUsers } from '@/api/messageController';
import type { MessageSessionDTO } from '@/api/typings';
import { useLoginUserStore } from '@/stores/userLoginUserStore';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/zh-cn';

dayjs.extend(relativeTime);
dayjs.locale('zh-cn');

// 用户存储
const loginUserStore = useLoginUserStore();

// 会话列表
const sessions = ref<MessageSessionDTO[]>([]);
// 所有用户列表
const allUsers = ref<any[]>([]);
// 加载状态
const loading = ref(false);
// 搜索文本
const searchText = ref('');
// 选中的用户ID
const selectedUserId = ref<number | null>(null);

// 事件
const emit = defineEmits(['select-session', 'select-user']);

// 合并处理会话和用户信息 - 优先显示有会话的用户，然后显示其他用户
const combinedUsers = computed(() => {
  // 当前登录用户ID
  const currentUserId = loginUserStore.loginUser?.id || 0;

  // 从会话中获取的用户ID集合
  const sessionUserIds = new Set(sessions.value.map(session => session.targetUserId));

  // 已有会话的用户列表（带有会话信息）
  const sessionUsers = sessions.value.map(session => ({
    id: session.targetUserId,
    userName: session.targetUserName,
    userAvatar: session.targetUserAvatar,
    lastMessage: session.lastMessage,
    lastActiveTime: session.lastActiveTime,
    unreadCount: session.unreadCount,
    isOnline: session.isOnline,
    sessionId: session.sessionId,
    hasSession: true
  }));

  // 没有会话的用户列表
  const otherUsers = allUsers.value
    .filter(user => user.id !== currentUserId && !sessionUserIds.has(user.id))
    .map(user => ({
      id: user.id,
      userName: user.userName,
      userAvatar: user.userAvatar,
      lastMessage: null,
      lastActiveTime: null,
      unreadCount: 0,
      isOnline: false,
      sessionId: null,
      hasSession: false
    }));

  // 合并两个列表，先显示有会话的用户，按最后活跃时间排序
  return [
    ...sessionUsers.sort((a, b) => {
      if (!a.lastActiveTime) return 1;
      if (!b.lastActiveTime) return -1;
      return new Date(b.lastActiveTime).getTime() - new Date(a.lastActiveTime).getTime();
    }),
    ...otherUsers.sort((a, b) => (a.userName || '').localeCompare(b.userName || ''))
  ];
});

// 过滤后的用户列表
const filteredUsers = computed(() => {
  if (!searchText.value) {
    return combinedUsers.value;
  }
  return combinedUsers.value.filter(user =>
    user.userName?.toLowerCase().includes(searchText.value.toLowerCase()) ||
    (user.lastMessage && user.lastMessage.toLowerCase().includes(searchText.value.toLowerCase()))
  );
});

// 格式化时间
const formatTime = (time: string) => {
  if (!time) return '';
  try {
    const date = dayjs(time);
    const now = dayjs();

    if (now.diff(date, 'day') < 1) {
      return date.format('HH:mm');
    } else if (now.diff(date, 'day') < 2) {
      return '昨天';
    } else if (now.diff(date, 'week') < 1) {
      return date.format('ddd');
    } else {
      return date.format('MM-DD');
    }
  } catch (error) {
    console.error('时间格式化错误:', error);
    return '';
  }
};

// 搜索
const onSearch = () => {
  // 仅在界面上进行过滤，已通过计算属性实现
};

// 选择用户
const selectUser = (user: any) => {
  selectedUserId.value = user.id;

  if (user.hasSession) {
    // 如果已有会话，直接传递会话信息
    const session = sessions.value.find(s => s.targetUserId === user.id);
    if (session) {
      emit('select-session', session);
    }
  } else {
    // 如果没有会话，传递用户信息，由父组件处理
    emit('select-user', user);
  }
};

// 加载会话列表和用户列表
const loadData = async () => {
  if (loading.value) return;

  loading.value = true;
  try {
    // 并行加载会话和所有用户
    const [sessionsRes, usersRes] = await Promise.all([
      listSessions(),
      getAllUsers()
    ]);

    // 处理会话数据
    if (sessionsRes.data && Array.isArray(sessionsRes.data)) {
      sessions.value = sessionsRes.data.filter(session =>
        session &&
        session.sessionId &&
        (session.targetUserId || session.targetUserId === 0)
      );
    } else {
      sessions.value = [];
      console.warn('获取会话列表返回的数据不是数组:', sessionsRes.data);
    }

    // 处理用户数据
    if (usersRes.data && Array.isArray(usersRes.data)) {
      allUsers.value = usersRes.data.filter(user =>
        user && user.id && user.userName
      );
    } else {
      allUsers.value = [];
      console.warn('获取用户列表返回的数据不是数组:', usersRes.data);
    }

    console.log('加载的会话列表:', sessions.value);
    console.log('加载的用户列表:', allUsers.value);
  } catch (error) {
    console.error('加载数据失败', error);
    message.error('加载数据失败');
    sessions.value = [];
    allUsers.value = [];
  } finally {
    loading.value = false;
  }
};

// 初始化
onMounted(() => {
  loadData();
});

// 当会话列表有更新时，需要刷新
const refreshData = () => {
  loadData();
};

// 暴露方法给父组件
defineExpose({
  refreshSessions: refreshData,
  refreshData
});
</script>

<style scoped>
.message-sidebar {
  height: 100%;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #f0f0f0;
}

.search-bar {
  padding: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.session-list {
  flex: 1;
  overflow-y: auto;
  padding: 0;
}

.session-item {
  padding: 12px 16px !important;
  cursor: pointer;
  transition: background-color 0.3s;
  display: flex;
  align-items: center;
}

.session-item:hover {
  background-color: #f5f5f5;
}

.session-item.active {
  background-color: #e6f7ff;
}

.session-avatar {
  position: relative;
  margin-right: 12px;
}

.online-status {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ccc;
  border: 2px solid #fff;
}

.online-status.online {
  background-color: #52c41a;
}

.session-info {
  flex: 1;
  min-width: 0;
}

.session-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.session-name {
  font-weight: 500;
  color: rgba(0, 0, 0, 0.85);
}

.session-time {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.session-message {
  color: rgba(0, 0, 0, 0.65);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-size: 12px;
}

.empty-tip {
  padding: 40px 0;
  text-align: center;
}
</style>
