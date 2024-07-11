<script setup lang="ts">
import type { IConversation } from '@src/types'
import type { Ref } from 'vue'
import { onMounted, ref, watchEffect } from 'vue'

import useStore from '@src/store/store'

import { PencilSquareIcon } from '@heroicons/vue/24/outline'
import ComposeModal from '@src/components/shared/modals/ComposeModal/ComposeModal.vue'
import NoConversation from '@src/components/states/empty-states/NoConversation.vue'
import Loading1 from '@src/components/states/loading-states/Loading1.vue'
import IconButton from '@src/components/ui/inputs/IconButton.vue'
import SearchInput from '@src/components/ui/inputs/SearchInput.vue'
import FadeTransition from '@src/components/ui/transitions/FadeTransition.vue'
import ArchivedButton from '@src/components/views/HomeView/Sidebar/Conversations/ArchivedButton.vue'
import ConversationsList from '@src/components/views/HomeView/Sidebar/Conversations/ConversationsList.vue'
import SidebarHeader from '@src/components/views/HomeView/Sidebar/SidebarHeader.vue'
import useChatStore from '@src/store/chat'
import { IChat } from '@src/typeV2'
import useComposeStore from '@src/store/compose'

const store = useStore()
const chatStore = useChatStore()
const composeStore = useComposeStore()

const keyword: Ref<string> = ref('')

// determines whether the archive is open or not
const openArchive = ref(false)

// the filtered list of conversations.
const filteredConversations: Ref<IConversation[]> = ref(store.conversations)
const filteredChatList: Ref<IChat[]> = ref(chatStore.chatList)

// filter the list of conversation based on search text.

watchEffect(() => {
  if (openArchive.value && chatStore.archivedConversationIds.length) {
    if (!keyword.value) {
      filteredChatList.value = chatStore.chatList.filter(item => {
        return chatStore.archivedConversationIds.includes(item.list_id)
      })
      return
    }
    filteredChatList.value = chatStore.chatList.filter(item => {
      return (
        chatStore.archivedConversationIds.includes(item.list_id) &&
        item.show_name.toLowerCase().includes(keyword.value.toLowerCase())
      )
    })
  } else {
    if (!keyword.value) {
      filteredChatList.value = chatStore.chatList.filter(
        item => !chatStore.archivedConversationIds.includes(item.list_id)
      )
    } else {
      filteredChatList.value = chatStore.chatList?.filter(
        item =>
          !chatStore.archivedConversationIds.includes(item.list_id) &&
          item.show_name.toLowerCase().includes(keyword.value.toLowerCase())
      )
    }
  }
})

// (event) switch between the rendered conversations.
const handleConversationChange = (conversation: IChat) => {
  chatStore.activeConversationId = conversation.list_id
  chatStore.unreadMsgCount += conversation.no_reader_num
  conversation.no_reader_num = 0
}

// if the active conversation is in the archive
// then open the archive
onMounted(() => {
  let conversation = chatStore.chatList.find(
    conversation => conversation.chat_id === chatStore.activeConversationId
  )

  if (conversation) openArchive.value = true
})
</script>

<template>
  <div>
    <SidebarHeader>
      <!--title-->
      <template v-slot:title>聊天会话</template>

      <!--side actions-->
      <template v-slot:actions>
        <IconButton
          @click="composeStore.composeModalOpen = true"
          aria-label="compose conversation"
          title="compose conversation"
          class="w-7 h-7"
        >
          <PencilSquareIcon
            class="w-[20px] h-[20px] text-indigo-300 hover:text-indigo-400"
          />
        </IconButton>
      </template>
    </SidebarHeader>

    <!--search bar-->
    <div class="px-5 xs:pb-6 md:pb-5">
      <SearchInput v-model="keyword" />
    </div>

    <!--conversations-->
    <div
      role="list"
      aria-label="conversations"
      class="w-full h-full scroll-smooth scrollbar-hidden"
      style="overflow-x: visible; overflow-y: scroll"
    >
      <Loading1
        v-if="chatStore.status === 'loading' || chatStore.delayLoading"
        v-for="item in 10"
      />

      <div v-else>
        <ArchivedButton
          v-if="chatStore.archivedConversationIds.length > 0"
          :open="openArchive"
          @click="openArchive = !openArchive"
        />

        <div
          v-if="
            chatStore.status === 'success' &&
            !chatStore.delayLoading &&
            filteredConversations.length > 0
          "
        >
          <FadeTransition>
            <component
              :is="ConversationsList"
              :chat-list="filteredChatList"
              :filtered-conversations="filteredConversations"
              :active-id="chatStore.activeConversationId"
              :handle-conversation-change="handleConversationChange"
              :key="openArchive ? 'archive' : 'active'"
            />
          </FadeTransition>
        </div>

        <div v-else>
          <NoConversation v-if="chatStore.archivedConversations.length === 0" />
        </div>
      </div>
    </div>

    <!--compose modal-->
    <ComposeModal
      :open="composeStore.composeModalOpen"
      :close-modal="() => (composeStore.composeModalOpen = false)"
    />
  </div>
</template>
