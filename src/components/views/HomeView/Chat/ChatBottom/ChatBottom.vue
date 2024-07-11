<script setup lang="ts" xmlns="http://www.w3.org/1999/html">
import { ComponentInstance, computed, onMounted, Ref, ref, watch } from 'vue'

import useStore from '@src/store/store'

import {
  FaceSmileIcon,
  PaperAirplaneIcon,
  PaperClipIcon,
  XCircleIcon,
  PhotoIcon
} from '@heroicons/vue/24/outline'
import AttachmentsModal from '@src/components/shared/modals/AttachmentsModal/AttachmentsModal.vue'
import IconButton from '@src/components/ui/inputs/IconButton.vue'
import ScaleTransition from '@src/components/ui/transitions/ScaleTransition.vue'
import ReplyMessage from '@src/components/views/HomeView/Chat/ChatBottom/ReplyMessage.vue'
import EmojiPicker from '@src/components/ui/inputs/EmojiPicker/EmojiPicker.vue'
import Textarea from '@src/components/ui/inputs/Textarea.vue'
import useChatStore from '@src/store/chat'
import useSelectMessageStore from '@src/store/selectMessage'
import useActionStore from '@src/store/action'
import Swal from 'sweetalert2'
import {
  b64toBlob,
  messageTypeReverseMap,
  showModal,
  showToast
} from '@src/assets/utils'
import TextareaV2 from '@src/components/ui/inputs/TextareaV2.vue'

interface Props {
  handleSendText: (value: string) => void
}

const props = defineProps<Props>()
const store = useStore()
const chatStore = useChatStore()
const isGroupOwner = computed(() => chatStore.isGroupOwner)
const selectMessageStore = useSelectMessageStore()
const member = computed(() => chatStore.currentChatInfo.member)
const actionStore = useActionStore()
const mentionUid = ref<string>()

// the content of the message.
const value: Ref<string> = ref('')

// open emoji picker.
const showPicker = ref(false)

const textareaRef = ref<ComponentInstance<typeof Textarea>>()

// open modal used to send multiple attachments attachments.
const openAttachmentsModal = ref(false)

// close picker when you click outside.
const handleClickOutside = (event: Event) => {
  let target = event.target as HTMLElement
  let parent = target.parentElement as HTMLElement

  if (
    target &&
    !target.classList.contains('toggle-picker-button') &&
    parent &&
    !parent.classList.contains('toggle-picker-button')
  ) {
    showPicker.value = false
  }
}

async function handleSend() {
  if (!value.value) {
    return
  }
  let messageType = 0
  const replyMessage = actionStore.replyMessage
  if (replyMessage && mentionUid.value) {
    messageType = 16
  } else if (mentionUid.value) {
    messageType = 14
  } else if (replyMessage) {
    messageType = 15
  }
  const { err, msg } = await chatStore.sendMessage({
    list_id: chatStore.activeConversationId!,
    content: {
      text: value.value,
      answerMsgText: replyMessage && replyMessage.content.text,
      answerMsgId: replyMessage && replyMessage.id,
      mentionUid: (isGroupOwner.value && value.value.includes('@所有人')) as any as string,
    },
    content_type: messageType
  })
  if (err === 1) {
    try {
      const { isConfirmed } = await showModal({
        title: '好友提示',
        text: '你不是对方的好友, 要发送好友申请吗?',
        icon: 'error'
      })
      if (isConfirmed) {
        const { value: text, isConfirmed } = await Swal.fire({
          title: '好友验证消息',
          input: 'textarea',
          icon: 'question',
          inputLabel: '验证消息',
          inputPlaceholder: '请输入好友验证消息...',
          inputAttributes: {
            'aria-label': 'Type your message here'
          },
          showCancelButton: true
        })
        if (!isConfirmed) {
          return
        }
        const friend = chatStore.currentChatInfo.member.find(
          item => item.user_id !== chatStore.chatUserinfo.id
        )
        if (friend) {
          const { err, data, msg } = await chatStore.addFriend({
            user_id: friend.user_id,
            content: text
          })
          showToast({ text: msg, icon: err ? 'error' : 'success' })
          chatStore.refreshFriendList().then()
          chatStore.refreshChatList().then()
        }
      }
    } catch (e) {}
  }
  value.value = ''
  actionStore.setReply()
}

