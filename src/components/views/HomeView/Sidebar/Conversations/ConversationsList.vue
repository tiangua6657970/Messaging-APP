<script setup lang="ts">
import type { IConversation } from "@src/types";
import Conversation from "./Conversation.vue";
import { IChat } from "@src/typeV2";

const props = defineProps<{
  filteredConversations?: IConversation[];
  handleConversationChange: (conversationId: string) => void;
  activeId?: number | string;

  chatList?: IChat[]
}>();

</script>

<template>
  <div>
<!--    <Conversation-->
<!--      v-for="conversation in filteredConversations"-->
<!--      :conversation="conversation"-->
<!--      :key="conversation.id"-->
<!--      role="listitem"-->
<!--      :handle-conversation-change="props.handleConversationChange"-->
<!--      :is-active="activeId === conversation.id"-->
<!--    />-->
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
