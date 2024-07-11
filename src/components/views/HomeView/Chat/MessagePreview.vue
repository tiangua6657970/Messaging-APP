<script setup lang="ts">
import { shorten, shortenV2 } from '@src/utils'

import Typography from '@src/components/ui/data-display/Typography.vue'
import { IMessageV2 } from '@src/typeV2'
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    message: IMessageV2
    self?: boolean
    messageKey?: 'text' | 'answerMsgText'
  }>(),
  {
    messageKey: 'text'
  }
)

// TODO: MessagePreview
const tips = computed(() => {
  if (props.messageKey === 'answerMsgText') {
    return '回复：'
  } else {
    return props.message.user_info.nickname
  }
})

function handleClick() {
  const res = document.querySelector(
    `div[data-message-id="${
      props.messageKey === 'text'
        ? props.message.id
        : props.message.content.answerMsgId
    }"]`
  )
  res?.scrollIntoView({ behavior: 'smooth' })
}
</script>

<template>
  <div
    v-if="props.message"
    class="border-l-2 pl-3 cursor-pointer outline-none border-opacity-50 duration-200"
    :class="['border-gray-900', 'dark:border-white', 'dark:border-opacity-50']"
    tabindex="0"
    :aria-label="'reply to: ' + props.message.user_info.nickname"
    @click="handleClick"
  >
    <!--name-->
    <p
      class="mb-3 font-semibold text-xs leading-4 tracking-[0.16px]"
      :class="[
        'text-black',
        'opacity-60',
        'dark:text-white',
        'dark:opacity-70'
      ]"
    >
      {{ tips }}
    </p>

    <!--content-->
    <Typography
      variant="body-2"
      :no-color="true"
      class="text-black opacity-50 dark:text-white dark:opacity-70"
    >
      {{ shortenV2(props.message.content[messageKey], 60) }}
    </Typography>
  </div>
</template>
