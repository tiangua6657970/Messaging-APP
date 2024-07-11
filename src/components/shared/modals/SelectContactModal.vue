<script setup lang="ts">
import Modal from '@src/components/ui/utils/Modal.vue'
import Typography from '@src/components/ui/data-display/Typography.vue'
import Button from '@src/components/ui/inputs/Button.vue'
import SearchInput from '@src/components/ui/inputs/SearchInput.vue'
import Checkbox from '@src/components/ui/inputs/Checkbox.vue'
import ScrollBox from '@src/components/ui/utils/ScrollBox.vue'
import { computed, ref, watch } from 'vue'
import useChatStore from '@src/store/chat'
import { IFriend } from '@src/typeV2'
import ContactItemV2 from '@src/components/shared/blocks/ContactItemV2.vue'
import useActionStore from '@src/store/action'

const props = defineProps<{
  open: boolean
  closeModal: () => void,
  handleFinish?: (selectedContactId: number[]) => void
}>()
const chatStore = useChatStore()
const actionStore = useActionStore()
const contactList = computed(() => {
  return chatStore.contactGroups.flatMap(item => item.data)
})
const selectedContactId = ref<number[]>([])
const tempContactList = computed(() => {
  return chatStore.contactGroups
    .flatMap(item => item.data)
    .filter(contact => {
      return !chatStore.currentChatInfo.member.some(
        member => member.user_id === contact.user_id
      )
    })
})

const isContactSelected = (contact: IFriend) => {
  return selectedContactId.value.includes(contact.user_id)
}
const muteContactList = computed(() => {
  return chatStore.currentChatInfo.member
})

const titleMap = {
  mute: '禁言管理'
}
const title = computed(() => {
  return titleMap[actionStore.selectContactModalActionType]
})

function handleSelectedContactsChange(contact: IFriend) {
  if (selectedContactId.value.includes(contact.user_id)) {
    selectedContactId.value.splice(
      selectedContactId.value.indexOf(contact.user_id),
      1
    )
  } else {
    selectedContactId.value.push(contact.user_id)
  }
}

watch(() => props.open, newVal => {
  if (newVal) {
    if (actionStore.selectContactModalActionType === 'mute') {
      selectedContactId.value = chatStore.mutedUserList.slice()
    }
  } else {
    selectedContactId.value = []
  }
})

function _handleFinish() {
  if (actionStore.selectContactModalActionType === 'mute') {
    props.handleFinish && props.handleFinish(selectedContactId.value)
  }
}
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template v-slot:content>
      <div class="w-[300px] bg-white dark:bg-gray-800 rounded pt-6">
        <!--header-->
        <div class="flex justify-between items-center mb-6 px-5">
          <Typography
            id="modal-title"
            variant="heading-1"
            ref="modalTitle"
            class="default-outline"
            tabindex="0"
          >
            {{ title }}
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
        <!--search-->
        <div class="mx-5 mt-3 mb-5">
          <SearchInput />
        </div>
        <!--contacts-->
        <ScrollBox class="overflow-y-scroll max-h-[200px] mb-5">
          <ContactItemV2
            v-for="(contact, index) in muteContactList"
            :contact="contact"
            @click="handleSelectedContactsChange(contact)"
            :active="isContactSelected(contact)"
            :key="index"
          >
            <template v-slot:checkbox>
              <Checkbox :value="isContactSelected(contact)" />
            </template>
          </ContactItemV2>
        </ScrollBox>
        <div class="flex px-5 mt-5 pb-6">
          <div class="grow"></div>
          <!--next button-->
          <Button
            class="px-5 bg-indigo-400 hover:bg-indigo-500 active:bg-indigo-500"
            @click="_handleFinish"
          >
            确定
          </Button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped></style>
