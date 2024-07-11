<script setup lang="ts">
import { computed, ref } from 'vue'

import { TrashIcon } from '@heroicons/vue/24/outline'
import InfoItem from '@src/components/shared/blocks/InfoItem.vue'
import ImageViewer from '@src/components/shared/modals/ConversationInfoModal/ImageViewer.vue'
import Typography from '@src/components/ui/data-display/Typography.vue'
import Button from '@src/components/ui/inputs/Button.vue'
import useActionStore from '@src/store/action'
import useChatStore from '@src/store/chat'
import Swal from 'sweetalert2'
import type { IFriend } from '@src/typeV2'

const props = defineProps<{
  closeModal: () => void
}>()
const chatStore = useChatStore()
const actionStore = useActionStore()
const viewConcatInfo = computed(() => actionStore.viewConcatInfo!)
const chatUserinfo = computed(()  => chatStore.chatUserinfo)

const openImageViewer = ref(false)

// TODO: handleDelete
function handleDelete() {
  actionStore.viewConcatInfoOpen = false
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
        user_id: viewConcatInfo.value.user_id
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
    }
  })
}

// TODO: handleAdd
async function handleAdd() {
  actionStore.viewConcatInfoOpen = false
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
     user_id: viewConcatInfo.value.user_id,
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

function handleSendCard() {
  actionStore.forwardModalOpen = true
  actionStore.forwardType = 'card'
  actionStore.forwardContent = viewConcatInfo.value.user_id
  props.closeModal()
}

async function handleSelect() {
  const { err, data } = await chatStore.getListId({ user_id: viewConcatInfo.value.user_id })
  if (err) {
    return
  }
  chatStore.activeConversationId = data.list_id
  chatStore.conversationOpen = 'open'
}
</script>

<template>
  <div v-if="viewConcatInfo">
    <div class="mb-6 px-5 flex justify-between items-center">
      <!--title-->
      <Typography
        variant="heading-1"
        id="modal-title"
        class="default-outline"
        tabindex="0"
      >
        <span>用户信息</span>
      </Typography>

      <!--close button-->
      <Button
        @click="props.closeModal"
        variant="outlined"
        color="danger"
        typography="body-4"
      >
        esc
      </Button>
    </div>

    <!--top-->
    <div class="w-full p-5 pb-6">
      <div class="flex">
        <!--avatar-->
        <div class="mr-5">
          <button
            @click="openImageViewer = true"
            class="outline-none"
            aria-label="view avatar"
          >
            <div
              :style="{ backgroundImage: `url(${viewConcatInfo.avatar})` }"
              class="w-[38px] h-[38px] rounded-full bg-cover bg-center"
            ></div>
          </button>
        </div>

        <!--name-->
        <div class="w-full flex justify-between">
          <div>
            <Typography variant="heading-2" class="mb-3 mr-5 text-start">
              <span>
                {{ viewConcatInfo.nickname || viewConcatInfo.username }}
              </span>
            </Typography>

            <Typography variant="body-2" class="font-extralight text-start">
              <!--last seen-->
              <span>ChatID {{ viewConcatInfo.unique_code }} </span>
            </Typography>
          </div>
        </div>
      </div>
    </div>

    <!--middle-->
    <div class="w-full py-5 border-t border-gray-100 dark:border-gray-700">
      <!--(contact) email-->
      <div class="flex px-5 pb-5 items-center">
        <Typography class="mr-2" variant="body-2"> 共同的群聊：</Typography>
        <Typography variant="body-5">
          {{ viewConcatInfo.common_group_number }}个
        </Typography>
      </div>
      <div class="flex px-5 pb-5 items-center">
        <Typography class="mr-2" variant="body-2"> 添加的方式：</Typography>
        <Typography variant="body-5">
          {{ viewConcatInfo.from }}
        </Typography>
      </div>
    </div>

    <!--bottom-->
    <div class="w-full border-t border-gray-100 dark:border-gray-700">
      <!--delete contact-->
      <div class="px-5 pt-5 group">
        <template v-if="viewConcatInfo.is_friend">
          <template v-if="chatUserinfo.id !== viewConcatInfo.user_id">
            <Button class="w-full" color="danger" @click="handleDelete">删除好友</Button>
            <Button class="w-full mt-5" @click="handleSelect">打开对话</Button>
          </template>
          <Button class="w-full mt-5" @click="handleSendCard">转发名片</Button>
        </template>
        <template v-else-if="chatUserinfo.id !== viewConcatInfo.user_id">
          <Button class="w-full" @click="handleAdd" >加为好友</Button>
        </template>
      </div>
    </div>

    <!--image viewer-->
    <ImageViewer
      :image-url="viewConcatInfo.avatar"
      :open="openImageViewer"
      :close-image="() => (openImageViewer = false)"
    />
  </div>
</template>
