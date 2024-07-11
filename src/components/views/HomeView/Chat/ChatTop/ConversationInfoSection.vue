<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  ArrowUpIcon,
  ChevronLeftIcon,
  EllipsisVerticalIcon,
  InformationCircleIcon,
  NoSymbolIcon,
  XMarkIcon
} from '@heroicons/vue/24/outline'
import Typography from '@src/components/ui/data-display/Typography.vue'
import IconButton from '@src/components/ui/inputs/IconButton.vue'
import Dropdown from '@src/components/ui/navigation/Dropdown/Dropdown.vue'
import DropdownLink from '@src/components/ui/navigation/Dropdown/DropdownLink.vue'
import useChatStore from '@src/store/chat'
import useActionStore from '@src/store/action'
import Swal from 'sweetalert2'

const props = defineProps<{
  handleOpenSearch: () => void
}>()

const chatStore = useChatStore()
const actionStore = useActionStore()
const showDropdown = ref(false)

const currentChatInfo = computed(() => chatStore.currentChatInfo)
const currentChat = computed(() => chatStore.currentChat)

// (event) close dropdown menu when click item
const handleCloseDropdown = () => {
  showDropdown.value = false
}

// (event) close dropdown menu when clicking outside the menu.
const handleClickOutside = (event: Event) => {
  let target = event.target as HTMLElement
  let parentElement = target.parentElement as HTMLElement

  if (
    target &&
    !(target.classList as Element['classList']).contains('open-top-menu') &&
    parentElement &&
    !(parentElement.classList as Element['classList']).contains('open-top-menu')
  ) {
    handleCloseDropdown()
  }
}

// (event) close the selected conversation
const handleCloseConversation = () => {
  chatStore.conversationOpen = 'close'
  chatStore.activeConversationId = undefined
}

async function handleTopChat() {
  const value = currentChatInfo.value.top === 1 ? 0 : 1
  const { err } = await chatStore.topChat({ value })
  Swal.fire({
    title: err ? '设置失败！' : '设置成功！',
    icon: 'success',
    timer: 1500
  }).then()
  if (!err) {
    chatStore.refreshChatList().then()
  }
}

const topInfo = computed(() => {
  if (currentChat.value) {
    return {
      avatar: currentChat.value.avatar,
      name: currentChat.value.show_name,
      time: currentChat.value.time
    }
  } else if (currentChatInfo.value.type === 1) {
    return {
      avatar: currentChatInfo.value.group.avatar,
      name: currentChatInfo.value.group.name,
      time: `${currentChatInfo.value.member.length}个成员`
    }
  } else {
    const item = currentChatInfo.value.member.find(
      item => item.user_id !== chatStore.chatUserinfo.id
    )!
    return {
      avatar: item.avatar,
      name: item.name,
      time: '-----'
    }
  }
})
</script>

<template>
  <!--conversation info-->
  <div class="w-full flex justify-center items-center">
    <div class="group mr-4 md:hidden">
      <IconButton
        class="w-7 h-7"
        @click="handleCloseConversation"
        title="close conversation"
        aria-label=""
      >
        <ChevronLeftIcon
          aria-label="close conversation"
          class="w-[20px] h-[20px] text-gray-300 group-hover:text-indigo-300"
        />
      </IconButton>
    </div>

    <div v-if="chatStore.status !== 'loading'" class="flex grow">
      <!--avatar-->
      <button
        class="mr-5 outline-none"
        @click="actionStore.openChatInfo = true"
        aria-label="profile avatar"
      >
        <div
          :style="{
            backgroundImage: `url(${topInfo.avatar})`
          }"
          class="w-[36px] h-[36px] rounded-full bg-cover bg-center"
        ></div>
      </button>

      <!--name and last seen-->
      <div class="flex flex-col">
        <Typography
          variant="heading-2"
          class="mb-2 default-outline cursor-pointer"
          tabindex="0"
          @click="actionStore.openChatInfo = true"
        >
          {{ topInfo.name }}
        </Typography>

        <Typography
          variant="body-2"
          class="font-extralight default-outline rounded-[4px]"
          tabindex="0"
          aria-label="Last seen december 16, 2019"
        >
          {{ topInfo.time }}
        </Typography>
      </div>
    </div>

    <div class="flex" :class="{ hidden: chatStore.status === 'loading' }">
      <!--search button-->
      <IconButton
        title="Close conversation"
        aria-label="Close conversation"
        @click="handleCloseConversation"
        class="group w-7 h-7 mr-3"
      >
        <XMarkIcon
          class="w-[20px] h-[20px] text-gray-400 group-hover:text-indigo-300"
        />
      </IconButton>

      <div class="relative">
        <!--dropdown menu button-->
        <IconButton
          id="open-conversation-menu"
          @click="showDropdown = !showDropdown"
          tabindex="0"
          class="open-top-menu group w-7 h-7"
          :aria-expanded="showDropdown"
          aria-controls="conversation-menu"
          title="toggle conversation menu"
          aria-label="toggle conversation menu"
        >
          <EllipsisVerticalIcon
            class="open-top-menu w-[20px] h-[20px] text-gray-400 group-hover:text-indigo-300"
          />
        </IconButton>

        <!--dropdown menu-->
        <Dropdown
          id="conversation-menu"
          :close-dropdown="() => (showDropdown = false)"
          :show="showDropdown"
          :position="['right-0']"
          :handle-click-outside="handleClickOutside"
          aria-labelledby="open-conversation-menu"
        >
          <DropdownLink
            :handle-click="
              () => {
                actionStore.openChatInfo = true
                handleCloseDropdown()
              }
            "
          >
            <InformationCircleIcon
              class="h-5 w-5 mr-3 text-black opacity-60 dark:text-white dark:opacity-70"
            />
            会话详情
          </DropdownLink>

          <DropdownLink
            :handle-click="
              () => {
                handleCloseDropdown()
                handleTopChat()
              }
            "
          >
            <ArrowUpIcon class="h-5 w-5 mr-3" />
            {{ currentChatInfo.top === 1 ? '取消置顶会话' : '置顶会话' }}
          </DropdownLink>
          <DropdownLink
            :handle-click="
              () => {
                handleCloseDropdown()
                handleCloseConversation()
              }
            "
          >
            <NoSymbolIcon class="h-5 w-5 mr-3" />
            关闭会话
          </DropdownLink>
        </Dropdown>
      </div>
    </div>
  </div>
</template>
