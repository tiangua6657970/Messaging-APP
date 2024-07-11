<script setup lang="ts">
import Modal from '@src/components/ui/utils/Modal.vue'
import ConversationInfoV2 from '@src/components/shared/modals/ConversationInfoModal/ConversationInfoV2.vue'

const props = defineProps<{
  open: boolean
  closeModal: () => void
}>()
</script>

<template>
  <Modal :open="open" :close-modal="closeModal">
    <template v-slot:content>
      <div class="overflow-x-hidden">
        <div class="w-[300px] bg-white dark:bg-gray-800 rounded py-6">
          <ConversationInfoV2 :close-modal="closeModal" />
        </div>
      </div>
    </template>
  </Modal>
</template>

<style scoped></style>