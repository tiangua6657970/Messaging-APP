<script setup lang="ts">
import Typography from '@src/components/ui/data-display/Typography.vue'
import Button from '@src/components/ui/inputs/Button.vue'
import TextInput from '@src/components/ui/inputs/TextInput.vue'
import Modal from '@src/components/ui/utils/Modal.vue'
import { ref, watch } from 'vue'
import { debounce } from '@src/assets/utils'
import useChatStore from '@src/store/chat'
import ContactItem from '@src/components/shared/blocks/ContactItem.vue'
import { IFriend } from '@src/typeV2'
import Textarea from '@src/components/ui/inputs/Textarea.vue'
import Swal from 'sweetalert2'

const props = defineProps<{
  openModal: boolean
  closeModal: () => void
}>()

const chatStore = useChatStore()

const value = ref('')
const content = ref('')
const list = ref<IFriend[]>([])

watch(value, newVal => {
  debounce(async () => {
    if (!newVal) {
      list.value = []
      return
    }
    const res = await chatStore.searchUsers({ val: newVal })
    if (!res.err) {
      list.value = res.data
      console.log('res', res)
    }
  })
})

async function handleAdd() {
  const { err, data, msg } = await chatStore.addFriend({
    user_id: list.value[0].user_id,
    content: content.value
  })
  if (err) {
    Swal.fire({ title: '系统提示', text: msg, timer: 1500, icon: 'error' }).then()
    return
  }
  Swal.fire({
    title: '系统提示',
    text: msg,
    icon: 'success',
    timer: 1500
  }).then(res => {})
  props.closeModal()
  chatStore.refreshFriendList().then()
  chatStore.refreshChatList().then()
}
</script>

<template>
  <Modal :open="props.openModal" :closeModal="props.closeModal">
    <template v-slot:content>
      <div class="w-[300px] bg-white dark:bg-gray-800 rounded py-6">
        <!--modal header-->
        <div class="flex justify-between items-center px-5">
          <Typography
            id="modal-title"
            variant="heading-1"
            class="default-outline"
            tabindex="0"
          >
            添加好友
          </Typography>

          <Button
            variant="outlined"
            color="danger"
            @click="props.closeModal"
            typography="body-4"
          >
            esc
          </Button>
        </div>
        <!--text input-->
        <div class="px-5 pb-5 pt-6">
          <TextInput
            type="text"
            placeholder="用户名/chatID"
            :value="value"
            @value-changed="value = $event"
          />
        </div>

        <ContactItem
          v-for="(contact, index) in list"
          :contact="contact"
          :key="index"
        >
        </ContactItem>
        <div class="px-5 pb-5 pt-6">
          <Textarea
            class="scrollbar-hidden"
            placeholder="验证消息"
            :value="content"
            v-model="content"
            variant="bordered"
          />
        </div>
        <!--submit button-->
        <div class="px-5 mt-5">
          <Button class="w-full py-4" @click="handleAdd" :disabled="!list.length"> 添加</Button>
        </div>
        <template v-if="list.length">

        </template>
      </div>
    </template>
  </Modal>
</template>
