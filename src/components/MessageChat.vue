<template>
  <div class="message-chat">
    <template v-if="currentSession">
      <!-- 聊天头部 -->
      <div class="chat-header">
        <div class="user-info">
          <a-avatar :src="currentSession.targetUserAvatar || 'https://joeschmoe.io/api/v1/random'">
            {{ currentSession.targetUserName?.substring(0, 1) }}
          </a-avatar>
          <div class="user-name">
            <span>{{ currentSession.targetUserName }}</span>
            <span class="online-status">{{ currentSession.isOnline ? '在线' : '离线' }}</span>
          </div>
        </div>
        <div class="header-actions">
          <a-popconfirm
            title="确定要删除此会话吗？"
            @confirm="handleDeleteSession"
            okText="确定"
            cancelText="取消"
          >
            <a-button type="text" danger><delete-outlined /></a-button>
          </a-popconfirm>
        </div>
      </div>

      <!-- 消息列表 -->
      <div class="chat-messages" ref="messagesContainer">
        <a-spin :spinning="loading">
          <div v-if="hasMore" class="load-more">
            <a-button type="link" @click="loadMoreMessages">加载更多</a-button>
          </div>

          <div v-if="messages.length === 0 && !loading" class="empty-messages">
            <a-empty description="暂无消息" />
          </div>

          <div v-for="message in messages" :key="message.id" class="message-wrapper">
            <div :class="['message', message.isSelf ? 'message-self' : 'message-other']">
              <a-avatar
                v-if="!message.isSelf"
                :src="message.senderAvatar || 'https://joeschmoe.io/api/v1/random'"
                class="message-avatar">
                {{ message.senderName?.substring(0, 1) }}
              </a-avatar>

              <div class="message-content">
                <div class="message-info">
                  <span class="message-sender" v-if="!message.isSelf">{{ message.senderName }}</span>
                  <span class="message-time">{{ formatMessageTime(message.createTime) }}</span>
                </div>

                <!-- 文本消息 -->
                <div v-if="message.contentType === 0" class="message-bubble">
                  {{ message.content }}
                </div>

                <!-- 图片消息 -->
                <div v-else-if="message.contentType === 1" class="message-bubble image-message">
                  <img :src="message.mediaUrl" @click="previewImage(message.mediaUrl)" />
                </div>

                <!-- 文件消息 -->
                <div v-else-if="message.contentType === 2" class="message-bubble file-message">
                  <file-outlined />
                  <span>{{ extractFileName(message.mediaUrl) }}</span>
                  <a :href="message.mediaUrl" target="_blank">下载</a>
                </div>
              </div>

              <a-avatar
                v-if="message.isSelf"
                :src="message.senderAvatar || 'https://joeschmoe.io/api/v1/random'"
                class="message-avatar">
                {{ message.senderName?.substring(0, 1) }}
              </a-avatar>
            </div>
          </div>
        </a-spin>
      </div>

      <!-- 消息输入框 -->
      <div class="chat-input">
        <div class="input-actions">
          <a-upload
            name="file"
            :showUploadList="false"
            :customRequest="handleImageUpload"
            accept="image/*"
          >
            <a-button type="text"><picture-outlined /></a-button>
          </a-upload>
          <a-upload
            name="file"
            :showUploadList="false"
            :customRequest="handleFileUpload"
          >
            <a-button type="text"><paper-clip-outlined /></a-button>
          </a-upload>
        </div>

        <a-textarea
          v-model="messageText"
          placeholder="输入消息..."
          :auto-size="{ minRows: 1, maxRows: 5 }"
          @pressEnter="handleSendMessage"
        />

        <a-button
          type="primary"
          :disabled="!messageText.trim()"
          @click="handleSendMessage"
          :loading="sending"
        >
          发送
        </a-button>
      </div>
    </template>

    <div v-else class="no-chat-selected">
      <a-empty description="请选择会话或者开始新的对话" />
    </div>

    <!-- 图片预览 -->
    <div v-if="previewVisible" class="image-preview" @click="previewVisible = false">
      <img :src="previewImageUrl" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, nextTick } from 'vue';
