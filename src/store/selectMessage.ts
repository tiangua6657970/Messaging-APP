import { defineStore } from 'pinia'
import { Ref, ref } from 'vue'
import { IMessageV2 } from '@src/typeV2'

const useSelectMessageStore = defineStore('selectMessageStore', () => {
  const selectMode = ref(false)
  const selectedMessages: Ref<IMessageV2[]> = ref([])

  function handleSelectMessage(message: IMessageV2) {
    selectedMessages.value.push(message)
    if (!selectMode.value) {
      selectMode.value = true
    }
  }

  function handleDeselectMessage(message: IMessageV2) {
    selectedMessages.value = selectedMessages.value.filter(
      item => item.id !== message.id
    )

    if (selectedMessages.value.length === 0) {
      selectMode.value = false
    }
  }

  function handleCloseSelect() {
    selectMode.value = false
    selectedMessages.value = []
  }

  function isSelected(message: IMessageV2) {
    for (const selectedMessage of selectedMessages.value) {
      if (selectedMessage.id === message.id) {
        return true
      }
    }
    return false
  }

  return {
    selectMode,
    selectedMessages,
    isSelected,
    handleSelectMessage,
    handleDeselectMessage,
    handleCloseSelect
  }
})

export default useSelectMessageStore
