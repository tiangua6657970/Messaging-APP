<script setup lang="ts">
import ChatInfoBase from '@src/components/views/HomeView/Chat/ChatInfoSettings/ChatInfoBase.vue'
import { computed, ref, watch } from 'vue'
import ChatInfoPermission from '@src/components/views/HomeView/Chat/ChatInfoSettings/ChatInfoPermission.vue'
import SettingsSwitch from '@src/components/views/HomeView/Sidebar/Settings/SettingsAccordion/SettingsSwitch.vue'
import useChatStore from '@src/store/chat'
import TextInput from '@src/components/ui/inputs/TextInput.vue'
import Button from '@src/components/ui/inputs/Button.vue'
import Swal from 'sweetalert2'
import Typography from '@src/components/ui/data-display/Typography.vue'
import { ChevronRightIcon } from '@heroicons/vue/24/outline'
import useActionStore from '@src/store/action'

const chatStore = useChatStore()
const actionStore = useActionStore()
const currentChatInfo = computed(() => chatStore.currentChatInfo)
const isGroupOwner = computed(() => chatStore.isGroupOwner)

// Types
enum accordionItems {
  chatInfoSettings = 'chatInfoSettings',
  chatInfoPermission = 'chatInfoPermission'
}

const accordionState = ref({
  chatInfoSettings: true,
  chatInfoPermission: true
})

const currentNickname = ref(
  currentChatInfo.value.my_nickname || chatStore.chatUserinfo.nickname
)
const nickname = ref(currentNickname.value)

watch(currentChatInfo, () => {
  nickname.value = currentNickname.value =
    currentChatInfo.value.my_nickname || chatStore.chatUserinfo.nickname
})

function handleToggle(name: accordionItems) {
  for (let key of Object.keys(accordionState.value)) {
    if (key !== name) {
      accordionState.value[<accordionItems>key] = true
    }
  }
  accordionState.value[name] = !accordionState.value[name]
}

async function toggleTopChat(value: boolean) {
  await chatStore.topChat({ value: Number(value) })
  chatStore.refreshChatInfo().then()
}

async function toggleDoNotDisturb(value: boolean) {
  await chatStore.setDoNotDisturb({ value: Number(value) })
  await chatStore.refreshChatInfo()
}

function handleBlur() {
  if (!nickname.value) {
    nickname.value = currentNickname.value
  }
}

async function handleSubmit() {
  await chatStore.setGroupNickName({ nickname: nickname.value })
  await chatStore.refreshChatInfo()
}

async function toggleMuteAll(value: boolean) {
  await chatStore.muteAllMembers({ value: Number(value) })
  await chatStore.refreshChatInfo()
}

async function handleDeleteGroup() {
  Swal.fire({
    title: '系统提示',
    text: '确定解散群聊吗？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '是的，解散',
    cancelButtonText: '取消',
    keydownListenerCapture: true
  }).then(async result => {
    if (result.isConfirmed) {
      const { err, data } = await chatStore.deleteGroupChat()
      if (err) {
        return
      }
      Swal.fire({
        title: '群聊已解散!',
        icon: 'success',
        timer: 1500
      }).then()
      chatStore.activeConversationId = undefined
    }
  })
}

async function handleLeave() {
  Swal.fire({
    title: '系统提示',
    text: '确定离开群聊吗？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '是的，离开',
    cancelButtonText: '取消',
    keydownListenerCapture: true
  }).then(async result => {
    if (result.isConfirmed) {
      const { err, data } = await chatStore.leaveGroupChat()
      if (err) {
        return
      }
      Swal.fire({
        title: '已离开群聊!',
        icon: 'success',
        timer: 1500
      }).then()
      chatStore.activeConversationId = undefined
    }
  })
}

