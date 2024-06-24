<script setup lang="ts">
import { ArrowDownTrayIcon } from "@heroicons/vue/24/outline";
import { PlayIcon } from "@heroicons/vue/24/solid";
import type { Ref } from "vue";
import { computed, ref } from "vue";

import type { IAttachment, IMessage } from "@src/types";

import Carousel from "@src/components/ui/data-display/Carousel/Carousel.vue";
import Typography from "@src/components/ui/data-display/Typography.vue";
import { IMessageV2 } from "@src/typeV2";
import { ossURL } from "@src/service/config";

const props = defineProps<{
  message: IMessageV2;
  self?: boolean;
}>();

const openCarousel: Ref<boolean> = ref(false);

const selectedAttachmentId: Ref<number | undefined> = ref();

// open the carousel with the selected index
const openCarouselWithAttachment = (attachmentId: number) => {
  selectedAttachmentId.value = attachmentId;
  openCarousel.value = true;
};

// close the carousel
const closeCarousel = () => {
  openCarousel.value = false;
};

// check if the message contians images or videos
const containsMedia = computed(() => {
  if (props.message.attachments) {
    for (let attachment of props.message.attachments) {
      if (["image", "video"].includes(attachment.type)) return true;
    }
  }
  return false;
});

// number of videos attached to this message.
const numberOfMedia = computed(() => {
  let counter = 0;

  if (props.message.attachments) {
    for (let attachment of props.message.attachments) {
      if (["video", "image"].includes(attachment.type)) {
        counter += 1;
      }
    }
  }

  return counter;
});

// (event) test is the attachment is the second media item.
const isNumber = (
  attachment: IAttachment,
  number: number,
  largerThan?: boolean
) => {
  let counter = 0;
  let caseCorrect = false;

  if (props.message.attachments) {
    for (let item of props.message.attachments) {
      if (["video", "image"].includes(item.type)) {
        counter += 1;

        if (largerThan) {
          if (item.id === attachment.id && counter > number) {
            caseCorrect = true;
          }
        } else {
          if (item.id === attachment.id && counter === number) {
            caseCorrect = true;
          }
        }
      }
    }
  }

  return caseCorrect;
};
</script>

<template>
  <div>
    <div class="flex">
      <div
        class="mr-2 flex items-end"
        :class="{ 'mt-4': true }"
      >
        <!--image-->
        <button
          v-if="message.type === 2"
          @click="openCarouselWithAttachment(message.id)"
          class="outline-none"
        >
          <div
            :style="{ backgroundImage: `url(${ossURL + message.content.url})` }"
            class="rounded bg-cover bg-center"
            :class="
              numberOfMedia === 1
                ? ['w-[200px]', 'h-[200px]']
                : [
                    'md:w-[110px]',
                    'md:h-[100px]',
                    'xs:w-[100px]',
                    'xs:h-[95px]',
                  ]
            "
          >
            <!--first image-->
            <div
              class="w-full h-full flex justify-center items-center rounded bg-black bg-opacity-20 hover:bg-opacity-10 transition duration-200"
            ></div>

            <!--more images overlay-->
            <div
              class="w-full h-full flex items-center justify-center rounded bg-black bg-opacity-40 text-white hover:bg-opacity-10 transition duration-200"
            >
             2+
            </div>
          </div>
        </button>

        <!--video-->
        <button
          v-if="message.type === 3"
          @click="openCarouselWithAttachment(message.id)"
          class="overflow-hidden outline-none"
        >
          <div
            :style="{ backgroundImage: `url(${ossURL + message.content.url}?ci-process=snapshot&time=1&format=jpg)` }"
            class="rounded bg-cover bg-center"
            :class="
              numberOfMedia === 1
                ? ['w-[200px]', 'h-[200px]']
                : [
                    'md:w-[110px]',
                    'md:h-[100px]',
                    'xs:w-[100px]',
                    'xs:h-[95px]',
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

            <!--more videos overlay-->
            <div
              class="w-full h-full flex items-center justify-center rounded bg-black bg-opacity-40 text-white hover:bg-opacity-10 transition duration-200"
            >
             2+
            </div>
          </div>
        </button>

        <!--file-->
      </div>

      <!--carousel modal-->
      <Carousel
        :open="openCarousel"
        :starting-id="(selectedAttachmentId as number)"
        :close-carousel="closeCarousel"
      />
    </div>
  </div>
</template>
