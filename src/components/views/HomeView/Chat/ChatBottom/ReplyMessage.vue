<script setup lang="ts">
import { XCircleIcon } from '@heroicons/vue/24/outline'
import IconButton from '@src/components/ui/inputs/IconButton.vue'
import SlideTransition from '@src/components/ui/transitions/SlideTransition.vue'
import MessagePreview from '@src/components/views/HomeView/Chat/MessagePreview.vue'
import useActionStore from '@src/store/action'

const actionStore = useActionStore()

</script>

<template>
  <SlideTransition animation="shelf-up">
    <div
      class="absolute bottom-0 w-full px-5 py-2 bg-white dark:bg-gray-800 flex items-center justify-between transition-all duration-200"
      v-if="actionStore?.replyMessage"
    >
      <!--selected message overview-->
      <MessagePreview :message="actionStore?.replyMessage" />

      <!--close selected Message-->
      <IconButton
        @click="actionStore.setReply(undefined)"
        class="group w-7 h-7"
        title="remove reply"
        aria-label="remove reply"
      >
        <XCircleIcon
          class="w-[16px] h-[16px] text-gray-300 group-hover:text-red-300"
        />
      </IconButton>
    </div>
  </SlideTransition>
</template>