// TODO: handleDeleteContact
async function handleDeleteContact() {
  const contact = currentChatInfo.value.member.find(
    item => item.user_id !== chatStore.chatUserinfo.id
  )
  if (!contact) {
    return
  }
  Swal.fire({
    title: '系统提示',
    text: '确定删除这个好友吗？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '是的，删除',
    cancelButtonText: '取消',
    keydownListenerCapture: true
  }).then(async result => {
    if (result.isConfirmed) {
      const { err, data } = await chatStore.deleteFriend({
        user_id: contact.user_id
      })
      if (err) {
        return
      }
      Swal.fire({
        title: '好友已删除!',
        icon: 'success'
      }).then()
      chatStore.refreshFriendList().then()
      chatStore.refreshChatList().then()
      chatStore.activeConversationId = undefined
    }
  })
}
</script>

<template>
  <div
    role="list"
    aria-label="Settings Accordion Control Group Buttons"
    class="h-full"
  >
    <template v-if="currentChatInfo.type === 1">
      <ChatInfoBase
        :collapsed="accordionState.chatInfoSettings"
        :handle-toggle="() => handleToggle(accordionItems.chatInfoSettings)"
        v-if="currentChatInfo.is_action"
      />
      <template v-if="currentChatInfo.is_action && currentChatInfo.group.edit_photo">
        <ChatInfoPermission
          :collapsed="accordionState.chatInfoPermission"
          :handle-toggle="() => handleToggle(accordionItems.chatInfoPermission)"
        />
      </template>
    </template>
    <div class="px-5 py-6">
      <template v-if="currentChatInfo.type === 1 && currentChatInfo.is_action">
        <div
          class="flex justify-between items-center mb-7 cursor-pointer"
          @click="actionStore.handleMuteManagement"
        >
          <Typography class="text-indigo-400" noColor variant="body-2"
            >禁言管理
          </Typography>
          <ChevronRightIcon
            class="w-5 h-5 stoke-1 text-black opacity-70 dark:text-white dark:opacity-70 transition-all duration-300"
          />
        </div>
        <div
          class="flex justify-between items-center mb-7 cursor-pointer"
          @click="actionStore.handleAdminManagement"
          v-if="isGroupOwner"
        >
          <Typography class="text-indigo-400" noColor variant="body-2"
          >管理员管理
          </Typography>
          <ChevronRightIcon
            class="w-5 h-5 stoke-1 text-black opacity-70 dark:text-white dark:opacity-70 transition-all duration-300"
          />
        </div>
        <SettingsSwitch
          :handle-toggle-switch="toggleMuteAll"
          :value="currentChatInfo.group.is_msg === 1"
          class="mb-7"
          description="开启后仅群主和群管理员可以发言"
          title="全员禁言"
        />
      </template>
      <SettingsSwitch
        title="置顶聊天"
        description="置顶后会排在聊天列表顶部"
        class="mb-7"
        :value="currentChatInfo.top === 1"
        :handle-toggle-switch="toggleTopChat"
      />
      <SettingsSwitch
        title="消息免打扰"
        description=""
        :value="currentChatInfo.is_disturb === 1"
        :handle-toggle-switch="toggleDoNotDisturb"
        class="mb-7"
      />
      <template v-if="currentChatInfo.type === 1">
        <div class="flex items-center w-full">
          <div class="flex-1 mr-5">
            <TextInput
              class="flex-1 justify-between"
              label="我在本群的昵称"
              :value="nickname"
              @value-changed="value => (nickname = value)"
              @blur="handleBlur"
            />
          </div>
          <Button
            style="align-self: flex-end"
            v-if="nickname && nickname !== currentNickname"
            @click="handleSubmit"
          >
            保存设置
          </Button>
        </div>
        <Button
          color="danger"
          class="mt-10"
          @click="handleDeleteGroup"
          v-if="isGroupOwner"
          >解散该群
        </Button>
        <Button color="danger" class="mt-10" @click="handleLeave" v-else
          >离开该群
        </Button>
      </template>
      <template v-else>
        <div class="flex items-center w-full">
          <Button color="danger" class="mt-10" @click="handleDeleteContact"
            >删除好友
          </Button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped></style>
