<script setup lang="ts">
import { computed, nextTick, provide, ref, watch } from 'vue'
import useStore from '@src/store/store'

import ChatBottom from '@src/components/views/HomeView/Chat/ChatBottom/ChatBottom.vue'
import ChatMiddle from '@src/components/views/HomeView/Chat/ChatMiddle/ChatMiddle.vue'
import ChatTop from '@src/components/views/HomeView/Chat/ChatTop/ChatTop.vue'
import useChatStore from '@src/store/chat'
import { IMessageWrapper } from '@src/typeV2'
import useSelectMessageStore from '@src/store/selectMessage'
import useActionStore from '@src/store/action'
import AddMemberToGroupModal from '@src/components/shared/modals/AddMemberToGroupModal.vue'
import useComposeStore from '@src/store/compose'
import KickOutGroupModal from '@src/components/shared/modals/KickOutGroupModal.vue'
import ChatInfo from '@src/components/views/HomeView/Chat/ChatInfo.vue'
import Swal from 'sweetalert2'
import ForwardModal from '@src/components/shared/modals/ForwardModal.vue'
import SelectContactModal from '@src/components/shared/modals/SelectContactModal.vue'
import { showModal, showToast } from '@src/assets/utils'

const store = useStore()
const chatStore = useChatStore()
const actionStore = useActionStore()
const selectMessageStore = useSelectMessageStore()
const composeStore = useComposeStore()
const chatMiddleRef = ref()

const messageList = ref<IMessageWrapper[]>([])

const currentChat = computed(() => chatStore.currentChat)

let lastTime = 0
const hasMore = ref(true)

watch(
  () => chatStore.activeConversationId,
  newVal => {
    if (chatStore.activeConversationId && currentChat.value) {
      refresh().then()
      chatStore.conversationOpen = 'open'
      actionStore.chatTopInfo.avatar = currentChat.value.avatar
      actionStore.chatTopInfo.show_name = currentChat.value.show_name
      actionStore.chatTopInfo.time = currentChat.value.time
    } else {
      if (chatStore.activeConversationId) {
        console.log('会话被删除了！')
        refresh().then()
        chatStore.conversationOpen = 'open'
        return
      }
      chatStore.activeConversationId = undefined
      chatStore.conversationOpen = 'close'
      actionStore.openChatInfo = false
    }
  },
  {
    immediate: true
  }
)

watch(
  () => actionStore.chatTopInfo.show_name,
  newVal => console.log('chatTopInfo', newVal)
)

watch(
  () => chatStore.currentChatInfo,
  currentChatInfo => {
    if (currentChatInfo.type === 1) {
      if (
        !actionStore.groupNoticeMap[chatStore.activeConversationId!] &&
        currentChatInfo.group.notice &&
        currentChatInfo.group.notice !== '没有群公告'
      ) {
        showModal({ title: '群公告', text: currentChatInfo.group.notice })
        actionStore.groupNoticeMap[chatStore.activeConversationId!] = true
      }
      if (chatStore.isGroupOwner) {
        chatStore.refreshMutedUserList().then()
      }
    }
  }
)

async function refresh() {
  chatStore.refreshChatInfo().then()
  if (chatStore.currentChat?.type === 0) {
    chatStore.refreshReadReceipt().then()
  } else {
    chatStore.refreshUserGroupStatus().then()
  }
  chatStore.receiptTime = 0
  await loadData(true).then()
  await nextTick()
  chatMiddleRef.value?.scrollToBottom()
}

let previousScrollHeight = 0

async function handleScroll(e: any) {
  if (e.target.scrollTop === 0) {
    if (!hasMore.value) {
      return
    }
    previousScrollHeight = e.target.scrollHeight
    await loadData()
    await nextTick()
    chatMiddleRef.value?.scrollTo(
      e.target.scrollHeight - previousScrollHeight - 30
    )
  }
}

watch(
  () => chatStore.newMessageWrapper,
  async newValue => {
    if (newValue && newValue.isCurrentChat) {
      messageList.value.push(newValue.messageWrapper)
      await nextTick()
      chatMiddleRef.value.scrollToBottom()
    }
  }
)

