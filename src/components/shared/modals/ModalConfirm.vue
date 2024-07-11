<script setup lang="ts">
import { VueFinalModal } from 'vue-final-modal'
import Button from '@src/components/ui/inputs/Button.vue'
import Typography from '@src/components/ui/data-display/Typography.vue'

defineProps<{
  title?: string
}>()

const emit = defineEmits<{
  (e: 'confirm', value: boolean): void
}>()
</script>

<template>
  <VueFinalModal
    class="flex justify-center items-center"
    content-class="flex flex-col max-w-xl mx-4 p-4 bg-white dark:bg-gray-900 border dark:border-gray-700 rounded-lg space-y-2"
  >
    <h1 class="text-xl">
      {{ title }}
    </h1>
    <slot />
    <div class="flex">
      <div class="grow"></div>
      <!--previous button-->
      <Button @click="emit('confirm', false)" variant="ghost" class="px-5 mr-4">
        <Typography variant="body-5" no-color> cancel</Typography>
      </Button>

      <!--next button-->
      <Button
        class="px-5 bg-indigo-400 hover:bg-indigo-500 active:bg-indigo-500"
        @click="emit('confirm', true)"
      >
        confirm
      </Button>
    </div>
  </VueFinalModal>
</template>
