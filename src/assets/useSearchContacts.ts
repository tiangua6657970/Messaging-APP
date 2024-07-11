import useChatStore from '@src/store/chat'
import { computed, ref, Ref, watch } from 'vue'
import { debounceV2 } from '@src/assets/utils'

export default function useSearchContacts() {
  const chatStore = useChatStore()
  const contactList= computed(() => chatStore.contactList)
  const searchText: Ref<string> = ref('')
  const filteredContactList = ref(contactList.value.slice())

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
  return {
    contactList,
    searchText,
    filteredContactList,
  }
}