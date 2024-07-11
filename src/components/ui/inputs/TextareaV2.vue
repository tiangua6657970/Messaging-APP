<script setup lang="ts">
import { Ref, watch } from 'vue'

import { twMerge } from 'tailwind-merge'
import { computed, ref } from 'vue'
import Textarea from '@src/components/ui/inputs/Textarea.vue'
import { Mentionable } from 'vue-mention'
import 'floating-vue/dist/style.css'
import { IFriend } from '@src/typeV2'
import useChatStore from '@src/store/chat'

const props = defineProps<{
  class?: any
  variant?: string
  value?: string
  autoResize?: boolean
  placeholder: string
  member: IFriend[]
}>()

const emit = defineEmits<{
  (e: 'send'): void
  (e: 'update:modelValue', value: string): void
}>()

const textarea: Ref<HTMLTextAreaElement | null> = ref(null)

const baseClasses = `max-w-full w-full px-5 py-4 rounded-sm content-center outline-none text-sm
        placeholder:text-black placeholder:opacity-40 text-opacity-70 dark:placeholder:text-white
        dark:placeholder:opacity-70 focus:outline-none transition duration-200
        ease-out`

const variantClasses = computed(() => {
  if (props.variant === 'bordered') {
    return `border border-gray-200 text-black bg-gray-50 dark:bg-gray-700
            dark:text-white dark:bg-opacity-70 dark:focus:bg-opacity-0 focus:bg-opacity-0
            focus:border-indigo-300 dark:border-gray-600`
  } else {
    return `text-black bg-gray-50 dark:text-white border-opacity-0
            dark:bg-gray-700 dark:bg-opacity-70 dark:border-opacity-70 dark:border-gray-700`
  }
})

const classes = twMerge(baseClasses, variantClasses.value, props.class)

const chatStore = useChatStore()
const currentChatInfo = computed(() => chatStore.currentChatInfo)
const isGroupOwner = computed(() => chatStore.isGroupOwner)

const items = computed(() => {
  const items = currentChatInfo.value.member.map(item => {
    return {
      value: item.name,
      avatar: item.avatar,
    }
  })
  if (currentChatInfo.value.type === 1 && isGroupOwner.value) {
    items.unshift({
      value: '所有人',
      avatar: currentChatInfo.value.group.avatar
    })
  }
  return items
})

const handleAutoResize = () => {
  if (props.autoResize && textarea.value) {
    textarea.value.style.height = 'auto'
    textarea.value.style.height = textarea.value.scrollHeight + 'px'
  }
}

function handleKeydown(event: KeyboardEvent) {
  if (isOpen.value) {
    return
  }
  if (event.key === 'Enter' && !event.shiftKey) {
    emit('send')
    event.preventDefault()
  }
}

function focus() {
  textarea.value?.focus()
}

function handleInputChange(event: Event) {
  handleAutoResize()
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}

defineExpose({ focus, textarea })

const text = ref('')
const isOpen = ref(false)
watch(
  () => props.value,
  newVal => {
    // @ts-ignore
    text.value = newVal
  }
)

function handleMentionOpen() {
  isOpen.value = true
}

function handleMentionClose() {
  isOpen.value = false
}
</script>

<template>
  <Mentionable
    :keys="['@']"
    :items="items"
    offset="6"
    insert-space
    :limit="10"
    @open="handleMentionOpen"
    @close="handleMentionClose"
  >
    <textarea
      class="max-h-[80px] pr-[50px] resize-none scrollbar-hidden"
      :class="classes"
      ref="textarea"
      :value="text"
      :placeholder="placeholder"
      auto-resize
      cols="30"
      rows="1"
      @keydown="handleKeydown"
      @input="handleInputChange"
    >
    </textarea>
    <template #no-result>
      <div class="dim">No result</div>
    </template>

    <template #item-@="{ item }">
      <div class="flex items-center">
        <div class="mr-4">
          <div
            :style="{ backgroundImage: `url(${item.avatar})` }"
            class="w-7 h-7 rounded-full bg-cover bg-center"
          ></div>
        </div>
        <span class="dim">{{ item.value }}</span>
      </div>
    </template>
  </Mentionable>
</template>
<style>
.mention-item {
  padding: 8px 10px;
  border-radius: 4px;
}

.mention-selected {
  background-color: #c7d2fe;
}
</style>
