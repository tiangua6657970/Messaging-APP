<script setup lang="ts">
import { computed, watch } from 'vue'

import Chat from '@src/components/views/HomeView/Chat/Chat.vue'
import Navigation from '@src/components/views/HomeView/Navigation/Navigation.vue'
import Sidebar from '@src/components/views/HomeView/Sidebar/Sidebar.vue'
import NoChatSelected from '@src/components/states/empty-states/NoChatSelected.vue'
import Loading3 from '@src/components/states/loading-states/Loading3.vue'
import FadeTransition from '@src/components/ui/transitions/FadeTransition.vue'
import useChatStore from '@src/store/chat'
import ConversationInfoModal from '@src/components/shared/modals/ConversationInfoModal/ConversationInfoModal.vue'
import useActionStore from '@src/store/action'
import ConversationInfoModalV2 from '@src/components/shared/modals/ConversationInfoModal/ConversationInfoModalV2.vue'
import { useRouter } from 'vue-router'
import useAuthStore from '@src/store/auth'

const chatStore = useChatStore()
const actionStore = useActionStore()
const authStore = useAuthStore()
const router = useRouter()
// the active chat component or loading component.
const activeChatComponent = computed(() => {
  if (chatStore.status === 'loading' || chatStore.delayLoading) {
    return Loading3
  } else if (chatStore.activeConversationId) {
    return Chat
  } else {
    return NoChatSelected
  }
})

watch(
  () => chatStore.codeError,
  newVal => {
    if (newVal) {
      authStore.code = ''
      router.push('/access/sign-in/')
      chatStore.codeError = false
    }
  }
)

watch(
  () => chatStore.currentChatInfo,
  newVal => {
    chatStore.refreshChatList()
  }
)
</script>

<template>
  <KeepAlive>
    <div
      class="xs:relative md:static h-full flex xs:flex-col md:flex-row overflow-hidden"
    >
      <!--navigation-bar-->
      <Navigation class="xs:order-1 md:-order-none" />
      <!--sidebar-->
      <Sidebar
        class="xs:grow-1 md:grow-0 xs:overflow-y-scroll md:overflow-visible scrollbar-hidden"
      />
      <!--chat-->
      <div
        id="mainContent"
        class="xs:absolute xs:z-10 md:static grow h-full xs:w-full md:w-fit scrollbar-hidden bg-white dark:bg-gray-800 transition-all duration-500"
        :class="
          chatStore.conversationOpen === 'open'
            ? ['xs:left-[0px]', 'xs:static']
            : ['xs:left-[1000px]']
        "
        role="region"
      >
        <FadeTransition name="fade" mode="out-in">
          <component
            :is="activeChatComponent"
            :key="chatStore.activeConversationId"
          />
        </FadeTransition>
      </div>

      <!--Contact info modal-->
      <ConversationInfoModal
        v-if="actionStore.viewChatInfo"
        :open="actionStore.openInfo"
        :closeModal="() => (actionStore.openInfo = false)"
      />
      <ConversationInfoModalV2
        :close-modal="() => (actionStore.viewConcatInfoOpen = false)"
        :open="actionStore.viewConcatInfoOpen"
      />
    </div>
  </KeepAlive>
</template>
