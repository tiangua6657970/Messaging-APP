<script setup lang="ts">
import { ref } from 'vue'
import PinnedMessage from '@src/components/views/HomeView/Chat/ChatTop/PinnedMessage.vue'
import ConversationInfoSection from './ConversationInfoSection.vue'
import SelectSection from './SelectSection.vue'
import useSelectMessageStore from '@src/store/selectMessage'
import useActionStore from '@src/store/action'

const selectMessageStore = useSelectMessageStore()
const actionStore = useActionStore()

const openSearch = ref(false)

const handleOpenSearch = () => {
  openSearch.value = true
}
</script>

<template>
  <div class="w-full">
    <div class="w-full min-h-[84px] px-5 py-6">
      <SelectSection v-if="selectMessageStore.selectMode" />
      <ConversationInfoSection v-else :handle-open-search="handleOpenSearch" />
    </div>
    <!--Pinned Message-->
    <div
      class="relative transition-[padding] duration-200"
      :class="{
        'pb-[60px]': actionStore.pinnedMessage
      }"
    >
      <PinnedMessage />
    </div>
  </div>
</template>
<style></style>