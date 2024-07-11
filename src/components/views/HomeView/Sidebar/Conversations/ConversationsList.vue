<script setup lang="ts">
import Conversation from './Conversation.vue'
import { IChat } from '@src/typeV2'

const props = defineProps<{
  handleConversationChange: (conversation: IChat) => void
  activeId?: number | string
  chatList?: IChat[]
}>()
</script>

<template>
  <div>
    <Conversation
      v-for="chat in chatList"
      :chat="chat"
      :key="chat.list_id"
      role="listitem"
      :handle-conversation-change="props.handleConversationChange"
      :is-active="activeId === chat.list_id"
    />
  </div>
</template>
