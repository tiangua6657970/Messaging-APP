<script setup lang="ts">
import Modal from '@src/components/ui/utils/Modal.vue'
import ScrollBox from '@src/components/ui/utils/ScrollBox.vue'

const props = defineProps<{
  open: boolean
  closeModal: () => void
}>()
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template v-slot:content>

    </template>
  </Modal>
</template>

<style scoped></style>
