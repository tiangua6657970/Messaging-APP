import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'
import {
  IChatInfo,
  IContactInfo,
  type IFriend,
  IMessageV2
} from '@src/typeV2.js'
import useChatStore from '@src/store/chat'
import { ossURL } from '@src/service/config'

const useActionStore = defineStore('actionStore', () => {
  const replyMessageMap = ref<Record<string, IMessageV2>>({})
  const pinnedMessageMap = ref<Record<string, IMessageV2>>({})
  const draftMessageMap = ref<Record<string, string>>({})
  const groupNoticeMap: Record<string, boolean> = {}
  const openChatInfo = ref(false)
  const openInfo = ref(false)
  const viewChatInfo = ref<IChatInfo>()
  const viewConcatInfo = ref<IContactInfo>()
  const viewConcatInfoOpen = ref(false)
  const contactModalOpen = ref(false)
  const chatTopInfo = ref({ avatar: '', show_name: '聊天', time: '' })

  const activeMessageItem = ref<IMessageV2>()
  const forwardModalOpen = ref(false)
  const forwardType = ref<'message' | 'card'>('message')
  const forwardContent = ref()

  const selectContactModalOpen = ref(false)
  const adminManagementOpen = ref(false)

  const chatStore = useChatStore()

  const replyMessage = computed(
    () => replyMessageMap.value[chatStore.activeConversationId!]
  )

  const pinnedMessage = computed(
    () => pinnedMessageMap.value[chatStore.activeConversationId!]
  )

  const draftMessage = computed(
    () => draftMessageMap.value[chatStore.activeConversationId!]
  )

  function setReply(message?: IMessageV2) {
    if (message) {
      replyMessageMap.value[chatStore.activeConversationId!] = message
    } else {
      delete replyMessageMap.value[chatStore.activeConversationId!]
    }
  }

  function setPin(message?: IMessageV2) {
    if (message) {
      pinnedMessageMap.value[chatStore.activeConversationId!] = message
    } else {
      delete pinnedMessageMap.value[chatStore.activeConversationId!]
    }
  }

  function setDraftMessage(text?: string) {
    if (text) {
      draftMessageMap.value[chatStore.activeConversationId!] = text
    } else {
      delete draftMessageMap.value[chatStore.activeConversationId!]
    }
  }

  function handleCopy(message: IMessageV2) {
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(message.content.text)
        .then(r => {})
        .catch(reason => {
          debugger
        })
    }
  }

  async function handleOpenContactInfo(contact: IFriend | number) {
    const { err, data } = await chatStore.getUserinfoById({
      user_id: typeof contact === 'number' ? contact : contact.user_id
    })
    if (err) {
      return
    }
    data.avatar = `${ossURL}${data.avatar}`
    viewConcatInfo.value = data
    viewConcatInfoOpen.value = true
  }

  async function handleMuteManagement() {
    selectContactModalOpen.value = true
  }

  async function handleAdminManagement() {
    adminManagementOpen.value = true
  }

  watch(viewChatInfo, newVal => {
    console.log('viewChatInfo', newVal)
    if (newVal) {
      openInfo.value = true
    }
  })

  function handleFavorite() {}

  watch(openChatInfo, newVal => {
    if (newVal) {
      document.addEventListener('keydown', event => {
        if (['Escape', 'Esc'].includes(event.key)) {
          openChatInfo.value = false
        }
      })
    }
  })

  return {
    replyMessageMap,
    pinnedMessageMap,
    draftMessageMap,
    groupNoticeMap,
    replyMessage,
    pinnedMessage,
    draftMessage,
    openChatInfo,
    contactModalOpen,
    viewChatInfo,
    openInfo,
    viewConcatInfo,
    viewConcatInfoOpen,
    chatTopInfo,
    activeMessageItem,
    forwardModalOpen,
    forwardType,
    forwardContent,
    selectContactModalOpen,
    adminManagementOpen,
    handleMuteManagement,
    handleAdminManagement,
    setReply,
    setPin,
    setDraftMessage,
    handleCopy,
    handleOpenContactInfo
  }
})

export default useActionStore
