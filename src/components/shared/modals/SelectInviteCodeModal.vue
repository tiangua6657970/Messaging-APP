<script setup lang="ts">
import Typography from '@src/components/ui/data-display/Typography.vue'
import Button from '@src/components/ui/inputs/Button.vue'
import Modal from '@src/components/ui/utils/Modal.vue'
import useChatStore from '@src/store/chat'
import useThemeStore from '@src/store/theme'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps<{
  openModal: boolean
  closeModal: () => void
}>()
const themeStore = useThemeStore()
const themes = computed(() => themeStore.themes)
const activeIndex = ref(0)
const chatStore = useChatStore()
const router = useRouter()

function handleConfirm() {
  chatStore.refreshChat(themes.value[activeIndex.value].code).then()
  router.push({ name: 'Home' })
}
</script>

<template>
  <Modal :open="props.openModal" :closeModal="props.closeModal">
    <template v-slot:content>
      <div class="w-[300px] bg-white dark:bg-gray-800 rounded py-6">
        <!--modal header-->
        <div class="flex justify-between items-center px-5 mb-5">
          <Typography
            id="modal-title"
            variant="heading-1"
            class="default-outline"
            tabindex="0"
          >
            选择一个邀请码
          </Typography>

          <Button
            variant="outlined"
            color="danger"
            @click="props.closeModal"
            typography="body-4"
          >
            esc
          </Button>
        </div>
        <div>
          <div
            class="w-full p-5 flex transition duration-200 ease-out outline-none"
            :class="{
              'hover:bg-indigo-50 active:bg-indigo-100 focus:bg-indigo-50 dark:hover:bg-gray-600 dark:focus:bg-gray-600': true,
              'bg-indigo-50 dark:bg-gray-600': activeIndex === index
            }"
            @click="activeIndex = index"
            v-for="(item, index) in themes"
            :key="item.code"
          >
            <div
              :style="{ backgroundImage: `url(${item.icon_image})` }"
              class="w-7 h-7 rounded-full bg-cover bg-center mr-4"
            ></div>
            <div class="w-full flex justify-between items-center">
              <Typography variant="heading-2">
                {{ item.project_name }}
              </Typography>
              <Typography variant="heading-2">
                {{ item.name }}
              </Typography>
              <Typography variant="heading-2">
                {{ item.code }}
              </Typography>
            </div>
          </div>
        </div>
        <!--submit button-->
        <div class="px-5 mt-5">
          <Button class="w-full py-4" @click="handleConfirm">确定</Button>
        </div>
      </div>
    </template>
  </Modal>
</template>
