<script setup lang="ts">
import { computed, ref } from 'vue'

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
const currentChatInfo = computed(() => chatStore.currentChatInfo)

const values = ref({
  name: currentChatInfo.value.group.name,
  notice: currentChatInfo.value.group.notice,
  nickname: currentChatInfo.value.my_nickname,
  avatar: currentChatInfo.value.group.avatar
})

const previewAvatar = ref('')
let avatarFile: File

const loading = ref(false)

// (event) handle submitting the values of the form.
async function handleSubmit() {
  loading.value = true
  const { name, avatar, notice } = values.value
  const promises = []
  if (name !== currentChatInfo.value.group.name) {
    promises.push(chatStore.setGroupData({ type: 'name', content: name }))
  }
  if (notice !== currentChatInfo.value.group.notice) {
    promises.push(chatStore.setGroupData({ type: 'notice', content: notice }))
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
    promises.push(await chatStore.setGroupData({ type: 'avatar', content: data.path }))
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
    chatStore.refreshChatInfo()
  }).catch(reason => {
    loading.value = false
  })
}

async function handleFileChange(file: File) {
  avatarFile = file
  previewAvatar.value = URL.createObjectURL(file)
  return
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
    <Typography variant="heading-2" class="mb-4"> 基本信息</Typography>
    <Typography variant="body-2">群头像，群名称，公告</Typography>
  </AccordionButton>

  <Collapse id="account-settings-collapse" :collapsed="props.collapsed">
    <TextInput
      label="群名称"
      class="mb-7"
      :value="values.name"
      @value-changed="value => (values.name = value)"
    />
    <TextInput
      label="群公告"
      class="mb-7"
      :value="values.notice"
      @value-changed="value => (values.notice = value)"
    />
    <DropFileUpload
      label="Avatar"
      class="mb-7"
      accept="image/*"
      :image-url="previewAvatar || values.avatar"
      @value-changed="value => handleFileChange(value)"
    />
    <Button class="w-full py-4" @click="handleSubmit" :loading="loading">
      保存设置
    </Button>
  </Collapse>
</template>
