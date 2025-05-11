<template>
  <div class="message-page">
    <div class="page-header">
      <h1>私信</h1>
      <a-button type="primary" @click="showNewMessageModal">
        <template #icon><message-outlined /></template>
        发起会话
      </a-button>
    </div>

    <div class="page-content">
      <div class="sidebar-container">
        <message-sidebar
          ref="sidebarRef"
          @select-session="handleSelectSession"
          @select-user="handleSelectUser"
        />
      </div>

      <div class="chat-container">
        <message-chat
          ref="chatRef"
          :session="currentSession"
          @session-deleted="handleSessionDeleted"
          @message-sent="handleMessageSent"
        />
      </div>
    </div>

    <!-- 新建会话模态框 -->
    <a-modal
      v-model="newMessageVisible"
      title="发起新会话"
      @ok="handleStartNewSession"
      :confirmLoading="confirmLoading"
      okText="发起会话"
      cancelText="取消"
    >
      <a-form
        :model="newMessageForm"
        :rules="rules"
        ref="formRef"
        layout="vertical"
      >
        <a-form-item label="选择用户" name="userId">
          <a-select
            v-model="newMessageForm.userId"
            placeholder="请选择用户"
            :loading="loadingUsers"
            :options="userOptions"
          ></a-select>
        </a-form-item>

        <a-form-item label="消息内容" name="content">
          <a-textarea
            v-model="newMessageForm.content"
            placeholder="请输入消息内容..."
            :rows="4"
          ></a-textarea>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { message } from 'ant-design-vue';
import { MessageOutlined } from '@ant-design/icons-vue';
import MessageSidebar from '@/components/MessageSidebar.vue';
import MessageChat from '@/components/MessageChat.vue';
import { sendMessage } from '@/api/messageController';
import { getUserList } from '@/api/userController';
import type { MessageSessionDTO, MessageSendRequest } from '@/api/typings';
import { useLoginUserStore } from '@/stores/userLoginUserStore';

// 用户存储
const loginUserStore = useLoginUserStore();

// 组件引用
const sidebarRef = ref(null);
const chatRef = ref(null);
const formRef = ref(null);

// 当前选中的会话
const currentSession = ref<MessageSessionDTO | null>(null);

// 新建会话相关
const newMessageVisible = ref(false);
const confirmLoading = ref(false);
const loadingUsers = ref(false);
const userOptions = ref<Array<{ value: number; label: string }>>([]);
const newMessageForm = reactive({
  userId: undefined as number | undefined,
  content: ''
});

// 表单验证规则
const rules = {
  userId: [{ required: true, message: '请选择用户' }],
  content: [{ required: true, message: '请输入消息内容' }]
};

// 选择会话
const handleSelectSession = (session: MessageSessionDTO) => {
  currentSession.value = session;
};

// 选择尚未有会话的用户
const handleSelectUser = (user: any) => {
  // 显示新消息模态框，预先填入选择的用户
  newMessageVisible.value = true;
  newMessageForm.userId = user.id;
  newMessageForm.content = '';

  // 如果需要立即获取用户列表
  loadUsers();
};

// 会话被删除
const handleSessionDeleted = () => {
  currentSession.value = null;
  // 刷新会话列表
  if (sidebarRef.value) {
    (sidebarRef.value as any).refreshData();
  }
};

// 消息发送成功
const handleMessageSent = () => {
  // 刷新会话列表
  if (sidebarRef.value) {
    (sidebarRef.value as any).refreshData();
  }
};

// 显示新建会话模态框
const showNewMessageModal = () => {
  newMessageVisible.value = true;
  // 重置表单
  newMessageForm.userId = undefined;
  newMessageForm.content = '';
  // 加载用户列表
  loadUsers();
};

// 加载用户列表
const loadUsers = async () => {
  loadingUsers.value = true;
  try {
    const res = await getUserList();
    if (res.data && res.data.code === 0 && res.data.data && res.data.data.records) {
      // 确保只显示有效的用户
      const users = res.data.data.records.filter((user: any) =>
        user && user.id && user.userName &&
        // 排除当前登录用户，不能给自己发消息
        user.id !== getCurrentUserId()
      );

      userOptions.value = users.map((user: any) => ({
        value: user.id,
        label: user.userName
      }));

      if (userOptions.value.length === 0) {
        message.info('没有可选的联系人');
      }
    } else {
      userOptions.value = [];
      message.warning('获取用户列表失败，返回数据格式不正确');
    }
  } catch (error) {
    console.error('获取用户列表失败', error);
    message.error('获取用户列表失败');
    userOptions.value = [];
  } finally {
    loadingUsers.value = false;
  }
};

// 获取当前登录用户ID
const getCurrentUserId = () => {
  // 从Pinia存储获取当前用户ID
  return loginUserStore.loginUser?.id || 0;
};

// 发起新会话
const handleStartNewSession = () => {
  if (formRef.value) {
    (formRef.value as any).validate().then(async () => {
      if (!newMessageForm.userId || !newMessageForm.content.trim()) {
        return;
      }

      confirmLoading.value = true;
      try {
        const params: MessageSendRequest = {
          receiverId: newMessageForm.userId,
          content: newMessageForm.content.trim(),
          contentType: 0
        };

        const res = await sendMessage(params);

        if (res.data && res.data.code === 0) {
          message.success('消息发送成功');
          newMessageVisible.value = false;

          // 刷新会话列表
          if (sidebarRef.value) {
            (sidebarRef.value as any).refreshData();
          }

          // 如果后端设置了会话ID，可以直接选择该会话
          // 这里简单处理，直接刷新等会话列表更新后再选择
        } else {
          message.error(res.data?.message || '发送消息失败');
        }
      } catch (error) {
        console.error('发送消息失败', error);
        message.error('发送消息失败');
      } finally {
        confirmLoading.value = false;
      }
    }).catch(() => {
      // 验证失败
    });
  }
};

// 生命周期钩子
onMounted(() => {
  // 初始化加载
});
</script>

<style scoped>
.message-page {
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.page-content {
  flex: 1;
  display: flex;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  border-radius: 4px;
  background-color: #fff;
}

.sidebar-container {
  width: 300px;
  border-right: 1px solid #f0f0f0;
}

.chat-container {
  flex: 1;
  overflow: hidden;
}

@media (max-width: 768px) {
  .page-content {
    flex-direction: column;
  }

  .sidebar-container {
    width: 100%;
    height: 300px;
    border-right: none;
    border-bottom: 1px solid #f0f0f0;
  }
}
</style>
