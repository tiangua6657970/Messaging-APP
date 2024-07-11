<script lang="ts" setup>
import Collapse from '@src/components/ui/utils/Collapse.vue'
import AccordionButton from '@src/components/ui/data-display/AccordionButton.vue'
import Typography from '@src/components/ui/data-display/Typography.vue'
import SettingsSwitch from '@src/components/views/HomeView/Sidebar/Settings/SettingsAccordion/SettingsSwitch.vue'
import useChatStore from '@src/store/chat'
import { computed } from 'vue'

const props = defineProps<{
  collapsed: boolean
  handleToggle: () => void
}>()

const chatStore = useChatStore()
const currentChatInfo = computed(() => chatStore.currentChatInfo)

async function toggleAllowMembersToChangeInfo(value: boolean) {
  await chatStore.allowGroupAvatarAndNameEdit({ value: Number(value) })
  await chatStore.refreshChatInfo()
}

async function toggleDisableFriendAddingInGroup(value: boolean) {
  await chatStore.toggleGroupFriendAddition({ value: Number(value) })
  await chatStore.refreshChatInfo()
}
</script>

<template>
  <!--privacy settings-->
  <AccordionButton
    id="privacy-settings-toggler"
    :collapsed="props.collapsed"
    aria-controls="privacy-settings-collapse"
    chevron
    class="w-full flex px-5 py-6 mb-3 rounded focus:outline-none"
    @click="props.handleToggle()"
  >
    <Typography class="mb-4" variant="heading-2">权限相关</Typography>
    <Typography variant="body-2">禁言，允许加好友和修改群信息相关</Typography>
  </AccordionButton>

  <Collapse id="privacy-settings-collapse" :collapsed="props.collapsed">

    <SettingsSwitch
      :handle-toggle-switch="toggleAllowMembersToChangeInfo"
      :value="currentChatInfo.group.edit_photo === 1"
      class="mb-7"
      description="关闭后后仅群主和群管理员可以修改"
      title="允许群成员修改群名称和群头像"
    />
    <SettingsSwitch
      :handle-toggle-switch="toggleDisableFriendAddingInGroup"
      :value="currentChatInfo.group.can_add_friend === 0"
      class="mb-7"
      description="关闭后群成员可以直接加好友"
      title="群内禁止好友"
    />
  </Collapse>
</template>

<style scoped></style>