import { message } from 'ant-design-vue';
import { DeleteOutlined, PictureOutlined, PaperClipOutlined, FileOutlined } from '@ant-design/icons-vue';
import { listMessages, sendMessage, markSessionAsRead, deleteSession } from '@/api/messageController';
import type { MessageSessionDTO, MessageContentDTO, MessageSendRequest } from '@/api/typings';
import dayjs from 'dayjs';

const props = defineProps<{
  session: MessageSessionDTO | null;
}>();

const emit = defineEmits(['session-deleted', 'message-sent']);

// 消息列表
const messages = ref<MessageContentDTO[]>([]);
// 当前会话
const currentSession = computed(() => props.session);
// 加载状态
const loading = ref(false);
// 发送状态
const sending = ref(false);
// 消息文本
const messageText = ref('');
// 消息容器
const messagesContainer = ref<HTMLElement | null>(null);
// 图片预览
const previewVisible = ref(false);
const previewImageUrl = ref('');
// 分页
const currentPage = ref(1);
const pageSize = ref(20);
const hasMore = ref(false);
const total = ref(0);

// 监听会话变化
watch(() => props.session, (newSession) => {
  if (newSession) {
    // 重置分页和消息
    currentPage.value = 1;
    messages.value = [];
    hasMore.value = false;

    // 加载消息
    loadMessages();

    // 标记为已读
    if (newSession.unreadCount > 0) {
      markAsRead();
    }
  }
}, { immediate: true });

// 滚动到底部
const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

// 加载消息
const loadMessages = async () => {
  if (!currentSession.value || loading.value) return;

  loading.value = true;
  try {
    const params = {
      sessionId: currentSession.value.sessionId,
      pageNum: currentPage.value,
      pageSize: pageSize.value
    };

    const res = await listMessages(params);
    const data = res.data;

    if (data) {
      // 验证数据结构
      if (!Array.isArray(data.records)) {
        console.error('消息记录格式错误:', data);
        message.error('获取消息列表失败，返回数据格式不正确');
        return;
      }

      // 过滤无效的消息记录
      const validMessages = data.records.filter(msg =>
        msg && msg.id &&
        (msg.senderId || msg.senderId === 0) &&
        (msg.receiverId || msg.receiverId === 0) &&
        msg.content
      );

      // 新消息在底部
      if (currentPage.value === 1) {
        messages.value = validMessages.reverse();
        scrollToBottom();
      } else {
        // 加载更多时，新消息在顶部
        messages.value = [...validMessages.reverse(), ...messages.value];
      }

      total.value = data.total || 0;
      hasMore.value = currentPage.value * pageSize.value < total.value;
    } else {
      console.warn('获取消息列表返回空数据');
      if (currentPage.value === 1) {
        messages.value = [];
      }
    }
  } catch (error) {
    console.error('获取消息列表失败', error);
    message.error('获取消息列表失败');

    if (currentPage.value === 1) {
      messages.value = [];
    }
  } finally {
    loading.value = false;
  }
};

// 加载更多消息
const loadMoreMessages = () => {
  currentPage.value += 1;
  loadMessages();
};

// 标记为已读
const markAsRead = async () => {
  if (!currentSession.value) return;

  try {
    await markSessionAsRead(currentSession.value.sessionId);
  } catch (error) {
    console.error('标记会话已读失败', error);
  }
};

