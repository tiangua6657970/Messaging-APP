<script setup lang="ts">

import Typography from '@src/components/ui/data-display/Typography.vue'
import Button from '@src/components/ui/inputs/Button.vue'
import useThemeStore from '@src/store/theme'
import { computed, ref } from 'vue'
import useChatStore from '@src/store/chat'
import { useRouter } from 'vue-router'
import useAuthStore from '@src/store/auth'

const themeStore = useThemeStore()
const themes = computed(() => themeStore.themes)
const activeIndex = ref(0)
const chatStore = useChatStore()
const authStore = useAuthStore()
const router = useRouter()

function handleConfirm() {
  authStore.code = themes.value[activeIndex.value].code
  chatStore.refreshChat(authStore.code).then()
  router.push({ name: 'Home' })
}
</script>

<template>
  <div class="w-screen h-screen flex justify-center items-center">

  </div>
</template>

<style scoped>

</style>