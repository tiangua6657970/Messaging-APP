<script setup lang="ts">
import Typography from '@src/components/ui/data-display/Typography.vue'
import { IFriend } from '@src/typeV2'

defineEmits(['contactSelected'])

const props = defineProps<{
  contact: IFriend
  variant?: string
  active?: boolean
  unselectable?: boolean
}>()
</script>

<template>
  <div
    class="w-full p-5 flex transition duration-200 ease-out outline-none"
    :class="{
      'hover:bg-indigo-50 active:bg-indigo-100 focus:bg-indigo-50 dark:hover:bg-gray-600 dark:focus:bg-gray-600': true,
      'bg-indigo-50 dark:bg-gray-600': active
    }"
    @click="$emit('contactSelected', props.contact)"
  >
    <!-- avatar -->
    <div class="mr-4">
      <div
        :style="{ backgroundImage: `url(${contact.avatar})` }"
        class="w-7 h-7 rounded-full bg-cover bg-center"
      ></div>
    </div>
    <div class="w-full flex justify-between items-center">
      <!--chat name-->
      <div class="flex items-center">
        <Typography variant="heading-2">
          {{ contact.name }}
        </Typography>
        <slot name="tag"></slot>
      </div>
      <!--optional menu-->
      <div class="relative">
        <slot name="menu" />
      </div>
    </div>
    <div class="h-full flex flex-col justify-center items-center">
      <slot name="checkbox"></slot>
    </div>
  </div>
</template>

<style scoped></style>
