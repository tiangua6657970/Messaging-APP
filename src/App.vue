<script setup lang="ts">
// @ts-nocheck
import { onMounted, onUnmounted, ref, watch } from 'vue'

import useStore from '@src/store/store'
import { fetchData } from '@src/store/defaults'

import FadeTransition from '@src/components/ui/transitions/FadeTransition.vue'
import useChatStore from '@src/store/chat'
import useAuthStore from '@src/store/auth'

// future features:
// todo add video calling

// Refactoring code:
// todo refactor ui components to use component utilities.
// todo refactor remove getters from utils file and add them to store folder.

// Accessability:
// todo make dropdown menus more accessible.
// todo make modals more accessible.
// todo make lists (i.e conversations, contacts, calls) more accessible.
// todo improve the way you view messages.
// todo make multi-select more accessible.

// SEO.
// todo improve seo.

// Performance:
// todo add dynamic imports.
// todo add chunking.

const store = useStore()

const authStore = useAuthStore()
const chatStore = useChatStore()

if (authStore.token && authStore.code) {
  chatStore.refreshChat(authStore.code)
}

// update localStorage with state changes
store.$subscribe((_mutation, state) => {
  localStorage.setItem('chat', JSON.stringify(state))
})

// here we load the data from the server.
onMounted(async () => {
  store.status = 'loading'

  // fake server call
  setTimeout(() => {
    store.delayLoading = false
  })
  const request = await fetchData()

  store.$patch({
    status: 'success',
    user: request.data.user,
    conversations: request.data.conversations,
    notifications: request.data.notifications,
    archivedConversations: request.data.archivedConversations,
    activeConversationId: 1
  })
})

// the app height
const height = ref(`${window.innerHeight}px`)

// change the app height to the window hight.
const resizeWindow = () => {
  height.value = `${window.innerHeight}px`
}

// and add the resize event when the component mounts.
onMounted(() => {
  window.addEventListener('resize', resizeWindow)
  // register( { username: 'a5', password: '123456', email: 'a5@163.com'}).then(res => {
  window.electronAPI && window.electronAPI.receiveEv('open-chat', (e, payload) => {
    chatStore.activeConversationId = payload
    chatStore.conversationOpen = 'open'
  })
})

// remove the event when un-mounting the component.
onUnmounted(() => {
  window.removeEventListener('resize', resizeWindow)
})


watch(
  () => chatStore.newMessageWrapper,
  async newValue => {
    if (newValue) {
      const message = newValue.messageWrapper.msg
      const conversationId = newValue.list_id
      if (!message.self) {
        const target = chatStore.chatList.find(
          item => item.list_id === conversationId
        )
        window.electronAPI &&
          window.electronAPI['new-message']({
            title: target?.show_name || '新的消息',
            body: `${message.content.text}`,
            icon: message.user_info.avatar,
            list_id: conversationId
          })
      }
    }
  }
)

const openInfo = true
</script>

<template>
  <div :class="{ dark: store.settings.darkMode }">
    <div class="bg-white dark:bg-gray-800 transition-colors duration-500" :style="{ height: height }">
      <router-view v-slot="{ Component }">
        <FadeTransition>
          <component :is="Component" />
        </FadeTransition>
      </router-view>
    </div>
  </div>
</template>
