<script setup lang="ts">
import type { Ref } from 'vue'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import VideoPlayer from '@src/components/ui/data-display/VideoPlayer.vue'
import IconButton from '@src/components/ui/inputs/IconButton.vue'
import Toolbar from '@src/components/ui/data-display/Carousel/Toolbar.vue'
import ScaleTransition from '../../transitions/ScaleTransition.vue'
import FadeTransition from '../../transitions/FadeTransition.vue'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/vue/24/solid'

const carousel: Ref<HTMLElement | undefined> = ref()

const { activate, deactivate } = useFocusTrap(carousel)
const show = ref(false)
const currentIndex = ref(0)
const mediaList = ref<
  Array<{
    url: string
    type: 'video' | 'image'
    thumbnail?: string
    msgId: number
  }>
>([])

// the selected attachment
const selectedAttachment = computed(() => {
  return mediaList.value[currentIndex.value]
})

// check if there is a next attachment.
const thereIsNext = () => {
  let length = mediaList.value.length
  return length > 0 && !(currentIndex.value + 1 >= length)
}

// check if there is a previous attachment.
const thereIsPrevious = () => {
  let length = mediaList.value.length
  return length > 0 && !(currentIndex.value <= 0)
}

// (event) increase selectedIndex if there is a next attachment.
const handleNextItem = () => {
  if (thereIsNext()) {
    zoom.value = 1
    ;(currentIndex.value as number)++
  }
}

// (event) increase selectedIndex if there is a previous attachment.
const handlePreviousItem = () => {
  if (thereIsPrevious()) {
    zoom.value = 1
    ;(currentIndex.value as number)--
  }
}

// (event) close modal when typing esc button
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowLeft') {
    if (thereIsPrevious()) {
      currentIndex.value--
    }
  } else if (event.key === 'ArrowRight') {
    if (thereIsNext()) {
      currentIndex.value++
    }
  } else if (['Escape', 'Esc'].includes(event.key)) {
    close()
  }
}

function open(
  list: Array<{
    url: string
    type: 'video' | 'image'
    thumbnail?: string
    msgId: number
  }>,
  startIndex = 0
) {
  show.value = true
  mediaList.value = list
  currentIndex.value = startIndex
  setTimeout(() => {
    activate()
  }, 500)
}

function close() {
  show.value = false
  setTimeout(() => {
    deactivate()
  }, 200)
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})

// the zoom of the image
const zoom = ref(1)

const handleIncreaseZoom = () => {
  if (zoom.value < 2) {
    zoom.value += 0.5
  }
}

const handleDecreaseZoom = () => {
  if (zoom.value > 0.5) {
    zoom.value -= 0.5
  }
}

defineExpose({ open, close })
</script>

<template>
  <div
    class="relative z-10"
    aria-label="media carousel"
    role="dialog"
    aria-modal="true"
  >
    <!--overlay-->
    <FadeTransition>
      <div
        v-show="show"
        class="fixed inset-0 bg-black bg-opacity-60 transition-opacity"
      ></div>
    </FadeTransition>

    <!--content-->
    <ScaleTransition>
      <div v-show="show" class="fixed inset-0 z-10 overflow-y-auto">
        <div ref="carousel" class="h-full flex flex-col p-5">
          <!--toolbar-->
          <Toolbar
            :is-image="Boolean(selectedAttachment.type === 'image')"
            :handle-close-carousel="close"
            :handle-increase-zoom="handleIncreaseZoom"
            :handle-decrease-zoom="handleDecreaseZoom"
            v-if="selectedAttachment"
          />

          <div class="h-full flex justify-between">
            <!--Left controls-->
            <div class="flex items-center justify-end mr-5">
              <IconButton
                title="previous"
                @click="handlePreviousItem"
                aria-label="previous item"
                :class="{ invisible: !thereIsPrevious() }"
                variant="ghost"
              >
                <ChevronLeftIcon
                  class="md:w-8 md:h-8 xs:w-5 xs:h-5 text-white opacity-80 hover:opacity-100"
                />
              </IconButton>
            </div>

            <div
              class="w-full h-full px-5 flex items-center justify-center overflow-hidden"
            >
              <!--Image-->
              <img
                class="w-auto md:max-w-[700px] xs:max-w-[340px] transition-transform duration-300"
                :style="{ transform: `scale(${zoom})` }"
                v-if="selectedAttachment && selectedAttachment.type === 'image'"
                :src="selectedAttachment.url"
                :key="selectedAttachment.msgId"
                alt=""
              />

              <!--Video-->
              <VideoPlayer
                :id="'video-player-' + selectedAttachment.msgId"
                v-if="selectedAttachment && selectedAttachment.type === 'video'"
                :url="selectedAttachment.url"
                :thumbnail="(selectedAttachment.thumbnail as string)"
                :key="selectedAttachment.msgId"
              />
            </div>

            <!--right controls-->
            <div class="flex items-center justify-end ml-5">
              <IconButton
                title="next"
                aria-label="next item"
                :class="{ invisible: !thereIsNext() }"
                @click="handleNextItem"
                variant="ghost"
              >
                <ChevronRightIcon
                  class="md:w-8 md:h-8 xs:w-5 xs:h-5 text-white opacity-80 hover:opacity-100"
                />
              </IconButton>
            </div>
          </div>
        </div>
      </div>
    </ScaleTransition>
  </div>
</template>
