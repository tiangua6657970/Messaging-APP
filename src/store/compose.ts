import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import GroupInfo from '@src/components/shared/modals/ComposeModal/GroupInfo.vue'
import GroupMembers from '@src/components/shared/modals/ComposeModal/GroupMembers.vue'

const useComposeStore = defineStore('composeStore', () => {
  const name = ref('')
  const animation = ref('slide-left')
  const activePageName = ref('group-info')
  const composeModalOpen = ref(false)
  const selectContactOpen = ref(false)
  const kickOutGroupModalOpen = ref(false)

  const ActivePage = computed(() => {
    if (activePageName.value === 'group-info') return GroupInfo
    else if (activePageName.value === 'group-members') return GroupMembers
  })

  function changeActiveTab(event: { tabName: string; animationName: string }) {
    animation.value = event.animationName
    activePageName.value = event.tabName
  }

  return {
    name,
    animation,
    activePageName,
    ActivePage,
    selectContactOpen,
    composeModalOpen,
    kickOutGroupModalOpen,
    changeActiveTab
  }
})

export default useComposeStore
