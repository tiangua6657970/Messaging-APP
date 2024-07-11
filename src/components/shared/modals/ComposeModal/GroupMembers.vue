<script lang="ts" setup>
import { ref } from 'vue'

import Loading1 from '@src/components/states/loading-states/Loading1.vue'
import SearchInput from '@src/components/ui/inputs/SearchInput.vue'
import Button from '@src/components/ui/inputs/Button.vue'
import Typography from '@src/components/ui/data-display/Typography.vue'
import Checkbox from '@src/components/ui/inputs/Checkbox.vue'
import ScrollBox from '@src/components/ui/utils/ScrollBox.vue'
import useChatStore from '@src/store/chat'
import useComposeStore from '@src/store/compose'
import { IFriend } from '@src/typeV2'
import ContactItemV2 from '@src/components/shared/blocks/ContactItemV2.vue'
import useSearchContacts from '@src/assets/useSearchContacts'

const chatStore = useChatStore()
const composeStore = useComposeStore()
const { searchText, filteredContactList } = useSearchContacts()

const selectedContactIds = ref<number[]>([])

const isContactSelected = (contact: IFriend) => {
  return selectedContactIds.value.includes(contact.user_id)
}

function handleSelectedContactsChange(contact: IFriend) {
  if (selectedContactIds.value.includes(contact.user_id)) {
    selectedContactIds.value.splice(
      selectedContactIds.value.indexOf(contact.user_id),
      1
    )
  } else {
    selectedContactIds.value.push(contact.user_id)
  }
}

async function handleCreate() {
  const { err } = await chatStore.createGroupChart({
    name: composeStore.name,
    users: selectedContactIds.value
  })
  if (err) {
    return
  }
  await chatStore.refreshChatList()
  selectedContactIds.value = []
  composeStore.composeModalOpen = false
  composeStore.name = ''
  composeStore.changeActiveTab({
    tabName: 'group-info',
    animationName: 'slide-right'
  })
}
</script>

<template>
  <div>
    <!--search-->
    <div class="mx-5 mt-3 mb-5">
      <SearchInput v-model="searchText" />
    </div>

    <!--contacts-->
    <ScrollBox class="overflow-y-scroll max-h-[200px] mb-5">
      <template
        v-if="chatStore.status === 'success' && !chatStore.delayLoading"
      >
        <ContactItemV2
          v-for="(contact, index) in filteredContactList"
          :key="index"
          :active="isContactSelected(contact)"
          :contact="contact"
          @click="handleSelectedContactsChange(contact)"
        >
          <template v-slot:checkbox>
            <Checkbox :value="isContactSelected(contact)" />
          </template>
        </ContactItemV2>
      </template>

      <Loading1
        v-for="item in 3"
        v-if="chatStore.status === 'loading' || chatStore.delayLoading"
      />
    </ScrollBox>

    <div class="flex px-5 mt-5 pb-6">
      <div class="grow"></div>
      <!--previous button-->
      <Button
        class="px-5 mr-4"
        variant="ghost"
        @click="
          composeStore.changeActiveTab({
            tabName: 'group-info',
            animationName: 'slide-right'
          })
        "
      >
        <Typography no-color variant="body-5"> Previous</Typography>
      </Button>

      <!--next button-->
      <Button
        class="px-5 bg-indigo-400 hover:bg-indigo-500 active:bg-indigo-500"
        :disabled="!selectedContactIds.length"
        @click="handleCreate"
      >
        创建
      </Button>
    </div>
  </div>
</template>
