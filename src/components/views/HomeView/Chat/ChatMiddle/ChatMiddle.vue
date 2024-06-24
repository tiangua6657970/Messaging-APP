<script setup lang="ts">
import type { IConversation, IMessage } from "@src/types";
import type { Ref } from "vue";
import { inject, onMounted, ref } from "vue";

import useStore from "@src/store/store";

import Message from "@src/components/views/HomeView/Chat/ChatMiddle/Message/Message.vue";
import TimelineDivider from "@src/components/views/HomeView/Chat/ChatMiddle/TimelineDivider.vue";
import { conversations } from "@src/store/defaults";
import useChatStore from "@src/store/chat";
import { IMessageV2, IMessageWrapper } from "@src/typeV2";
import MessageV2 from "@src/components/views/HomeView/Chat/ChatMiddle/Message/MessageV2.vue";

const props = defineProps<{
  handleSelectMessage: (messageId: number) => void;
  handleDeselectMessage: (messageId: number) => void;
  selectedMessages: number[];
  messageList: IMessageWrapper[]
}>();

const store = useStore();
const chatStore = useChatStore()

const container: Ref<HTMLElement | null> = ref(null);

const activeConversation = <IConversation>inject("activeConversation");

// checks whether the previous message was sent by the same user.
const isFollowUp = (index: number, previousIndex: number): boolean => {
  if (previousIndex < 0) {
    return false;
  } else {
    let previousSender = activeConversation.messages[previousIndex].sender.id;
    let currentSender = activeConversation.messages[index].sender.id;
    return previousSender === currentSender;
  }
};

// checks whether the message is sent by the authenticated user.
const isSelf = (message: IMessage): boolean => {
  return Boolean(store.user && message.sender.id === store.user.id);
};

// checks wether the new message has been sent in a new day or not.
const renderDivider = (index: number, previousIndex: number): boolean => {
  if (index === 3) {
    return true;
  } else {
    return false;
  }
};

// scroll messages to bottom.
onMounted(() => {
  (container.value as HTMLElement).scrollTop = (
    container.value as HTMLElement
  ).scrollHeight;
});
</script>

<template>
  <div
    ref="container"
    class="grow px-5 py-5 flex flex-col overflow-y-scroll scrollbar-hidden"
  >
    <div
      v-if="store.status !== 'loading'"
      v-for="(message, index) in activeConversation.messages"
      :key="index"
    >
      <TimelineDivider v-if="renderDivider(index, index - 1)" />

      <Message
        :message="message"
        :self="isSelf(message)"
        :follow-up="isFollowUp(index, index - 1)"
        :divider="renderDivider(index, index - 1)"
        :selected="props.selectedMessages.includes(message.id)"
        :handle-select-message="handleSelectMessage"
        :handle-deselect-message="handleDeselectMessage"
      />
    </div>
    <template v-if="chatStore.status !== 'loading'">
      <template v-for="(message, index) in messageList">
        <div
          :key="index"
          v-if="message.type === 0"
        >
          <TimelineDivider v-if="renderDivider(index, index - 1)" />
          <MessageV2
            :message="message.msg"
            :self="chatStore.chatUserinfo.id === message.msg.user_info.uid"
            :follow-up="true"
            :divider="renderDivider(index, index - 1)"
            :selected="false"
            :handle-select-message="handleSelectMessage"
            :handle-deselect-message="handleDeselectMessage"
          />
        </div>
        <div v-else-if="message.msg.content.text">系统消息：{{ message.msg.content.text }}</div>
      </template>
    </template>
  </div>
</template>
