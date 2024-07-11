<script setup lang="ts">
import { computed } from 'vue'

import {
  ArrowUturnLeftIcon,
  BookmarkIcon,
  BookmarkSquareIcon,
  CheckCircleIcon,
  CubeIcon,
  ShareIcon,
  TrashIcon,
  XCircleIcon
} from '@heroicons/vue/24/outline'
import Dropdown from '@src/components/ui/navigation/Dropdown/Dropdown.vue'
import DropdownLink from '@src/components/ui/navigation/Dropdown/DropdownLink.vue'
import { IMessageV2 } from '@src/typeV2'
import useActionStore from '@src/store/action'
import useChatStore from '@src/store/chat'
import { doCopyImg2Clipboard } from '@src/assets/utils'

const props = defineProps<{
  message: IMessageV2
  show: boolean
  left: number
  top: number
  selected: boolean
  handleCloseContextMenu: () => void
  handleSelectMessage: (message: IMessageV2) => void
  handleDeselectMessage: (message: IMessageV2) => void
}>()

interface Action {
  type: string
  text: string
}

const actionStore = useActionStore()
const chatStore = useChatStore()

const actionList = computed(() => {
  switch (props.message.messageType) {
    case 'text':
      return [
        { type: 'reply', text: '回复' },
        { type: 'copy', text: '拷贝' },
        {
          type: 'forward',
          text: '转发'
        },
        // { type: 'favorite', text: 'Favorite' },
        { type: 'pin', text: 'Pin' }
      ]
    case 'voice':
      return [
        {
          type: 'forward',
          text: '转发'
        }
      ]
    case 'image':
      return [
        {
          type: 'forward',
          text: '转发'
        },
        { type: 'copy', text: '拷贝' }
        // { type: 'favorite', text: 'Favorite' }
      ]
    case 'video':
      return [
        {
          type: 'forward',
          text: '转发'
        }
        // { type: 'favorite', text: 'Favorite' }
      ]
    case 'nameCard':
      return [
        {
          type: 'forward',
          text: '转发'
        }
      ]
  }
})

function handleReply() {
  actionStore.setReply(props.message)
  props.handleCloseContextMenu()
}

function handleCopy() {
  if (props.message.messageType === 'image') {
    doCopyImg2Clipboard(props.message.content.fullURL)
    // doCopyImgBase64Clipboard(props.message.content.fullURL)
  } else {
    actionStore.handleCopy(props.message)
  }
  props.handleCloseContextMenu()
}

function handlePin() {
  actionStore.setPin(props.message)
  props.handleCloseContextMenu()
}

async function handleWithdrawMessage() {
  await chatStore.withdrawMessage(props.message.id)
}

function handleForward() {
  actionStore.forwardModalOpen = true
  actionStore.activeMessageItem = props.message
  props.handleCloseContextMenu()
}

function handleFavorite() {}
</script>

<template>
  <!--custom context menu-->
  <Dropdown
    :close-dropdown="handleCloseContextMenu"
    :handle-click-outside="handleCloseContextMenu"
    :show="show"
    :coordinates="{
      left: props.left + 'px',
      top: props.top + 'px'
    }"
    :position="['top-0']"
  >
    <template
      v-for="item in actionList"
      :key="item.type"
      @click="handleActionClick(item)"
    >
      <DropdownLink v-if="item.type === 'reply'" :handle-click="handleReply">
        <ArrowUturnLeftIcon class="h-5 w-5 mr-3" />
        {{ item.text }}
      </DropdownLink>
      <DropdownLink v-else-if="item.type === 'copy'" :handle-click="handleCopy">
        <BookmarkIcon class="h-5 w-5 mr-3" />
        {{ item.text }}
      </DropdownLink>
      <DropdownLink v-else-if="item.type === 'pin'" :handle-click="handlePin">
        <BookmarkSquareIcon class="h-5 w-5 mr-3" />
        {{ item.text }}
      </DropdownLink>
      <DropdownLink
        v-else-if="item.type === 'forward'"
        :handle-click="handleForward"
      >
        <ShareIcon class="h-5 w-5 mr-3" />

        {{ item.text }}
      </DropdownLink>
      <DropdownLink
        v-else-if="item.type === 'favorite'"
        :handle-click="handleFavorite"
      >
        <CubeIcon class="h-5 w-5 mr-3" />
        {{ item.text }}
      </DropdownLink>
    </template>
    <!-- TODO： 选择信息 -->
    <!--<DropdownLink-->
    <!--  v-if="props.selected"-->
    <!--  :handle-click="-->
    <!--    () => {-->
    <!--      handleCloseContextMenu()-->
    <!--      props.handleDeselectMessage(message)-->
    <!--    }-->
    <!--  "-->
    <!--&gt;-->
    <!--  <XCircleIcon class="h-5 w-5 mr-3" />-->
    <!--  取消选择-->
    <!--</DropdownLink>-->

    <!--<DropdownLink-->
    <!--  v-else-->
    <!--  :handle-click="-->
    <!--    () => {-->
    <!--      handleCloseContextMenu()-->
    <!--      props.handleSelectMessage(message)-->
    <!--    }-->
    <!--  "-->
    <!--&gt;-->
    <!--  <CheckCircleIcon class="h-5 w-5 mr-3" />-->
    <!--  选择-->
    <!--</DropdownLink>-->

    <DropdownLink
      :handle-click="
        () => {
          handleWithdrawMessage()
          handleCloseContextMenu
        }
      "
    >
      <TrashIcon class="h-5 w-5 mr-3" />
      撤回
    </DropdownLink>
  </Dropdown>
</template>
