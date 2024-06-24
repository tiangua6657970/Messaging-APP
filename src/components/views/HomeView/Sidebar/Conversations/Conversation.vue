<script setup lang="ts">
import type { IAttachment, IConversation, IRecording } from "@src/types";
import type { Ref } from "vue";
import { computed, ref } from "vue";

import {
  getAvatar,
  getName,
  hasAttachments,
  shorten,
  getConversationIndex,
} from "@src/utils";
import useStore from "@src/store/store";

import {
  ArchiveBoxArrowDownIcon,
  InformationCircleIcon,
  MicrophoneIcon,
  TrashIcon,
} from "@heroicons/vue/24/outline";
import Typography from "@src/components/ui/data-display/Typography.vue";
import Dropdown from "@src/components/ui/navigation/Dropdown/Dropdown.vue";
import DropdownLink from "@src/components/ui/navigation/Dropdown/DropdownLink.vue";
import { IChat } from "@src/typeV2";
import { ossURL } from "@src/service/config";

const props = defineProps<{
  chat: IChat,
  isActive?: boolean;
  handleConversationChange?: (conversationId: string) => void;
}>();

const store = useStore();

const showContextMenu = ref(false);

const contextMenuCoordinations: Ref<{ x: number; y: number } | undefined> =
  ref();

// open context menu.
const handleShowContextMenu = (event: any) => {
  showContextMenu.value = true;
  contextMenuCoordinations.value = {
    x:
      window.innerWidth - 205 <= event.pageX
        ? window.innerWidth - 220
        : event.pageX,
    y:
      window.innerHeight - 125 <= event.pageY
        ? window.innerHeight - 200
        : event.pageY,
  };
};

// (event) closes the context menu
const handleCloseContextMenu = () => {
  showContextMenu.value = false;
};

// (event) close context menu when opening a new one.
const contextConfig = {
  handler: handleCloseContextMenu,
  events: ["contextmenu"],
};

// (event) select this conversation.
const handleSelectConversation = () => {
  showContextMenu.value = false;

  if (props.handleConversationChange)
    props.handleConversationChange(props.chat.list_id);
};

// (event) remove the unread indicator when opening the conversation
const handleRemoveUnread = () => {
  let index = getConversationIndex(props.conversation.id);
  if (index !== undefined) {
    store.conversations[index].unread = 0;
  }
};
</script>

<template>
  <div class="select-none">
    <button
      :aria-label="'conversation with' + props.chat.show_name"
      tabindex="0"
      v-click-outside="contextConfig"
      @contextmenu.prevent="handleShowContextMenu"
      @click="
        ($event) => {
          handleSelectConversation();
        }
      "
      class="w-full h-[92px] px-5 py-6 mb-3 flex rounded focus:bg-indigo-50 dark:active:bg-gray-600 dark:focus:bg-gray-600 dark:hover:bg-gray-600 hover:bg-indigo-50 active:bg-indigo-100 focus:outline-none transition duration-500 ease-out"
      :class="{
        'md:bg-indigo-50': props.isActive,
        'md:dark:bg-gray-600': props.isActive,
      }"
    >
      <!--profile image-->
      <div class="mr-4">
        <div
          :style="{ backgroundImage: `url(${ossURL + props.chat.avatar})` }"
          class="w-7 h-7 rounded-full bg-cover bg-center"
        ></div>
      </div>

      <div class="w-full flex flex-col">
        <div class="w-full">
          <!--conversation name-->
          <div class="flex items-start">
            <div class="grow mb-4 text-start">
              <Typography variant="heading-2">
                {{ props.chat.show_name }}
              </Typography>
            </div>

            <!--last message date-->
            <Typography variant="body-1">
              {{ props.chat.time }}
            </Typography>
          </div>
        </div>

        <div class="flex justify-between">
          <div>
            <!--draft Message-->
            <Typography
              v-if="
                props.chat.draftMessage &&
                props.chat.list_id !== store.activeConversationId
              "
              variant="body-2"
              class="flex justify-start items-center text-red-400"
              no-color
            >
              draft: {{ shorten(props.chat.draftMessage) }}
            </Typography>

            <!--recording name-->
            <Typography
              v-else-if="
                props.chat.type === 1
              "
              variant="body-2"
              class="flex justify-start items-center"
            >
              <MicrophoneIcon
                class="w-4 h-4 mr-2 text-black opacity-60 dark:text-white dark:opacity-70"
                :class="{ 'text-indigo-400': props.chat.no_reader_num }"
              />
              <span :class="{ 'text-indigo-400': props.chat.no_reader_num }">
                Recording
              </span>
            </Typography>

            <!--attachments title-->
            <Typography
              v-else-if="props.chat.type === 2"
              variant="body-2"
              class="flex justify-start items-center"
              :class="{ 'text-indigo-400': props.chat.no_reader_num }"
            >
              <span :class="{ 'text-indigo-400': props.chat.no_reader_num }">
                文件
              </span>
            </Typography>

            <!--last message content -->
            <Typography
              v-else
              variant="body-2"
              class="flex justify-start items-center"
              :class="{ 'text-indigo-400': props.chat.no_reader_num }"
            >
              <span :class="{ 'text-indigo-400': props.chat.no_reader_num }">
                {{ props.chat.last_msg }}
              </span>
            </Typography>
          </div>

          <div v-if="props.chat.no_reader_num">
            <div
              class="w-[18px] h-[18px] flex justify-center items-center rounded-[50%] bg-indigo-300"
            >
              <Typography variant="body-1" no-color class="text-white">{{
                  props.chat.no_reader_num
              }}</Typography>
            </div>
          </div>
        </div>
      </div>
    </button>

    <!--custom context menu-->
    <Dropdown
      :close-dropdown="() => (showContextMenu = false)"
      :show="showContextMenu"
      :handle-close="handleCloseContextMenu"
      :handle-click-outside="handleCloseContextMenu"
      :coordinates="{
        left: contextMenuCoordinations?.x + 'px',
        top: contextMenuCoordinations?.y + 'px',
      }"
      :position="['top-0']"
    >
      <DropdownLink :handle-click="handleCloseContextMenu">
        <InformationCircleIcon class="h-5 w-5 mr-3" />
        Conversation info
      </DropdownLink>

      <DropdownLink :handle-click="handleCloseContextMenu">
        <ArchiveBoxArrowDownIcon class="h-5 w-5 mr-3" />
        Archive conversation
      </DropdownLink>

      <DropdownLink :handle-click="handleCloseContextMenu" color="danger">
        <TrashIcon class="h-5 w-5 mr-3" />
        Delete conversation
      </DropdownLink>
    </Dropdown>
  </div>
</template>
