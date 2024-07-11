<script setup lang="ts">
import Modal from '@src/components/ui/utils/Modal.vue'
import Typography from '@src/components/ui/data-display/Typography.vue'
import Button from '@src/components/ui/inputs/Button.vue'
import SearchInput from '@src/components/ui/inputs/SearchInput.vue'
import Checkbox from '@src/components/ui/inputs/Checkbox.vue'
import ScrollBox from '@src/components/ui/utils/ScrollBox.vue'
import { computed, Ref, ref, watch } from 'vue'
import useChatStore from '@src/store/chat'
import { IFriend } from '@src/typeV2'
import Swal from 'sweetalert2'
import ContactItemV2 from '@src/components/shared/blocks/ContactItemV2.vue'
import { debounceV2 } from '@src/assets/utils'

const props = defineProps<{
  open: boolean
  closeModal: () => void
}>()
const chatStore = useChatStore()
const searchText: Ref<string> = ref('')
const searchResult = ref<IFriend[]>([])

const member = computed(() => chatStore.currentChatInfo.member)
const selectedContactId = ref<number[]>([])

const renderList = computed(() =>
  searchResult.value.length ? searchResult.value : member.value
)

const isContactSelected = (contact: IFriend) => {
  return selectedContactId.value.includes(contact.user_id)
}

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
// TODO: removeMemberFromGroup
async function handleFinish() {
  const { err, data, msg } = await chatStore.removeMemberFromGroup({
    users: selectedContactId.value
  })
  Swal.fire({
    title: '系统提示',
    text: msg,
    timer: 1500,
    icon: err ? 'error' : 'success'
  }).then()
  if (err) {
    return
  }
  selectedContactId.value = []
  await chatStore.refreshChatInfo()
}

const debouncedFunction = debounceV2(() => {
  const searchTextVal = searchText.value
  if (!searchTextVal) {
    searchResult.value = []
    return
  }
  searchResult.value = member.value.filter(item => {
    return (
      item.name.toLowerCase().includes(searchTextVal.toLowerCase()) ||
      item.user_id === Number(searchTextVal)
    )
  })
}, 300)

watch(searchText, () => {
  debouncedFunction()
})

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
            踢出成员
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
          <SearchInput v-model="searchText"/>
        </div>
        <!--contacts-->
        <ScrollBox class="overflow-y-scroll max-h-[200px] mb-5">
          <template
            v-for="(contact, index) in renderList"
            :key="index"
          >
            <ContactItemV2
              :contact="contact"
              @click="handleSelectedContactsChange(contact)"
              :active="isContactSelected(contact)"
              v-if="contact.user_id !== chatStore.currentChatInfo.group.main_id"
            >
              <template v-slot:checkbox>
                <Checkbox :value="isContactSelected(contact)" />
              </template>
            </ContactItemV2>
          </template>
        </ScrollBox>
        <div class="flex px-5 mt-5 pb-6">
          <div class="grow"></div>
          <!--next button-->
          <Button
            class="px-5 bg-indigo-400 hover:bg-indigo-500 active:bg-indigo-500"
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
