<script setup lang="ts">
import { computed, Ref, ref } from 'vue'

import { shorten } from '@src/utils'

import {
  ArchiveBoxArrowDownIcon,
  MicrophoneIcon,
  TrashIcon,
  ArrowUpIcon,
  ChevronUpIcon
} from '@heroicons/vue/24/outline'
import Typography from '@src/components/ui/data-display/Typography.vue'
import Dropdown from '@src/components/ui/navigation/Dropdown/Dropdown.vue'
import DropdownLink from '@src/components/ui/navigation/Dropdown/DropdownLink.vue'
import { IChat } from '@src/typeV2'
import { lastMessageTypeMap } from '@src/assets/utils'
import useChatStore from '@src/store/chat'
import useActionStore from '@src/store/action'
import Swal from 'sweetalert2'
import Button from '@src/components/ui/inputs/Button.vue'

const props = defineProps<{
  chat: IChat
  isActive?: boolean
  handleConversationChange?: (conversation: IChat) => void
}>()

const chatStore = useChatStore()
const actionStore = useActionStore()
const draftMessageMap = computed(() => actionStore.draftMessageMap)
const activeConversationId = computed(() => chatStore.activeConversationId)

const showContextMenu = ref(false)

const contextMenuCoordinations: Ref<{ x: number; y: number } | undefined> =
  ref()

// open context menu.
const handleShowContextMenu = (event: any) => {
  showContextMenu.value = true
  contextMenuCoordinations.value = {
    x:
      window.innerWidth - 205 <= event.pageX
        ? window.innerWidth - 220
        : event.pageX,
    y:
      window.innerHeight - 125 <= event.pageY
        ? window.innerHeight - 200
        : event.pageY
  }
}

// (event) closes the context menu
const handleCloseContextMenu = () => {
  showContextMenu.value = false
}

// (event) close context menu when opening a new one.
const contextConfig = {
  handler: handleCloseContextMenu,
  events: ['contextmenu']
}

// (event) select this conversation.
const handleSelectConversation = () => {
  showContextMenu.value = false

  if (props.handleConversationChange) props.handleConversationChange(props.chat)
}

const lastMessageContent = computed(() => {
  const chat = props.chat
  return chat.messageType === 'text'
    ? chat.last_msg
    : lastMessageTypeMap[chat.messageType]
})

async function handleDeleteConversation() {
  const { err } = await chatStore.deleteConversation({
    list_id: props.chat.list_id
  })
  if (err) {
    return
  }
  Swal.fire({
    title: err ? '删除失败！' : '删除成功！',
    icon: 'success',
    timer: 1500
  }).then()
  chatStore.activeConversationId = undefined
  chatStore.refreshChatList().then()
}

async function handleTopChat() {
  const value = props.chat.top === 1 ? 0 : 1
  const { err } = await chatStore.topChat({
    value,
    list_id: props.chat.list_id
  })
  Swal.fire({
    title: err ? '设置失败！' : '设置成功！',
    icon: 'success',
    timer: 1500
  }).then()
  if (!err) {
    chatStore.refreshChatList().then()
  }
}

const archived = computed(() => {
  return chatStore.archivedConversationIds.includes(props.chat.list_id)
})

async function toggleArchive() {
  if (archived.value) {
    const index = chatStore.archivedConversationIds.findIndex(
      item => item === props.chat.list_id
    )
    chatStore.archivedConversationIds.splice(index, 1)
  } else {
    chatStore.archivedConversationIds.push(props.chat.list_id)
  }
}

function clearArchive() {
  chatStore.archivedConversationIds = []
}
</script>

