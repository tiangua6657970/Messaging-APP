<script setup lang="ts">
import SlideTransition from '@src/components/ui/transitions/SlideTransition.vue'
import useComposeStore from '@src/store/compose'

defineEmits(['activePageChange'])

const composeStore = useComposeStore()
</script>

<template>
  <div>
    <!--content-->
    <div class="overflow-x-hidden">
      <SlideTransition :animation="composeStore.animation">
        <component
          :is="composeStore.ActivePage"
          :key="composeStore.activePageName"
        />
      </SlideTransition>
    </div>
  </div>
</template>