// 发送消息
const handleSendMessage = async (e?: KeyboardEvent) => {
  if (e) {
    e.preventDefault();
  }

  if (!currentSession.value || !messageText.value.trim() || sending.value) return;

  sending.value = true;
  try {
    const params: MessageSendRequest = {
      receiverId: currentSession.value.targetUserId,
      content: messageText.value.trim(),
      contentType: 0
    };

    const res = await sendMessage(params);

    if (res.data && res.data.code === 0) {
      messageText.value = '';

      // 重新加载消息
      currentPage.value = 1;
      await loadMessages();

      // 通知父组件刷新会话列表
      emit('message-sent');
    } else {
      message.error(res.data?.message || '发送消息失败');
    }
  } catch (error) {
    console.error('发送消息失败', error);
    message.error('发送消息失败，请稍后重试');
  } finally {
    sending.value = false;
  }
};

// 删除会话
const handleDeleteSession = async () => {
  if (!currentSession.value) return;

  try {
    await deleteSession(currentSession.value.sessionId);
    message.success('会话已删除');
    emit('session-deleted');
  } catch (error) {
    console.error('删除会话失败', error);
    message.error('删除会话失败');
  }
};

// 图片上传
const handleImageUpload = async (options: any) => {
  // 实际项目中这里应该先上传图片到服务器，获取URL后再发送消息
  // 这里简化处理
  message.warning('图片上传功能需要与文件上传接口配合使用');
};

// 文件上传
const handleFileUpload = async (options: any) => {
  // 实际项目中这里应该先上传文件到服务器，获取URL后再发送消息
  // 这里简化处理
  message.warning('文件上传功能需要与文件上传接口配合使用');
};

// 预览图片
const previewImage = (url: string) => {
  previewImageUrl.value = url;
  previewVisible.value = true;
};

// 提取文件名
const extractFileName = (url: string | undefined) => {
  if (!url) return '';
  return url.substring(url.lastIndexOf('/') + 1);
};

// 格式化消息时间
const formatMessageTime = (time: string) => {
  if (!time) return '';

  const date = dayjs(time);
  const now = dayjs();

  if (now.diff(date, 'day') < 1) {
    return date.format('HH:mm');
  } else if (now.diff(date, 'year') < 1) {
    return date.format('MM-DD HH:mm');
  } else {
    return date.format('YYYY-MM-DD HH:mm');
  }
};

// 暴露方法给父组件
defineExpose({
  loadMessages
});
</script>

<style scoped>
.message-chat {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  position: relative;
}

.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background-color: #fff;
  border-bottom: 1px solid #f0f0f0;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-name {
  margin-left: 12px;
  display: flex;
  flex-direction: column;
}

.online-status {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.load-more {
  text-align: center;
  margin-bottom: 16px;
}

.empty-messages {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.message-wrapper {
  margin-bottom: 16px;
}

.message {
  display: flex;
  align-items: flex-start;
}

.message-self {
  flex-direction: row-reverse;
}

.message-avatar {
  margin: 0 12px;
}

.message-content {
  max-width: 70%;
}

.message-info {
  margin-bottom: 4px;
  font-size: 12px;
}

.message-sender {
  margin-right: 8px;
  font-weight: 500;
}

.message-time {
  color: rgba(0, 0, 0, 0.45);
}

.message-bubble {
  padding: 10px 16px;
  background-color: #fff;
  border-radius: 4px;
  position: relative;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  word-break: break-word;
}

.message-self .message-bubble {
  background-color: #e6f7ff;
}

.image-message img {
  max-width: 100%;
  max-height: 300px;
  cursor: pointer;
}

.file-message {
  display: flex;
  align-items: center;
}

.file-message i {
  margin-right: 8px;
}

.file-message span {
  margin-right: 8px;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-input {
  padding: 12px 16px;
  background-color: #fff;
  border-top: 1px solid #f0f0f0;
  display: flex;
  align-items: flex-end;
}

.input-actions {
  display: flex;
  margin-right: 12px;
}

.input-actions button {
  margin-right: 8px;
}

.chat-input textarea {
  flex: 1;
  margin-right: 12px;
}

.no-chat-selected {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-preview {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  cursor: pointer;
}

.image-preview img {
  max-width: 90%;
  max-height: 90%;
}
</style>
