<script setup lang="ts">
import { ComponentInstance, computed, onMounted, ref, Ref } from 'vue'
import TimelineDivider from '@src/components/views/HomeView/Chat/ChatMiddle/TimelineDivider.vue'
import useChatStore from '@src/store/chat'
import { IMessageV2, IMessageWrapper } from '@src/typeV2'
import MessageV2 from '@src/components/views/HomeView/Chat/ChatMiddle/Message/MessageV2.vue'
import linkifyStr from 'linkify-string'
import Typography from '@src/components/ui/data-display/Typography.vue'
import CarouselV2 from '@src/components/ui/data-display/Carousel/CarouselV2.vue'
import useSelectMessageStore from '@src/store/selectMessage'
import { toFriendlyTime } from '@src/assets/utils'

const props = defineProps<{
  messageList: IMessageWrapper[]
  onScroll: (ev: Event) => void
}>()

const chatStore = useChatStore()
const selectMessageStore = useSelectMessageStore()

const container: Ref<HTMLElement | null> = ref(null)
const carouselRef = ref<ComponentInstance<typeof CarouselV2>>()

const messageList = computed(() => props.messageList)

// checks whether the previous message was sent by the same user.
const isFollowUp = (index: number, previousIndex: number): boolean => {
  if (previousIndex < 0) {
    return false
  } else {
    let previousSender = messageList.value[previousIndex].msg.user_info.uid
    let currentSender = messageList.value[index].msg.user_info.uid
    return previousSender === currentSender
  }
}

const today = new Date()
const todayFirstMessageIndex = computed(() => {
  return messageList.value.findIndex(item => {
    const sentDate = new Date(item.msg.time * 1000)
    return (
      today.getFullYear() === sentDate.getFullYear() &&
      today.getMonth() === sentDate.getMonth() &&
      today.getDate() === sentDate.getDate()
    )
  })
})

// scroll messages to bottom.
onMounted(() => {
  container.value?.addEventListener(
    'scroll',
    ev => {
      props.onScroll(ev)
    },
    false
  )
})

function scrollToBottom() {
  container.value!.scrollTop = container.value!.scrollHeight
}

function scrollTo(num: number) {
  container.value!.scrollTop = num
}

function handleOpenCarousel(message: IMessageWrapper) {
  const items = messageList.value
    .map(item => {
      if (item.msg.messageType === 'image') {
        return {
          url: item.msg.content.fullURL,
          type: 'image',
          msgId: item.msg.id
        }
      } else if (item.msg.messageType === 'video') {
        return {
          url: item.msg.content.fullURL,
          thumbnail:
            item.msg.content.fullURL + '?ci-process=snapshot&time=1&format=jpg',
          type: 'video',
          msgId: item.msg.id
        }
      }
    })
    .filter(item => item) as Array<{
    url: string
    type: 'video' | 'image'
    thumbnail?: string
    msgId: number
  }>
  const startIndex = items.findIndex(item => item.msgId === message.msg.id)
  console.log('items', items)
  carouselRef.value?.open(items, startIndex)
}

function equalPrevTime(index: number) {
  const messageList = props.messageList
  const getFriendlyTime = (msg: IMessageV2) => {
    return toFriendlyTime(msg.time * 1000)
  }

  if (index === 0) {
    return false
  } else if (index === messageList.length - 1) {
    return false
  } else {
    return (
      getFriendlyTime(messageList[index].msg) ===
      getFriendlyTime(messageList[index - 1].msg)
    )
  }
}

defineExpose({ scrollToBottom, scrollTo })
</script>

<template>
  <div
    ref="container"
    class="grow px-5 py-5 flex flex-col overflow-y-scroll scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-slate-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-slate-300 scrollbar-track:!rounded dark:scrollbar-track:!bg-slate-500/[0.16] dark:scrollbar-thumb:!bg-slate-500/50 lg:supports-scrollbars:pr-2"
  >
    <template v-if="chatStore.status !== 'loading'">
      <template v-for="(message, index) in messageList">
        <div
          :data-message-id="message.msg.id"
          :key="message.msg.id"
          v-if="message.type === 0"
        >
          <TimelineDivider v-if="todayFirstMessageIndex === index" />
          <view
            class="w-full my-3 flex items-center justify-center"
            v-if="!equalPrevTime(index)"
          >
            <Typography variant="body-4" class="mx-5">
              {{ toFriendlyTime(message.msg.time * 1000) }}
            </Typography>
          </view>
          <MessageV2
            :message="message.msg"
            :self="message.msg.self"
            :equal-prev-time="equalPrevTime(index)"
            :follow-up="isFollowUp(index, index - 1)"
            :divider="todayFirstMessageIndex === index"
            :selected="selectMessageStore.isSelected(message.msg)"
            :receipt-time="chatStore.receiptTime"
            :handle-select-message="selectMessageStore.handleSelectMessage"
            :handle-deselect-message="selectMessageStore.handleDeselectMessage"
            :handle-open-carousel="() => handleOpenCarousel(message)"
          />
        </div>
        <div
          class="group p-5 flex justify-center rounded-b transition duration-500"
          v-else
        >
          <Typography
            variant="body-2"
            noColor
            class="text-center outline-none text-black opacity-60 dark:text-white dark:opacity-70"
            v-html="
              linkifyStr('系统消息：' + message.msg.content.text, {
                className: 'text-indigo-500 dark:text-indigo-300',
                format: {
                  url: value =>
                    value.length > 50 ? value.slice(0, 50) + `…` : value
                }
              })
            "
            tabindex="0"
          ></Typography>
        </div>
      </template>
    </template>

    <!--carousel modal-->
    <CarouselV2 ref="carouselRef" />
  </div>
</template>
