<script setup lang="ts">
import { EyeSlashIcon, XCircleIcon } from '@heroicons/vue/24/outline'
import IconButton from '@src/components/ui/inputs/IconButton.vue'
import SlideTransition from '@src/components/ui/transitions/SlideTransition.vue'
import MessagePreview from '@src/components/views/HomeView/Chat/MessagePreview.vue'
import useActionStore from '@src/store/action'

const actionStore = useActionStore()
</script>

<template>
  <SlideTransition animation="shelf-down">
    <div
      class="absolute z-10 w-full px-5 py-2 bg-white dark:bg-gray-800 flex items-center justify-between transition-all duration-500"
      v-if="actionStore.pinnedMessage"
    >
      <!--pinned message preview-->
      <MessagePreview :message="actionStore?.pinnedMessage" />

      <div class="flex">
        <!--hide pinned Message-->
        <IconButton
          title="hide pinned message"
          aria-label="hide pinned message"
          @click="actionStore.setPin(undefined)"
          class="group w-7 h-7 text-gray-300"
          :class="{
            'mr-3': true
          }"
        >
          <EyeSlashIcon class="w-[16px] h-[16px]" />
        </IconButton>

        <!--remove pinned Message-->
        <IconButton
          v-if="true"
          @click="actionStore.setPin(undefined)"
          class="group w-7 h-7"
          title="close pinned message"
          aria-label="close pinned message"
        >
          <XCircleIcon
            class="w-[16px] h-[16px] text-gray-300 group-hover:text-red-300"
          />
        </IconButton>
      </div>
    </div>
  </SlideTransition>
</template>
