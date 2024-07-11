<script setup lang="ts">
import NoContacts from '@src/components/states/empty-states/NoContacts.vue'
import Loading1 from '@src/components/states/loading-states/Loading1.vue'
import SearchInput from '@src/components/ui/inputs/SearchInput.vue'
import ScrollBox from '@src/components/ui/utils/ScrollBox.vue'
import useChatStore from '@src/store/chat'
import { computed, Ref, ref, watch } from 'vue'
import { IFriend } from '@src/typeV2'
import ContactItemV2 from '@src/components/shared/blocks/ContactItemV2.vue'
import { debounceV2 } from '@src/assets/utils'

const chatStore = useChatStore()
const contactList = computed(() => {
  return chatStore.contactGroups.flatMap(item => item.data)
})
const searchText: Ref<string> = ref('')
const filteredContactList = ref(contactList.value.slice())

async function handleSelect(contact: IFriend) {
  const { err, data } = await chatStore.getListId({ user_id: contact.user_id })
  if (err) {
    return
  }
  chatStore.activeConversationId = data.list_id
  chatStore.conversationOpen = 'open'
}

const debouncedFunction = debounceV2(() => {
  const searchTextVal = searchText.value
  if (!searchTextVal) {
    filteredContactList.value = contactList.value.slice()
    return
  }
  filteredContactList.value = contactList.value.filter(item => {
    return (
      item.name.toLowerCase().includes(searchTextVal.toLowerCase()) ||
      item.user_id === Number(searchTextVal)
    )
  })
}, 300)
watch([searchText, contactList], () => {
  debouncedFunction()
})
</script>

<template>
  <div class="pb-6">
    <!--search-->
    <div class="mx-5 mb-5">
      <SearchInput v-model="searchText" />
    </div>

    <!--contacts-->
    <ScrollBox class="overflow-y-scroll max-h-[200px]">
      <Loading1
        v-if="chatStore.status === 'loading' || chatStore.delayLoading"
        v-for="item in 3"
      />
      <template
        v-else-if="
          chatStore.status === 'success' &&
          !chatStore.delayLoading &&
          contactList.length > 0
        "
      >
        <ContactItemV2
          v-for="(contact, index) in filteredContactList"
          :key="index"
          :contact="contact"
          @contact-selected="handleSelect"
        />
      </template>

      <NoContacts vertical v-else />
    </ScrollBox>
  </div>
</template>
