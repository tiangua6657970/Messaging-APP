<script setup lang="ts">
import Button from '@src/components/ui/inputs/Button.vue'
import DropFileUpload from '@src/components/ui/inputs/DropFileUpload.vue'
import TextInput from '@src/components/ui/inputs/TextInput.vue'
import useComposeStore from '@src/store/compose'

function handleChange(file: any) {
  console.log('file', file)
}

const composeStore = useComposeStore()
</script>

<template>
  <div class="px-5">
    <!--inputs-->
    <div class="mb-5">
      <div class="mb-5">
        <TextInput
          type="text"
          placeholder="输入群名称"
          label="名称"
          :value="composeStore.name"
          @value-changed="$event => (composeStore.name = $event)"
        />
      </div>

      <!-- TODO: DropFileUpload-->
      <!--<div>-->
      <!--  <DropFileUpload label="Avatar" @value-changed="handleChange" />-->
      <!--</div>-->
    </div>

    <!--next button-->
    <div class="flex pb-6">
      <div class="grow"></div>
      <Button
        @click="
          composeStore.changeActiveTab({
            tabName: 'group-members',
            animationName: 'slide-left'
          })
        "
        class="px-5 bg-indigo-400 hover:bg-indigo-500 active:bg-indigo-500"
      >
        下一步
      </Button>
    </div>
  </div>
</template>
