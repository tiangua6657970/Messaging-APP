<script setup lang="ts">
import { PlayIcon } from '@heroicons/vue/24/solid'
import { IMessageV2 } from '@src/typeV2'

const props = defineProps<{
  message: IMessageV2
}>()

// const emit = defineEmits<{
//   (e: 'click'): void
// }>()

function handleClick() {
  // emit('click')
}
</script>

<template>
  <div @click="handleClick">
    <div class="flex">
      <div class="mr-2 flex items-end" :class="{ 'mt-4': true }">
        <!--image-->
        <button
          v-if="message.messageType === 'image'"
          class="outline-none"
        >
          <div
            :style="{ backgroundImage: `url(${message.content.fullURL})` }"
            class="rounded bg-cover bg-center"
            :class="
              1 === 1
                ? ['w-[200px]', 'h-[200px]']
                : [
                    'md:w-[110px]',
                    'md:h-[100px]',
                    'xs:w-[100px]',
                    'xs:h-[95px]'
                  ]
            "
          ></div>
        </button>

        <!--video-->
        <button
          v-if="message.messageType === 'video'"
          class="overflow-hidden outline-none"
        >
          <div
            :style="{
              backgroundImage: `url(${message.content.fullURL}?ci-process=snapshot&time=1&format=jpg)`
            }"
            class="rounded bg-cover bg-center"
            :class="
              1 === 1
                ? ['w-[200px]', 'h-[200px]']
                : [
                    'md:w-[110px]',
                    'md:h-[100px]',
                    'xs:w-[100px]',
                    'xs:h-[95px]'
                  ]
            "
          >
            <!--first video-->
            <div
              class="w-full h-full flex justify-center items-center rounded bg-black bg-opacity-20 hover:bg-opacity-10 transition duration-200"
            >
              <span
                class="p-3 rounded-full bg-white bg-opacity-40 transition-all duration-200"
              >
                <PlayIcon class="w-5 h-5 text-white" />
              </span>
            </div>

            <!--second video-->
            <div
              class="w-full h-full flex justify-center items-center rounded bg-black bg-opacity-20 hover:bg-opacity-10 transition duration-200"
            >
              <span
                class="p-3 rounded-full bg-white bg-opacity-40 transition-all duration-200"
              >
                <PlayIcon class="w-5 h-5 text-white" />
              </span>
            </div>
          </div>
        </button>

        <!--file-->
      </div>
    </div>
  </div>
</template>