<template>
  <div class="select-none">
    <button :aria-label="'conversation with' + chat.show_name" tabindex="0" v-click-outside="contextConfig"
      @contextmenu.prevent="handleShowContextMenu" @click="$event => {
          handleSelectConversation()
        }
        "
      class="w-full h-[92px] px-5 py-6 mb-3 flex rounded focus:bg-indigo-50 dark:active:bg-gray-600 dark:focus:bg-gray-600 dark:hover:bg-gray-600 hover:bg-indigo-50 active:bg-indigo-100 focus:outline-none transition duration-500 ease-out relative"
      :class="{
        'md:bg-indigo-50': isActive,
        'md:dark:bg-gray-600': isActive
      }">
      <!--profile image-->
      <div class="mr-4">
        <div :style="{ backgroundImage: `url(${chat.avatar})` }"
          class="relative w-7 h-7 rounded-full bg-cover bg-center">
          <span
            class="absolute right-0 -top-4 bg-indigo-400 rounded-full w-5 h-5 text-black opacity-60 text-xs dark:text-white dark:opacity-70"
            v-if="chat.type === 1">
            G
          </span>
        </div>
      </div>

      <div class="w-full flex flex-col">
        <div class="w-full">
          <!--conversation name-->
          <div class="flex items-start">
            <div class="grow mb-4 text-start">
              <Typography class="line-clamp-1 break-all" variant="heading-2">
                {{ chat.show_name }}
              </Typography>
            </div>

            <!--last message date-->
            <Typography variant="body-1">
              {{ chat.time }}
            </Typography>
          </div>
        </div>

        <div class="flex justify-between">
          <div>
            <!--draft Message-->
            <Typography v-if="
              draftMessageMap[chat.list_id] &&
              chat.list_id !== activeConversationId
            " variant="body-2" class="flex justify-start items-center text-red-400" no-color>
              <span class="line-clamp-1">
                草稿: {{ shorten(draftMessageMap[chat.list_id]) }}
              </span>
            </Typography>

            <!--recording name-->
            <Typography v-else-if="chat.messageType === 'voice'" variant="body-2"
              class="flex justify-start items-center">
              <MicrophoneIcon class="w-4 h-4 mr-2 text-black opacity-60 dark:text-white dark:opacity-70"
                :class="{ 'text-indigo-400': chat.no_reader_num }" />
              <span :class="{ 'text-indigo-400': chat.no_reader_num }">
                Recording
              </span>
            </Typography>

            <!--last message content -->
            <Typography v-else variant="body-2" class="flex justify-start items-center">
              <span class="line-clamp-1 break-all" :class="{ 'text-indigo-400': chat.no_reader_num }">
                {{ lastMessageContent }}
              </span>
            </Typography>
          </div>

          <div v-if="chat.no_reader_num">
            <div class="w-[18px] h-[18px] flex justify-center items-center rounded-[50%] bg-indigo-300">
              <Typography variant="body-1" no-color class="text-white">{{ chat.no_reader_num }}
              </Typography>
            </div>
          </div>
        </div>
      </div>
      <ChevronUpIcon class="absolute top-2 right-5 h-5 w-5 text-black opacity-60 dark:text-white dark:opacity-70"
        v-if="chat.top === 1" />
    </button>

    <!--custom context menu-->
    <Dropdown :close-dropdown="() => (showContextMenu = false)" :show="showContextMenu"
      :handle-close="handleCloseContextMenu" :handle-click-outside="handleCloseContextMenu" :coordinates="{
        left: contextMenuCoordinations?.x + 'px',
        top: contextMenuCoordinations?.y + 'px'
      }" :position="['top-0']">
      <!-- TODO: 查看会话 -->
      <!--<DropdownLink :handle-click="() => {-->
      <!--  handleOpenChatInfo()-->
      <!--}">-->
      <!--  <InformationCircleIcon class="h-5 w-5 mr-3" />-->
      <!--  查看会话-->
      <!--</DropdownLink>-->

      <DropdownLink :handle-click="() => {
          handleCloseContextMenu()
          toggleArchive()
        }
        ">
        <ArchiveBoxArrowDownIcon class="h-5 w-5 mr-3" />
        {{ archived ? '取消存档' : '存档会话' }}
      </DropdownLink>

      <DropdownLink :handle-click="() => {
          handleCloseContextMenu()
          clearArchive()
        }
        " v-if="archived">
        <ArchiveBoxArrowDownIcon class="h-5 w-5 mr-3" />
        取消全部存档
      </DropdownLink>

      <DropdownLink :handle-click="() => {
          handleCloseContextMenu()
          handleTopChat()
        }
        ">
        <ArrowUpIcon class="h-5 w-5 mr-3" />
        {{ chat.top === 1 ? '取消置顶' : '置顶会话' }}
      </DropdownLink>

      <DropdownLink :handle-click="() => {
          handleDeleteConversation()
          handleCloseContextMenu()
        }
        " color="danger">
        <TrashIcon class="h-5 w-5 mr-3" />
        删除会话
      </DropdownLink>
    </Dropdown>
  </div>
</template>
