<script setup lang="ts">
import Typography from '@src/components/ui/data-display/Typography.vue'
import ScrollBox from '@src/components/ui/utils/ScrollBox.vue'
import Modal from '@src/components/ui/utils/Modal.vue'
import Button from '@src/components/ui/inputs/Button.vue'
import useChatStore from '@src/store/chat'
import { computed, ref } from 'vue'
import Checkbox from '@src/components/ui/inputs/Checkbox.vue'
import { IChat, IFriend } from '@src/typeV2'
import useActionStore from '@src/store/action'
import Swal from 'sweetalert2'
import { messageTypeReverseMap } from '@src/assets/utils'

interface Props {
  open: boolean
  closeModal: () => void
}

const active = ref(false)

const props = withDefaults(defineProps<Props>(), {})

const chatStore = useChatStore()
const actionStore = useActionStore()
const chatList = computed(() => chatStore.chatList)

const filteredContactList = ref<IFriend[]>([])

const selectedConversationId = ref<string[]>([])

const isContactSelected = (conversation: IChat) => {
  return selectedConversationId.value.includes(conversation.list_id)
}

function handleSelectedContactsChange(conversation: IChat) {
  if (selectedConversationId.value.includes(conversation.list_id)) {
    selectedConversationId.value.splice(
      selectedConversationId.value.indexOf(conversation.list_id),
      1
    )
  } else {
    selectedConversationId.value.push(conversation.list_id)
  }
}

function handleFinish() {
  if (actionStore.forwardType === 'message') {
    processShare()
  } else {
    selectedConversationId.value.forEach(item => {
      chatStore.sendCard({ list_id: item, users: [actionStore.forwardContent]})
    })
    Swal.fire({
      title: `已转发给${selectedConversationId.value.length}个会话!`,
      icon: 'success',
      timer: 1500
    }).then()
    props.closeModal()
    selectedConversationId.value = []
  }
}

async function processShare() {
  const promises: any = []
  const activeMessageItem = actionStore.activeMessageItem!
  switch (activeMessageItem.messageType) {
    case 'text':
      selectedConversationId.value.forEach(item => {
        const p = chatStore.sendMessage({
          content_type: messageTypeReverseMap[activeMessageItem.messageType],
          list_id: item,
          content: { text: activeMessageItem.content.text }
        })
        promises.push(p)
      })
      break
    case 'image':
      selectedConversationId.value.forEach(item => {
        const p = chatStore.sendMessage({
          content_type: messageTypeReverseMap[activeMessageItem.messageType],
          list_id: item,
          content: activeMessageItem.content
        })
        promises.push(p)
      })
      break
    case 'voice':
      selectedConversationId.value.forEach(item => {
        const p = chatStore.sendMessage({
          content_type: messageTypeReverseMap[activeMessageItem.messageType],
          list_id: item,
          content: activeMessageItem.content
        })
        promises.push(p)
      })
      break
    case 'video':
      selectedConversationId.value.forEach(item => {
        const p = chatStore.sendMessage({
          content_type: messageTypeReverseMap[activeMessageItem.messageType],
          list_id: item,
          content: activeMessageItem.content
        })
        promises.push(p)
      })
      break
    case 'nameCard':
      selectedConversationId.value.forEach(item => {
        const p = chatStore.sendCard({
          list_id: item,
          users: [activeMessageItem.content.user_id]
        })
        promises.push(p)
      })
  }
  // TODO: promises
  Promise.all(promises).then(res => {
    console.log('res', res)
  })
  Swal.fire({
    title: `已转发给${selectedConversationId.value.length}个会话!`,
    icon: 'success',
    timer: 1500
  }).then()
  props.closeModal()
  selectedConversationId.value = []
}
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template v-slot:content>
      <div class="w-[300px] py-6 bg-white dark:bg-gray-800 rounded">
        <!--header-->
        <div class="mb-6 px-5 flex justify-between items-center">
          <Typography id="modal-title" variant="heading-1" tabindex="0">
            选择会话
          </Typography>

          <Button
            @click="props.closeModal"
            variant="outlined"
            color="danger"
            typography="body-4"
          >
            esc
          </Button>
        </div>
        <!--message-->
        <ScrollBox class="max-h-[230px] overflow-y-scroll">
          <div class="contact-list">
            <div
              class="w-full p-5 flex transition duration-200 ease-out outline-none"
              :class="{
                'hover:bg-indigo-50 active:bg-indigo-100 focus:bg-indigo-50 dark:hover:bg-gray-600 dark:focus:bg-gray-600': true,
                'bg-indigo-50 dark:bg-gray-600': isContactSelected(chat)
              }"
              @click="handleSelectedContactsChange(chat)"
              v-for="chat in chatList"
              :key="chat.list_id"
            >
              <!-- avatar -->
              <div class="mr-4">
                <div
                  :style="{ backgroundImage: `url(${chat.avatar})` }"
                  class="w-7 h-7 rounded-full bg-cover bg-center"
                ></div>
              </div>
              <div class="w-full flex justify-between items-center">
                <!--chat name-->
                <div class="flex items-center">
                  <Typography variant="heading-2">
                    {{ chat.show_name }}
                  </Typography>
                  <slot name="tag"></slot>
                </div>
                <!--optional menu-->
                <div class="relative">
                  <slot name="menu" />
                </div>
              </div>
              <div class="h-full flex flex-col justify-center items-center">
                <slot name="checkbox">
                  <Checkbox :value="isContactSelected(chat)" />
                </slot>
              </div>
            </div>
          </div>
        </ScrollBox>
        <div class="px-5 mt-5">
          <Button
            class="w-full px-5 bg-indigo-400 hover:bg-indigo-500 active:bg-indigo-500"
            :disabled="!selectedConversationId.length"
            @click="handleFinish"
          >
            确定
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped></style>