function handleSelectEmoji(emoji: string) {
  value.value = value.value + emoji
}

interface HTMLInputEvent extends Event {
  target: HTMLInputElement & EventTarget
}

type IFileType = 'image' | 'video' | 'file'

async function handleUploadChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files && target.files.length) {
    // TODO upload
    // Swal.fire({
    //   title: '正在上传',
    //   showCloseButton: true,
    //   didOpen(popup) {
    //     Swal.showLoading()
    //   },
    // })
    const file = target.files[0]
    let fileType: IFileType
    // 判断所选文件是否为图片或视频
    if (/image\/\w+/.test(file.type)) {
      fileType = 'image'
    } else if (/video\/\w+/.test(file.type)) {
      fileType = 'video'
    } else {
      fileType = 'file'
    }
    const uploadRes = await chatStore.uploadChatFile(target.files[0])
    if (uploadRes.err) {
      showToast({ text: uploadRes.msg, icon: 'error' })
      return
    }
    await sendFile(uploadRes.data.path, fileType)
  }
}

async function sendFile(path: string, fileType: IFileType) {
  await chatStore.sendMessage({
    list_id: chatStore.activeConversationId!,
    content: {
      url: path
    },
    content_type: messageTypeReverseMap[fileType]
  })
}

watch(
  () => actionStore.replyMessage,
  newVal => {
    if (newVal) {
      if (!chatStore.isMuted) {
        textareaRef.value?.focus()
      }
    }
  }
)

watch(value, newVal => {
  actionStore.setDraftMessage(value.value)
})

onMounted(() => {
  value.value = actionStore.draftMessage || ''
  textareaRef.value?.focus()
  document.documentElement.addEventListener('paste', event => {
    const clipboardData = event.clipboardData
    const paste = clipboardData?.getData('text') || ''
    const items = event.clipboardData && event.clipboardData.items
    let file: File | null = null
    if (items && items.length) {
      // 检索剪切板items
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          file = items[i].getAsFile()
          break
        }
      }
    }
    if (file) {
      const reader = new FileReader()
      reader.onload = function (event) {
        const result = event.target?.result
        if (result) {
          showSendImageModal(result as string, file as File)
        }
      }
      event.preventDefault()
      reader.readAsDataURL(file)
    }
    if (!/^data:image\/[a-z]+;base64,/.test(paste)) {
      return
    }
    event.preventDefault()
    showSendImageModal(paste)
  })
})

async function showSendImageModal(src: string, file?: File) {
  Swal.fire({
    title: '发送图片',
    icon: 'question',
    html: `<img style="margin: 0 auto" id="image" src="${src}" alt=""/>`,
    showCloseButton: true
  }).then(async res => {
    if (res.isConfirmed) {
      if (file) {
        const { err, data, msg } = await chatStore.uploadChatFile(file)
        if (err) {
          showToast({ text: msg, icon: 'error' })
          return
        }
        await sendFile(data.path, 'image')
        return
      } else {
        console.log('src----------', src)
        const blob = b64toBlob(src)
        console.log('blob', blob)
      }
    }
  })
}

function handleUploadAllFile() {
  document.getElementById('allFile')?.click()
}

function handleUploadImageFile() {
  document.getElementById('imageFile')?.click()
}
</script>

