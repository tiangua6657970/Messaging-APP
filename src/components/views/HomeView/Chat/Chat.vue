<script setup lang="ts">
import type { Ref } from "vue";

import { computed, provide, ref, watchEffect } from "vue";
import useStore from "@src/store/store";

import ChatBottom from "@src/components/views/HomeView/Chat/ChatBottom/ChatBottom.vue";
import ChatMiddle from "@src/components/views/HomeView/Chat/ChatMiddle/ChatMiddle.vue";
import ChatTop from "@src/components/views/HomeView/Chat/ChatTop/ChatTop.vue";
import useChatStore from "@src/store/chat";
import { IMessageV2, IMessageWrapper, MessageType } from "@src/typeV2";

const store = useStore();
const chatStore = useChatStore()
const messageList = ref<IMessageWrapper[]>([])
const typeTextMap: Record<string, MessageType> = {
  0: 'text',
  1: 'voice',
  2: 'image',
  3: 'video',
  4: 'file',
  5: 'redPacket',
  6: 'onlineVideo',
  7: 'onlineVoice',
  8: 'nameCard',
  9: 'poke',
  10: 'location',
  11: 'officialPush',
  12: 'note',
  13: 'audioFile',
  14: 'text',
  15: 'text',
  16: 'text'
}
watchEffect(async () => {
  if (chatStore.activeConversationId) {
    const res = await chatStore.getChatMessageHistory({ time: 0, is_up: 1, list_id: chatStore.activeConversationId })
    messageList.value = res.data.list.map(item => {
      item.msg.typeText = typeTextMap[item.msg.type]
      return item
    })
    console.log('res--------', messageList.value)
  }
})


// search the selected conversation using activeConversationId.
const activeConversation = computed(() => {
  let activeConversation = store.conversations.find(
    (conversation) => conversation.id === store.activeConversationId
  );

  if (activeConversation) {
    return activeConversation;
  } else {
    return store.archivedConversations.find(
      (conversation) => conversation.id === store.activeConversationId
    );
  }
});



// provide the active conversation to all children.
provide("activeConversation", activeConversation.value);

// determines whether select mode is enabled.
const selectMode = ref(false);

// determines whether all the messages are selected or not.
const selectAll = ref(false);

// holds the selected conversations.
const selectedMessages: Ref<number[]> = ref([]);

// (event) add message to select messages.
const handleSelectMessage = (messageId: number) => {
  selectedMessages.value.push(messageId);

  if (
    activeConversation.value &&
    selectedMessages.value.length === activeConversation.value.messages.length
  ) {
    selectAll.value = true;
  }

  if (!selectMode.value) {
    selectMode.value = true;
  }
};

// (event) remove message from select messages.
const handleDeselectMessage = (messageId: number) => {
  selectAll.value = false;
  selectedMessages.value = selectedMessages.value.filter(
    (item) => item !== messageId
  );

  if (activeConversation.value && selectedMessages.value.length === 0) {
    selectMode.value = false;
  }
};

// (event) select all messages.
const handleSelectAll = () => {
  if (activeConversation.value) {
    const messages = activeConversation.value.messages.map(
      (message) => message.id
    );
    selectedMessages.value = messages;
    selectAll.value = true;
  }
};

// (event) remove the selected messages.
const handleDeselectAll = () => {
  selectAll.value = false;
  selectedMessages.value = [];
};

// (event handle close Select)
const handleCloseSelect = () => {
  selectMode.value = false;
  selectAll.value = false;
  selectedMessages.value = [];
};
</script>

<template>
  <div v-if="activeConversation" class="h-full flex flex-col scrollbar-hidden">
    <ChatTop
      :select-all="selectAll"
      :select-mode="selectMode"
      :handle-select-all="handleSelectAll"
      :handle-deselect-all="handleDeselectAll"
      :handle-close-select="handleCloseSelect"
    />
    <ChatMiddle
      :message-list="messageList"
      :selected-messages="selectedMessages"
      :handle-select-message="handleSelectMessage"
      :handle-deselect-message="handleDeselectMessage"
    />
    <ChatBottom />
  </div>
</template>
