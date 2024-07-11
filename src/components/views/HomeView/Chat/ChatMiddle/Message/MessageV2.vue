<script setup lang="ts">
import { computed, Ref, ref } from 'vue'

import linkifyStr from 'linkify-string'

import Typography from '@src/components/ui/data-display/Typography.vue'
import MessageContextMenu from '@src/components/views/HomeView/Chat/ChatMiddle/Message/MessageContextMenu.vue'
import MessagePreview from '@src/components/views/HomeView/Chat/MessagePreview.vue'
import Receipt from '@src/components/views/HomeView/Chat/ChatMiddle/Message/Receipt.vue'
import { IMessageV2 } from '@src/typeV2'
import RecordingV2 from '@src/components/views/HomeView/Chat/ChatMiddle/Message/RecordingV2.vue'
import AttachmentsV2 from '@src/components/views/HomeView/Chat/ChatMiddle/Message/AttachmentsV2.vue'
import CfNameCard from '@src/components/cf-name-card/cf-name-card.vue'
import useSelectMessageStore from '@src/store/selectMessage'

const props = defineProps<{
  message: IMessageV2
  followUp: boolean
  self: boolean
  divider?: boolean
  receiptTime: number
  handleOpenCarousel: () => void
}>()

const selectMessageStore = useSelectMessageStore()

const selected = computed(() => selectMessageStore.isSelected(props.message))

const showContextMenu = ref(false)

const contextMenuCoordinations: Ref<{ x: number; y: number }> = ref({
  x: 0,
  y: 0
})

// open context menu.
const handleShowContextMenu = (event: any) => {
  showContextMenu.value = true
  contextMenuCoordinations.value = {
    x:
      window.innerWidth - 220 <= event.pageX
        ? window.innerWidth - 250
        : event.pageX,
    y:
      window.innerHeight - 300 <= event.pageY
        ? window.innerHeight - 250
        : event.pageY
  }
}

// closes the context menu
const handleCloseContextMenu = () => {
  showContextMenu.value = false
}

// close context menu when opening a new one.
const contextConfig = {
  handler: handleCloseContextMenu,
  events: ['contextmenu']
}

const showAvatar = computed(() => {
  if (props.divider && !props.self) {
    return true
  } else {
    return !(props.followUp || props.self)
  }
})

function handleRootClick(e: Event) {
  if (selectMessageStore.selectMode) {
    if (selected.value) {
      selectMessageStore.handleDeselectMessage(props.message)
    } else {
      selectMessageStore.handleSelectMessage(props.message)
    }
  }
}
</script>

<template>
  <div>
    <div class="xs:mb-6 md:mb-5 flex" :class="{ 'justify-end': self }" @click="handleRootClick">
      <!--avatar-->
      <div class="mr-4" :class="{ 'ml-[36px]': followUp && !divider }">
        <div :aria-label="message.user_info.name" class="outline-none" v-if="showAvatar">
          <div :style="{
            backgroundImage: `url(${message.user_info.avatar})`
          }" class="w-[36px] h-[36px] bg-cover bg-center rounded-full"></div>
        </div>
      </div>

      <div>
        <Typography class="mb-3" v-if="showAvatar">{{ message.user_info.nickname || message.user_info.name }}
        </Typography>
        <div class="flex items-end">
          <!--bubble-->
          <div @click="handleCloseContextMenu" v-click-outside="contextConfig"
            @contextmenu.prevent="handleShowContextMenu"
            class="group max-w-[500px] p-5 rounded-b transition duration-500" :class="{
              'rounded-tl ml-4 order-2 bg-indigo-50 dark:bg-gray-600':
                self && !selected,

              'rounded-tr mr-4 bg-gray-50 dark:bg-gray-600': !self && !selected,

              'rounded-tl ml-4 order-2 bg-indigo-200 dark:bg-indigo-500':
                self && selected,

              'rounded-tr mr-4 bg-indigo-200 dark:bg-indigo-500':
                !self && selected
            }">
            <!--reply to-->
            <MessagePreview v-if="message.content.answerMsgText" :message="message" message-key="answerMsgText"
              :self="self" class="mb-5 px-3" />

            <!--content-->
            <Typography variant="body-2" noColor v-if="message.messageType === 'text' && message.content.text"
              class="outline-none text-black opacity-60 dark:text-white dark:opacity-70" v-html="linkifyStr(message.content.text, {
                className: self
                  ? 'text-black opacity-50'
                  : 'text-indigo-500 dark:text-indigo-300',
                format: {
                  url: value =>
                    value.length > 50 ? value.slice(0, 50) + `…` : value
                }
              })
                " tabindex="0">
            </Typography>

            <CfNameCard :message="message" v-else-if="message.messageType === 'nameCard'" />
            <!--recording-->
            <div v-else-if="message.content && message.messageType === 'voice'">
              <RecordingV2 :message="message" :self="self" />
            </div>

            <!--attachments-->
            <AttachmentsV2 v-if="
              message.messageType === 'image' ||
              message.messageType === 'video' ||
              message.messageType === 'file'
            " :message="message" :self="self" @click="!selectMessageStore.selectMode && handleOpenCarousel()" />
          </div>

          <!--read receipt-->
          <Receipt v-if="self && receiptTime >= message.time" :state="'read'" />
        </div>
      </div>
    </div>
    <MessageContextMenu :selected="selected" :message="message" :show="showContextMenu"
      :left="contextMenuCoordinations.x" :top="contextMenuCoordinations.y"
      :handle-close-context-menu="handleCloseContextMenu"
      :handle-select-message="selectMessageStore.handleSelectMessage"
      :handle-deselect-message="selectMessageStore.handleDeselectMessage" />
  </div>
</template>