watch(
  () => chatStore.replaceMessage,
  newVal => {
    if (newVal) {
      const index = messageList.value.findIndex(
        item => item.msg.id === newVal.msg.id
      )
      messageList.value.splice(index, 1, newVal)
    }
  }
)

async function loadData(reset = false) {
  const { err, data } = await chatStore.getChatMessageHistory({
    time: lastTime,
    is_up: 1,
    list_id: chatStore.activeConversationId!
  })
  if (err) {
    alert('加载聊天记录出错了')
    return
  }
  if (!data.list.length) {
    hasMore.value = false
  } else {
    lastTime = data.list[0].msg.time
    if (reset) {
      messageList.value = data.list
    } else {
      messageList.value = data.list.concat(messageList.value)
    }
  }
}

// search the selected conversation using activeConversationId.
const activeConversation = computed(() => {
  let activeConversation = store.conversations.find(
    conversation => conversation.id === store.activeConversationId
  )

  if (activeConversation) {
    return activeConversation
  } else {
    return store.archivedConversations.find(
      conversation => conversation.id === store.activeConversationId
    )
  }
})
// provide the active conversation to all children.
provide('activeConversation', activeConversation.value)

function handleSendText(value: string) {
  chatStore.sendMessage({
    list_id: chatStore.activeConversationId!,
    content: {
      text: value
    },
    content_type: 0
  })
}

async function handleSelectContactModalFinish(selectedIds: number[]) {
  console.log('handleSelectContactModalFinish', selectedIds)
  const res1 = await chatStore.muteUser({
    users: selectedIds,
    is_msg: 1
  })
  const usersToUnmute = chatStore.mutedUserList.filter(
    userId => !selectedIds.includes(userId)
  )
  const res2 = await chatStore.muteUser({
    users: usersToUnmute,
    is_msg: 0
  })
  if (res1.err || res2.err) {
    Swal.fire({
      title: '系统提示',
      text: res1.msg || res2.msg,
      icon: 'error',
      timer: 1500
    }).then(res => { })
    return
  }
  Swal.fire({
    title: '系统提示',
    text: '设置成功',
    icon: 'success',
    timer: 1500
  }).then(res => { })
  await chatStore.refreshMutedUserList()
}
</script>

<template>
  <div v-if="chatStore.currentChatInfo.group" class="h-full flex flex-col scrollbar-hidden containe">
    <ChatTop :select-mode="selectMessageStore.selectMode" :handle-close-select="selectMessageStore.handleCloseSelect" />
    <ChatMiddle ref="chatMiddleRef" :message-list="messageList" :selected-messages="selectMessageStore.selectedMessages"
      :handle-select-message="selectMessageStore.handleSelectMessage"
      :handle-deselect-message="selectMessageStore.handleDeselectMessage" :on-scroll="handleScroll" />
    <ChatBottom :handle-send-text="handleSendText" />

    <div class="relative z-10" aria-labelledby="slide-over-title" role="dialog" aria-modal="true">
      <!-- Background backdrop -->
      <transition name="fade">
        <div v-if="actionStore.openChatInfo" class="fixed inset-0 bg-gray-500 bg-opacity-75" aria-hidden="true"></div>
      </transition>

      <!-- Slide-over panel -->
      <ChatInfo />
    </div>
    <AddMemberToGroupModal :close-modal="() => (composeStore.selectContactOpen = false)"
      :open="composeStore.selectContactOpen" />
    <KickOutGroupModal :close-modal="() => (composeStore.kickOutGroupModalOpen = false)"
      :open="composeStore.kickOutGroupModalOpen" />
    <ForwardModal :close-modal="() => (actionStore.forwardModalOpen = false)" :open="actionStore.forwardModalOpen" />
    <SelectContactModal :close-modal="() => (actionStore.selectContactModalOpen = false)"
      :open="actionStore.selectContactModalOpen" :handle-finish="ids => {
          handleSelectContactModalFinish(ids)
          actionStore.selectContactModalOpen = false
        }
        " />
  </div>
</template>
<style></style>