<template>
  <div class="w-full">
    <!--selected reply display-->
    <div
      class="relative transition-all duration-200"
      :class="{ 'pt-[60px]': actionStore?.replyMessage }"
    >
      <ReplyMessage />
    </div>
    <template v-if="!selectMessageStore.selectMode"></template>
    <div
      class="h-auto min-h-[84px] p-5 flex items-end relative"
      v-if="store.status !== 'loading'"
    >
      <div class="min-h-[44px]">
        <!--select attachments button-->
        <IconButton
          title="open select attachments modal"
          aria-label="open select attachments modal"
          class="group w-7 h-7 md:mr-5 xs:mr-4"
          @click="handleUploadAllFile"
        >
          <PaperClipIcon
            class="w-[20px] h-[20px] text-gray-400 group-hover:text-indigo-300"
          />
        </IconButton>
      </div>
      <input
        id="allFile"
        type="file"
        class="hidden"
        @change="handleUploadChange"
      />
      <input
        id="imageFile"
        type="file"
        class="hidden"
        accept="image/*"
        @change="handleUploadChange"
      />
      <!--message textarea-->
      <div class="grow md:mr-5 xs:mr-4 self-end">
        <div class="relative">
          <!--<Textarea-->
          <!--  ref="textareaRef"-->
          <!--  v-model="value"-->
          <!--  :value="value"-->
          <!--  class="max-h-[80px] pr-[50px] resize-none scrollbar-hidden"-->
          <!--  auto-resize-->
          <!--  cols="30"-->
          <!--  rows="1"-->
          <!--  :placeholder="chatStore.isMuted ? '禁言了' : '在这里写下你的消息'"-->
          <!--  aria-label="Write your message here"-->
          <!--  @send="handleSend"-->
          <!--/>-->
          <TextareaV2
            ref="textareaRef"
            :value="value"
            v-model="value"
            :placeholder="chatStore.isMuted ? '禁言了' : '在这里写下你的消息'"
            :member="member"
            @send="handleSend"
          />

          <!--emojis-->
          <div class="absolute bottom-[13px] right-0">
            <!--emoji button-->
            <IconButton
              title="toggle emoji picker"
              aria-label="toggle emoji picker"
              @click="showPicker = !showPicker"
              class="toggle-picker-button group w-7 h-7 md:mr-5 xs:mr-4"
            >
              <XCircleIcon
                v-if="showPicker"
                class="w-[20px] h-[20px] text-gray-400 group-hover:text-indigo-300"
              />
              <FaceSmileIcon
                v-else
                class="w-[20px] h-[20px] text-gray-400 group-hover:text-indigo-300"
              />
            </IconButton>

            <!--emoji picker-->
            <ScaleTransition>
              <div
                v-click-outside="handleClickOutside"
                v-show="showPicker"
                class="absolute z-10 bottom-[55px] md:right-0 xs:right-[-80px] mt-2"
              >
                <div role="none">
                  <EmojiPicker
                    :show="showPicker"
                    :handleSelect="handleSelectEmoji"
                  />
                </div>
              </div>
            </ScaleTransition>
          </div>
        </div>
      </div>
      <div class="min-h-[44px] flex">
        <IconButton
          title="send image"
          aria-label="send image"
          class="group w-7 h-7 md:mr-5 xs:mr-4"
          @click="handleUploadImageFile"
        >
          <PhotoIcon
            class="w-[20px] h-[20px] text-gray-400 group-hover:text-indigo-300"
          />
        </IconButton>
        <!--send message button-->
        <IconButton
          class="group w-7 h-7 bg-indigo-300 hover:bg-indigo-400 focus:bg-indigo-400 dark:focus:bg-indigo-300 dark:bg-indigo-400 dark:hover:bg-indigo-400 active:scale-110"
          variant="ghost"
          title="send message"
          aria-label="send message"
          @click="handleSend"
        >
          <PaperAirplaneIcon class="w-[17px] h-[17px] text-white" />
        </IconButton>
      </div>
      <div
        class="absolute top-5 right-5 bottom-5 left-5"
        v-if="chatStore.isMuted"
      ></div>
    </div>
    <AttachmentsModal
      :open="openAttachmentsModal"
      :close-modal="() => (openAttachmentsModal = false)"
    />
  </div>
</template>

<style>
input[placeholder='Search emoji'] {
  background: rgba(0, 0, 0, 0);
}

.v3-emoji-picker .v3-header {
  border-bottom: 0;
}

.v3-emoji-picker .v3-footer {
  border-top: 0;
}
</style>
