<script setup lang="ts">
import { IMessageV2 } from '@src/typeV2'
import Swal from 'sweetalert2'
import useChatStore from '@src/store/chat'

const props = defineProps<{
  message: IMessageV2
}>()

const chatStore = useChatStore()
async function handleAdd() {
  try {
    const { value: text, isConfirmed } = await Swal.fire({
      title: '好友验证消息',
      input: "textarea",
      icon: 'question',
      inputLabel: "验证消息",
      inputPlaceholder: "请输入好友验证消息...",
      inputAttributes: {
        "aria-label": "Type your message here"
      },
      showCancelButton: true
    })
    if (!isConfirmed) return
    const { err, data, msg } = await chatStore.addFriend({
      user_id: props.message.content.user_id,
      content: text
    })
    if (err) {
      Swal.fire({ title: '系统提示', text: msg, timer: 1500, icon: 'error' }).then()
      return
    }
    Swal.fire({
      title: '系统提示',
      text: msg,
      icon: 'success'
    }).then(res => {})
    chatStore.refreshFriendList().then()
    chatStore.refreshChatList().then()
  } catch (err) {

  }
}
</script>

<template>
  <!-- This is an example component -->
  <div class="max-w-2xl mx-auto">
    <div
      class="max-w-sm bg-white rounded-lg border border-gray-200 shadow-md dark:bg-gray-800 dark:border-gray-700 p-5"
    >
      <div class="flex flex-col items-center">
        <img
          class="mb-3 w-24 h-24 rounded-full shadow-lg"
          :src="message.content.avatar"
          :alt="message.content.nickname"
        />
        <h3 class="mb-1 text-xl font-medium text-gray-900 dark:text-white">
          {{ message.content.nickname}}
        </h3>
        <div class="flex mt-1 space-x-3 lg:mt-2">
          <button
            class="inline-flex items-center py-2 px-4 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            @click="handleAdd">加为好友</button
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
