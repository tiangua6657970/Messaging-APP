<script setup lang="ts">
import { computed, ref, watch } from 'vue'

import AccordionButton from '@src/components/ui/data-display/AccordionButton.vue'
import Typography from '@src/components/ui/data-display/Typography.vue'
import Collapse from '@src/components/ui/utils/Collapse.vue'
import TextInput from '@src/components/ui/inputs/TextInput.vue'
import DropFileUpload from '@src/components/ui/inputs/DropFileUpload.vue'
import Button from '@src/components/ui/inputs/Button.vue'
import useChatStore from '@src/store/chat'
import Swal from 'sweetalert2'

const props = defineProps<{
  collapsed: boolean
  handleToggle: () => void
}>()

const chatStore = useChatStore()
const chatUserinfo = computed(() => chatStore.chatUserinfo)

const form = ref({
  nickname: chatUserinfo.value.nickname,
  avatar: chatUserinfo.value.avatar
})

watch(chatUserinfo, newVal => {
  form.value.nickname = newVal.nickname
  form.value.avatar = newVal.avatar
})

const previewAvatar = ref('')
let avatarFile: File

const loading = ref(false)

async function handleFileChange(file: File) {
  avatarFile = file
  previewAvatar.value = URL.createObjectURL(file)
  return
}

// TODO: 更新用户信息
async function handleSubmit() {
  loading.value = true
  const { nickname, avatar } = form.value
  const promises = []
  if (nickname !== chatUserinfo.value.nickname) {
    promises.push(chatStore.updateChatUserinfo({ type: 0, content: nickname }))
  }
  if (avatarFile) {
    const { err, data, msg } = await chatStore.uploadChatFile(avatarFile)
    if (err) {
      loading.value = false
      Swal.fire({
        title: '系统提示',
        text: msg,
        icon: 'error',
        timer: 1500
      }).then(res => {})
      return
    }
    promises.push(
      await chatStore.updateChatUserinfo({ type: 3, content: data.path })
    )
  }
  if (!promises.length) {
    Swal.fire({
      title: '系统提示',
      text: '您没有修改任何信息',
      icon: 'info',
      timer: 1500
    }).then(res => {})
    loading.value = false
    return
  }
  Promise.all(promises).then(() => {
    loading.value = false
    Swal.fire({
      title: '系统提示',
      text: '修改成功！',
      icon: 'success',
      timer: 1500
    }).then(res => {})
    chatStore.refreshChatUserinfo()
  })
}
</script>

<template>
  <!--account settings-->
  <AccordionButton
    id="account-settings-toggler"
    class="w-full flex px-5 py-6 mb-3 rounded focus:outline-none"
    :collapsed="props.collapsed"
    chevron
    aria-controls="account-settings-collapse"
    @click="handleToggle()"
  >
    <Typography variant="heading-2" class="mb-4"> 账号</Typography>
    <Typography variant="body-2">更新您的用户信息</Typography>
  </AccordionButton>

  <Collapse id="account-settings-collapse" :collapsed="props.collapsed">
    <TextInput
      label="昵称"
      class="mb-7"
      :value="form.nickname"
      @value-changed="value => (form.nickname = value)"
    />
    <DropFileUpload
      label="头像"
      class="mb-7"
      accept="image/*"
      :image-url="previewAvatar || form.avatar"
      @value-changed="handleFileChange"
    />
    <Button class="w-full py-4" @click="handleSubmit" :loading="loading">
      Save Settings
    </Button>
  </Collapse>
</template>
