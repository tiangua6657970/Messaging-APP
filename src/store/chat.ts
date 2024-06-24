import { defineStore } from 'pinia'
import { getChatToken, getServiceURL } from '@src/service'
import { randomStr } from '@src/assets/utils'
import { ref } from 'vue'
import { request } from '@src/service/base'
import {
  IBaseInfo,
  IChat,
  IChatUserinfo,
  IContactGroup,
  IFriendMap,
  IImageEmoji,
  IMessageV2,
  IMessageWrapper,
  SidebarComponentName,
  SocketAction
} from '@src/typeV2'

const useChatStore = defineStore(
  'chatStore',
  () => {
    const chatToken = ref('')
    const chatServiceHTTP = ref('')
    const chatServiceWS = ref('')
    const chatUserinfo = ref<IChatUserinfo>({} as IChatUserinfo)
    const newGroupTipsNum = ref<number>(0)
    const newFriendTipsNum = ref<number>(0)
    const unreadMsgCount = ref<number>(0)
    const chatList = ref<IChat[]>([])
    const archivedConversations = ref<IChat[]>([])
    const imageEmojiList = ref<IImageEmoji[]>([])
    const contactGroups = ref<IContactGroup[]>([])
    const activeConversationId = ref<string>()
    const conversationOpen = ref<string>('open')
    const status = ref<'idle' | 'loading' | 'success'>('idle')
    const delayLoading = ref(true)
    const activeSidebarComponent = ref<SidebarComponentName>('messages')

    let webSocket: WebSocket

    async function refreshChat(code: string) {
      status.value = 'loading'
      setTimeout(() => {
        delayLoading.value = false
      })
      const serviceURLRes = await getServiceURL({
        code
      })
      if (!serviceURLRes.data.http || !serviceURLRes.data.ws) {
        alert('没有配置服务！')
      }
      chatServiceHTTP.value = serviceURLRes.data.http
      chatServiceWS.value = serviceURLRes.data.ws
      const chatTokenRes = await getChatToken({
        code,
        client_id: randomStr(4)
      })
      if (!chatTokenRes.data) {
        alert('获取token失败!')
        return
      }
      chatToken.value = chatTokenRes.data
      connection()
    }

    function chatRequest<R>(url: string, data: object | null = {}) {
      return request<R>(
        url,
        { ...(data || {}), _token: chatToken.value },
        'POST',
        {
          baseURL: chatServiceHTTP.value
        }
      )
    }

    function connection() {
      webSocket = new WebSocket(chatServiceWS.value)
      webSocket.addEventListener('open', e => {
        console.log('----webSocket open----', e)
        sendMessage({ action: 'checkToken', data: chatToken.value })
      })
      webSocket.addEventListener('message', e => {
        console.log('----webSocket message----', e.data)
        let messagePayload
        try {
          messagePayload = JSON.parse(e.data)
        } catch (e) {
          debugger
        }
        const messageAction = messagePayload.action
        const messageData = messagePayload.data
        switch (messageAction) {
          case 'checkToken':
            refreshUserinfo().then()
            refreshBaseInfo().then()
            refreshChatList().then()
            refreshImageEmojiList().then()
            refreshFriendList().then()
            return
          case 'chatData':
            return
          case 'deleteChat':
            return
          case 'removeGroup':
            const index = chatList.value.findIndex(
              item => item.list_id === messageData.list_id
            )
            if (index !== -1) {
              chatList.value.splice(index, 1)
            }
            return
          case 'banChat':
            return
          case 'newFriend':
            newFriendTipsNum.value = messageData.num
            return
          case 'getFriendList':
            refreshFriendList()
            return
          case 'chatGroupApply':
            return
          case 'offline':
            return
          case 'readReceipt':
            return
          case 'vedioData':
            return
          case 'cancleVedio':
            return
          case 'zhenDong':
            return
          case 'getChatList':
            refreshChatList()
            return
          case 'memberIsOnline':
            return
        }
      })
      webSocket.addEventListener('close', e => {
        debugger
      })
      webSocket.addEventListener('error', e => {
        debugger
      })
    }

    function sendMessage(payload: { action: SocketAction; data: any }) {
      webSocket.send(JSON.stringify(payload))
    }

    async function refreshUserinfo() {
      const res = await chatRequest<IChatUserinfo>('im/get/getUserInfo')
      chatUserinfo.value = res.data
    }

    async function refreshBaseInfo() {
      const res = await chatRequest<IBaseInfo>('im/get/base')
      newFriendTipsNum.value = res.data.new_friend_tips_num
      newGroupTipsNum.value = res.data.new_group_tips_num
    }

    async function refreshChatList() {
      const res = await chatRequest<IChat[]>('im/get/chatList')
      chatList.value = res.data
      let sumNoReaderNum = 0
      for (const item of res.data) {
        sumNoReaderNum += item.no_reader_num
      }
      unreadMsgCount.value = sumNoReaderNum
      status.value = 'success'
    }

    async function refreshImageEmojiList() {
      const res = await chatRequest<IImageEmoji[]>('im/image/list')
      imageEmojiList.value = res.data
    }

    async function refreshFriendList() {
      const res = await chatRequest<{ data: IFriendMap }>('im/get/friendList')
      contactGroups.value = Object.values(res.data.data)
    }

    async function getChatMessageHistory(payload: {
      list_id: string
      time: number
      is_up: 1 | 0
    }) {
      return await chatRequest<{
        list: IMessageWrapper[]
      }>('im/get/chatData', payload)
    }

    return {
      chatToken,
      chatServiceHTTP,
      chatServiceWS,
      chatUserinfo,
      refreshChat,
      chatList,
      contactGroups,
      archivedConversations,
      activeConversationId,
      conversationOpen,
      status,
      delayLoading,
      activeSidebarComponent,
      newGroupTipsNum,
      newFriendTipsNum,
      unreadMsgCount,
      chatRequest,
      getChatMessageHistory
    }
  },
  {
    persist: {
      paths: [
        'activeConversationId',
        'conversationOpen',
        'activeSidebarComponent'
      ]
    }
  }
)

export default useChatStore
