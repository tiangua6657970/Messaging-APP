import { defineStore } from 'pinia'
import { getChatToken, getServiceURL } from '@src/service'
import {
  messageTypeMap,
  randomStr,
  showModal,
  showToast
} from '@src/assets/utils'
import { computed, ref } from 'vue'
import { request } from '@src/service/base'
import {
  IBaseInfo,
  IChat,
  IChatInfo,
  IChatUserinfo,
  IContactGroup,
  IContactInfo,
  IFriend,
  IFriendMap,
  IFriendRequest,
  IGroupJoinRequest,
  IImageEmoji,
  IMessageWrapper,
  IReadReceipt,
  ISocketMessage,
  SidebarComponentName,
  uploadResult
} from '@src/typeV2'
import { ossURL } from '@src/service/config'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const useChatStore = defineStore(
  'chatStore',
  () => {
    const codeError = ref()
    const chatToken = ref('')
    const chatServiceHTTP = ref('')
    const chatServiceWS = ref('')
    const chatUserinfo = ref<IChatUserinfo>({} as IChatUserinfo)
    const newGroupTipsNum = ref<number>(0)
    const newFriendTipsNum = ref<number>(0)
    const unreadMsgCount = ref<number>(0)
    const chatList = ref<IChat[]>([])
    const archivedConversations = ref<IChat[]>([])
    const archivedConversationIds = ref<string[]>([])
    const imageEmojiList = ref<IImageEmoji[]>([])
    const contactGroups = ref<IContactGroup[]>([])
    const activeConversationId = ref<string>()
    const currentChatInfo = ref<IChatInfo>({} as IChatInfo)
    const conversationOpen = ref<string>('close')
    const status = ref<'idle' | 'loading' | 'success'>('idle')
    const delayLoading = ref(true)
    const activeSidebarComponent = ref<SidebarComponentName>('messages')
    const newMessageWrapper = ref<{
      list_id: string
      messageWrapper: IMessageWrapper
      isCurrentChat: boolean
    }>()
    const replaceMessage = ref<IMessageWrapper>()
    const receiptTime = ref(0)
    const isGroupOwner = ref(false)
    const isAdmin = ref(false)
    const isMuted = ref(false)
    const mutedUserList = ref<number[]>([])
    const friendRequestList = ref<IFriendRequest[]>([])
    const groupJoinRequestList = ref<IGroupJoinRequest[]>([])

    const currentChat = computed(() => {
      return chatList.value.find(
        item => item.list_id === activeConversationId.value
      )
    })
    const contactList = computed(() => {
      return contactGroups.value.flatMap(item => item.data)
    })

    let webSocket: WebSocket

    function reset() {
      conversationOpen.value = 'close'
      activeConversationId.value = undefined
      activeSidebarComponent.value = 'messages'
    }

    async function refreshChat(code: string) {
      status.value = 'loading'
      setTimeout(() => {
        delayLoading.value = false
      })
      const serviceURLRes = await getServiceURL({
        code
      })
      if (serviceURLRes.err) {
        showModal({ text: serviceURLRes.msg, icon: 'error' }).then(res => {
          codeError.value = true
        })
        return
      }
      if (!serviceURLRes.data.http || !serviceURLRes.data.ws) {
        showModal({
          text: serviceURLRes.msg || '没有配置服务！',
          icon: 'error'
        }).then(res => {
          codeError.value = true
        })
        return
      }
      chatServiceHTTP.value = serviceURLRes.data.http
      chatServiceWS.value = serviceURLRes.data.ws
      const chatTokenRes = await getChatToken({
        code,
        client_id: randomStr(4)
      })
      if (!chatTokenRes.data) {
        showModal({ text: '登录聊天失败！', icon: 'error' }).then(res => {
          codeError.value = true
        })
        return
      }
      chatToken.value = chatTokenRes.data
      connection()
    }

    function chatRequest<R>(
      url: string,
      data: object | null = {},
      headers = {}
    ) {
      return request<R>(
        url,
        { ...(data || {}), _token: chatToken.value },
        'POST',
        {
          baseURL: chatServiceHTTP.value,
          headers
        }
      )
    }

    // 发送心跳时间id
    let heartbeatTimerId: any = null
    // 重连时间id
    let reconnectTimerId: any = null
    // 心跳间隔
    const HEARTBEAT_INTERVAL = 18000
    // 重连间隔 重连间隔 - 心跳间隔的时间没有返回心跳就重连
    const RECONNECT_INTERVAL = 22000
    // 最大重连
    const MAX_RECONNECT_COUNT = 3
    // 当前重连
    let currentReConnectCount = 0

    function connection() {
      webSocket = new WebSocket(chatServiceWS.value)
      webSocket.addEventListener('open', e => {
        console.log('----webSocket open----', e)
        webSocket.send(
          JSON.stringify({ action: 'checkToken', data: chatToken.value })
        )
        heartBeatReset()
        heartBeatStart()
      })
      // 最后的消息
      let lastMsgId: number
      webSocket.addEventListener('message', e => {
        console.log('----webSocket message----', JSON.parse(e.data))
        heartBeatReset()
        heartBeatStart()
        let messagePayload
        try {
          messagePayload = JSON.parse(e.data)
        } catch (e) {
          alert('收到错误的消息！')
        }
        const messageAction = messagePayload.action
        const socketData = messagePayload.data
        switch (messageAction) {
          case 'checkToken':
            refreshChatUserinfo().then()
            refreshBaseInfo().then()
            refreshChatList().then()
            refreshImageEmojiList().then()
            refreshFriendList().then()
            return
          case 'chatData':
            if (lastMsgId === socketData.data.msg.id) {
              if (import.meta.env.DEV) {
                alert('消息重复')
              }
              return
            }
            lastMsgId = socketData.data.msg.id
            const messageWrapper = processMessage(socketData.data)

            const isFromCurrentUser =
              messageWrapper.msg.user_info.uid === chatUserinfo.value.id
            const isCurrentChat =
              activeConversationId.value === socketData.list_id

            if (!isFromCurrentUser) {
              if (isCurrentChat) {
                refreshReadReceipt().then()
              }
            }

            newMessageWrapper.value = {
              messageWrapper,
              list_id: socketData.list_id,
              isCurrentChat
            }
            const chatItemIndex = chatList.value.findIndex(
              item => item.list_id === socketData.list_id
            )
            if (chatItemIndex === -1) {
              refreshChatList().then()
            } else {
              const chatItem = chatList.value[chatItemIndex]
              chatItem.messageType = messageWrapper.msg.messageType
              chatItem.content_type = messageWrapper.msg.type
              chatItem.last_msg = messageWrapper.msg.content.text
              chatItem.last_chat_time = messageWrapper.msg.time
              chatItem.mentionUid = messageWrapper.msg.content.mentionUid
              if (!isFromCurrentUser && !isCurrentChat) {
                chatItem.no_reader_num += 1
              }
              // 移动到前面
              if (chatItem.top === 0) {
                const firstNotTopIndex = chatList.value.findIndex(
                  item => item.top !== 1
                )
                chatList.value.splice(chatItemIndex, 1)
                chatList.value.splice(firstNotTopIndex, 0, chatItem)
              } else {
                chatList.value.splice(chatItemIndex, 1)
                chatList.value.unshift(chatItem)
              }
            }
            return
          case 'ping':
            console.log('--------------------收到心跳------------------')
            return
          case 'deleteChat':
            replaceMessage.value = processMessage(socketData.data)
            return
          case 'removeGroup':
            const index = chatList.value.findIndex(
              item => item.list_id === socketData.list_id
            )
            if (index !== -1) {
              chatList.value.splice(index, 1)
            }
            return
          case 'banChat':
            if (!isAdmin.value) {
              isMuted.value = Number(socketData.is_msg) === 1
            }
            return
          case 'newFriend':
            newFriendTipsNum.value = socketData.num
            return
          case 'getFriendList':
            refreshFriendList().then()
            return
          case 'chatGroupApply':
            newGroupTipsNum.value += 1
            return
          case 'offline':
            return
          case 'readReceipt':
            receiptTime.value = socketData.data.open_session_time
            return
          case 'vedioData':
            return
          case 'cancleVedio':
            return
          case 'zhenDong':
            return
          case 'getChatList':
            refreshChatList().then()
            return
          case 'memberIsOnline':
            return
        }
      })
      webSocket.addEventListener('close', e => { })
      webSocket.addEventListener('error', e => {
        heartBeatReset()
        connection()
      })
    }

    function heartBeatStart() {
      heartbeatTimerId = setTimeout(() => {
        webSocket.send(
          JSON.stringify({ action: 'ping', data: chatToken.value })
        )
        console.log('--------------------发送心跳------------------')
        reconnectTimerId = setTimeout(() => {
          if (currentReConnectCount === MAX_RECONNECT_COUNT) {
            if (import.meta.env.DEV) {
              Swal.fire({
                title: `系统提示：聊天服务已进行重连${MAX_RECONNECT_COUNT}次`,
                text: '是否继续重新连接？',
                icon: 'warning',
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: '是的，重连',
                cancelButtonText: '取消',
                keydownListenerCapture: true
              }).then(result => {
                if (result.isConfirmed) {
                  webSocket.close()
                  connection()
                }
              })
            }
            return
          }
          currentReConnectCount++
          if (import.meta.env.DEV) {
            Swal.fire({
              title: `心跳断了， 进行重连第${currentReConnectCount}次`,
              timer: 1500,
              icon: 'warning'
            }).then()
            console.log(`心跳断了， 进行重连第${currentReConnectCount}次`)
          }
          webSocket.close()
          connection()
        }, RECONNECT_INTERVAL)
      }, HEARTBEAT_INTERVAL)
    }

    function heartBeatReset() {
      currentReConnectCount = 0
      clearTimeout(heartbeatTimerId)
      clearTimeout(reconnectTimerId)
    }

    async function refreshChatUserinfo() {
      const res = await chatRequest<IChatUserinfo>('im/get/getUserInfo')
      res.data.avatar = `${ossURL}${res.data.avatar}`
      chatUserinfo.value = res.data
    }

    async function updateChatUserinfo(payload: {
      type: 0 | 3
      content: string
    }) {
      const res = await chatRequest('im/set/setInfo', {
        list_id: activeConversationId.value,
        ...payload
      })
    }

    // 会话基础信息
    async function refreshBaseInfo() {
      const res = await chatRequest<IBaseInfo>('im/get/base')
      newFriendTipsNum.value = res.data.new_friend_tips_num
      newGroupTipsNum.value = res.data.new_group_tips_num
    }

    // 会话详情
    async function getChatInfo(payload?: { list_id: string }) {
      const { err, data } = await chatRequest<IChatInfo>(
        'im/message/getChatDetails',
        { list_id: payload ? payload.list_id : activeConversationId.value }
      )
      if (!err) {
        data.member = data.member.map(item => {
          item.avatar = `${ossURL}${item.avatar}`
          item.name = item.show_name
          return item
        })
        if (data.type === 1) {
          data.group.avatar = `${ossURL}${data.group.avatar}`
        }
      }
      return { err, data }
    }

    // 用户信息
    async function refreshChatInfo() {
      const { err, data } = await getChatInfo()
      if (err) {
        alert('加载聊天详情出错了')
        return
      }
      currentChatInfo.value = data
    }

    // 用户在群的状态
    async function refreshUserGroupStatus() {
      const { err, data } = await chatRequest<{
        is_msg: number
        is_main: number
        is_action: number
      }>('im/action/groupState', {
        list_id: activeConversationId.value
      })
      if (err) {
        return
      }
      isMuted.value = !!data.is_msg
      isGroupOwner.value = !!data.is_main
      isAdmin.value = !!data.is_action
    }

    // 会话列表
    async function refreshChatList() {
      const res = await chatRequest<IChat[]>('im/get/chatList')
      chatList.value = res.data.map(item => {
        item.messageType = messageTypeMap[item.content_type]
        return item
      })
      let sumNoReaderNum = 0
      for (const item of res.data) {
        sumNoReaderNum += item.no_reader_num
        item.avatar = `${ossURL}${item.avatar}`
      }
      unreadMsgCount.value = sumNoReaderNum
      status.value = 'success'
    }

    // 删除会话
    async function deleteConversation(payload: { list_id?: string }) {
      return await chatRequest<IChat[]>('im/chat/deleteChat', {
        list_id: payload.list_id || activeConversationId.value
      })
    }

    // 获取会话id
    async function getListId(payload: { user_id: number }) {
      return await chatRequest<{ list_id: string }>(
        'im/message/getListId',
        payload
      )
    }

    // 自定义表情列表
    async function refreshImageEmojiList() {
      const res = await chatRequest<IImageEmoji[]>('im/image/list')
      imageEmojiList.value = res.data.map(item => {
        item.url = `${ossURL}${item.url}`
        return item
      })
    }

    // 好友列表
    async function refreshFriendList() {
      const res = await chatRequest<{ data: IFriendMap }>('im/get/friendList')
      contactGroups.value = Object.values(res.data.data).map(item => {
        item.data = item.data.map(item => {
          item.avatar = `${ossURL}${item.avatar}`
          return item
        })
        return item
      })
    }

    // 获取和设置已读回执
    async function refreshReadReceipt() {
      const res = await chatRequest<IReadReceipt>(
        'im/message/OpenSessionTime',
        {
          list_id: activeConversationId.value,
          is_readReceipt: 1
        }
      )
      if (res.data) {
        receiptTime.value = res.data.open_session_time
      }
    }

    // 消息历史记录
    async function getChatMessageHistory(payload: {
      list_id: string
      time: number
      is_up: 1 | 0
    }) {
      const { err, data } = await chatRequest<{
        list: IMessageWrapper[]
      }>('im/get/chatData', payload)
      if (!err && data.list.length) {
        data.list = data.list.map(item => processMessage(item))
      }
      return { err, data }
    }

    // 发送消息
    async function sendMessage(payload: ISocketMessage) {
      return await chatRequest('im/message/textMsg', {
        list_id: payload.list_id || activeConversationId.value,
        content_type: payload.content_type,
        content: JSON.stringify(payload.content)
      })
    }

    // 发送名片
    async function sendCard(payload: { users: number[]; list_id?: string }) {
      return await chatRequest('im/message/sendCard', {
        list_id: payload.list_id || activeConversationId.value,
        users: JSON.stringify(payload.users)
      })
    }

    // 撤回消息
    async function withdrawMessage(msg_id: number) {
      return await chatRequest('im/message/withdraw', {
        msg_id,
        type: currentChatInfo.value.type,
        list_id: activeConversationId.value
      })
    }

    // 上传文件
    async function uploadChatFile(file: Blob) {
      const form = new FormData()
      form.append('list_id', activeConversationId.value!)
      form.append('file', file)
      form.append('_token', chatToken.value)
      return request<uploadResult>('/im/upload/uploadImg', form, 'POST', {
        baseURL: chatServiceHTTP.value,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
    }

    // 创建群聊
    async function createGroupChart(payload: {
      users: number[]
      name: string
    }) {
      return await chatRequest('im/message/addGroup', {
        users: JSON.stringify(payload.users),
        name: payload.name,
        _agent_id: 1,
        list_id: '0'
      })
    }

    // 添加群成员
    async function addMemberToGroupChart(payload: { users: number[] }) {
      return await chatRequest('im/message/addChat', {
        users: JSON.stringify(payload.users),
        list_id: activeConversationId.value,
        _agent_id: 1
      })
    }

    // 踢出群成员
    async function removeMemberFromGroup(payload: { users: number[] }) {
      return await chatRequest('im/message/removeChat', {
        users: JSON.stringify(payload.users),
        list_id: activeConversationId.value,
        _agent_id: 1
      })
    }

    // 更新群头像
    async function updateGroupAvatar(payload: { path: string }) {
      return await chatRequest('im/message/setGroupData', {
        list_id: activeConversationId.value,
        path: payload.path,
        type: 'avatar'
      })
    }

    // 设置群基础信息
    async function setGroupData(payload: {
      content: string
      type: 'name' | 'notice' | 'avatar'
    }) {
      return await chatRequest('im/message/setGroupData', {
        list_id: activeConversationId.value,
        ...payload
      })
    }

    // 设置用户在群的昵称
    async function setGroupNickName(payload: { nickname: string }) {
      return await chatRequest('im/vendor/saveGroupNickName', {
        list_id: activeConversationId.value,
        ...payload
      })
    }

    // 需要审核入群
    async function setGroupEntryApproval(payload: { value: string }) {
      return await chatRequest('im/message/needCheckChange', {
        list_id: activeConversationId.value,
        ...payload
      })
    }

    // 共同的群聊
    async function getCommonGroupList(payload: { user_id: number }) {
      return await chatRequest('im/get/getCommonGroupList', {
        ...payload
      })
    }

    // 同意入群
    async function approveGroupJoinRequest(payload: { id: string }) {
      return await chatRequest('im/message/addGroupAllow', {
        list_id: activeConversationId.value,
        ...payload
      })
    }

    // 拒绝入群
    async function rejectGroupJoinRequest(payload: { id: string }) {
      return await chatRequest('im/message/addGroupRefuse', {
        list_id: activeConversationId.value,
        ...payload
      })
    }

    // 获取备注
    async function getRemark(payload: { user_id: number }) {
      return await chatRequest('im/friend/getRemarks', {
        list_id: activeConversationId.value,
        ...payload
      })
    }

    // 设置备注
    async function setRemark(payload: { user_id: number }) {
      return await chatRequest('im/friend/setRemarks', {
        list_id: activeConversationId.value,
        ...payload
      })
    }

    // 置顶对话
    async function topChat(payload: { value: number; list_id?: string }) {
      return await chatRequest('im/message/chatTop', {
        list_id: payload.list_id || activeConversationId.value,
        ...payload
      })
    }

    // 设置免打扰
    async function setDoNotDisturb(payload: { value: number }) {
      return await chatRequest('im/message/msgDisturb', {
        list_id: activeConversationId.value,
        ...payload
      })
    }

    // 离开群聊
    async function leaveGroupChat() {
      return await chatRequest('im/message/liveGroup', {
        list_id: activeConversationId.value
      })
    }

    // 删除群聊
    async function deleteGroupChat() {
      return await chatRequest('im/message/removeGroup', {
        list_id: activeConversationId.value
      })
    }

    // 全员禁言
    async function muteAllMembers(payload: { value: number }) {
      return await chatRequest('im/message/groupIsMsg', {
        list_id: activeConversationId.value,
        value: payload.value
      })
    }

    // 允许群头像和群名字可编辑
    async function allowGroupAvatarAndNameEdit(payload: { value: number }) {
      return await chatRequest('im/vendor/editChange', {
        list_id: activeConversationId.value,
        value: payload.value
      })
    }

    // 群内禁止好友
    async function toggleGroupFriendAddition(payload: { value: number }) {
      return await chatRequest('im/message/speekChecked', {
        list_id: activeConversationId.value,
        value: payload.value
      })
    }

    async function refreshMutedUserList() {
      const { err, data, msg } = await chatRequest<{ user_ids: number[] }>(
        'im/message/getGroupAdmin',
        {
          list_id: activeConversationId.value,
          type: 2,
          _agent_id: 1
        }
      )
      if (err || !data) {
        return
      }
      const _mutedUserList = data.user_ids.map(item => Number(item))
      mutedUserList.value = _mutedUserList
      return _mutedUserList
    }

    // 群内禁止好友
    async function muteUser(payload: { is_msg: 1 | 0; users: number[] }) {
      return await chatRequest<{ user_ids: number[] }>(
        'im/message/setGroupAdmin',
        {
          list_id: activeConversationId.value,
          type: 2,
          is_msg: payload.is_msg,
          users: JSON.stringify(payload.users)
        }
      )
    }

    // 搜索用户
    async function searchUsers(payload: {
      val: string
    }): Promise<{ err: number; data: IFriend[] }> {
      const { err, data } = await chatRequest<{ err: number; data: any[] }>(
        'im/get/searchUser',
        payload
      )
      if (!err && data.data.length) {
        data.data = data.data.map(item => {
          item.name = item.nickname
          item.user_id = item.id
          item.avatar = `${ossURL}${item.avatar}`
          return item
        })
      }
      return { err, data: data.data }
    }

    // 获取用户信息
    async function getUserinfoById(payload: { user_id: number }) {
      return await chatRequest<IContactInfo>('im/get/details', payload)
    }

    // 获取好友请求
    async function refreshFriendRequestList() {
      let { err, data } = await chatRequest<IFriendRequest[]>(
        'im/get/applyFriend'
      )
      if (!err && data.length) {
        data = data.map(item => {
          item.avatar = `${ossURL}${item.avatar}`
          return item
        })
      }
      friendRequestList.value = data
      return { err, data }
    }

    async function refreshGroupJoinRequests() {
      let { err, data } = await chatRequest<IGroupJoinRequest[]>(
        'im/get/applyGroup'
      )
      if (!err && data.length) {
        data = data.map(item => {
          item.avatar = `${ossURL}${item.avatar}`
          return item
        })
      }
      groupJoinRequestList.value = data
      return { err, data }
    }

    // 删除好友请求
    async function deleteFriendRequest(payload: { id: string }) {
      return await chatRequest<IFriendRequest[]>(
        'im/friend/removeApply',
        payload
      )
    }

    // 添加好友
    async function addFriend(payload: { content: string; user_id: number }) {
      return await chatRequest('im/action/friendAdd', {
        is_type: 0,
        ...payload
      })
    }

    // 添加好友不需要验证
    async function addFriendNoValidate(payload: { apply_id: string }) {
      return await chatRequest('im/action/friendAddNoValidateAction', payload)
    }

    // 接受好友请求
    async function acceptFriend(payload: { apply_id: string }) {
      return await chatRequest('im/action/friendAddAction', payload)
    }

    // 删除好友
    async function deleteFriend(payload: { user_id: number }) {
      return await chatRequest('im/remove/friend', payload)
    }

    function processMessage(message: IMessageWrapper) {
      const messageType = (message.msg.messageType =
        messageTypeMap[message.msg.type])
      if (
        messageType === 'image' ||
        messageType === 'video' ||
        messageType === 'voice'
      ) {
        message.msg.content.fullURL = ossURL + message.msg.content.url
      }
      if (messageType === 'nameCard') {
        message.msg.content.avatar = ossURL + message.msg.content.avatar
      }
      message.msg.self = chatUserinfo.value.id === message.msg.user_info.uid
      message.msg.user_info.avatar = `${ossURL}${message.msg.user_info.avatar}`
      return message
    }

    return {
      codeError,
      chatToken,
      chatServiceHTTP,
      chatServiceWS,
      chatUserinfo,
      currentChatInfo,
      isGroupOwner,
      isMuted,
      mutedUserList,
      refreshChat,
      chatList,
      currentChat,
      contactGroups,
      contactList,
      imageEmojiList,
      getListId,
      archivedConversations,
      archivedConversationIds,
      activeConversationId,
      conversationOpen,
      status,
      delayLoading,
      activeSidebarComponent,
      newGroupTipsNum,
      newFriendTipsNum,
      unreadMsgCount,
      receiptTime,
      chatRequest,
      sendMessage,
      sendCard,
      newMessageWrapper,
      replaceMessage,
      getChatMessageHistory,
      uploadChatFile,
      refreshReadReceipt,
      refreshChatInfo,
      getChatInfo,
      withdrawMessage,
      searchUsers,
      createGroupChart,
      addMemberToGroupChart,
      removeMemberFromGroup,
      updateGroupAvatar,
      setGroupData,
      setGroupNickName,
      topChat,
      setDoNotDisturb,
      leaveGroupChat,
      deleteGroupChat,
      muteAllMembers,
      allowGroupAvatarAndNameEdit,
      toggleGroupFriendAddition,
      refreshMutedUserList,
      muteUser,
      getUserinfoById,
      refreshFriendRequestList,
      friendRequestList,
      groupJoinRequestList,
      acceptFriend,
      addFriend,
      addFriendNoValidate,
      deleteFriend,
      deleteConversation,
      refreshChatList,
      refreshUserGroupStatus,
      processMessage,
      refreshFriendList,
      refreshChatUserinfo,
      updateChatUserinfo,
      reset,
      refreshGroupJoinRequests,
      deleteFriendRequest,
      approveGroupJoinRequest,
      rejectGroupJoinRequest
    }
  },
  {
    persist: {
      paths: [
        'activeConversationId',
        'archivedConversationIds',
        'conversationOpen',
        'activeSidebarComponent'
      ]
    }
  }
)

export default useChatStore
