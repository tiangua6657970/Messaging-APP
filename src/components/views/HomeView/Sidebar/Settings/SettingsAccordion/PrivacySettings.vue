<script setup lang="ts">
import useStore from "@src/store/store";

import AccordionButton from "@src/components/ui/data-display/AccordionButton.vue";
import Typography from "@src/components/ui/data-display/Typography.vue";
import Collapse from "@src/components/ui/utils/Collapse.vue";
import SettingsSwitch from "@src/components/views/HomeView/Sidebar/Settings/SettingsAccordion/SettingsSwitch.vue";

// Variables
const props = defineProps<{
  collapsed: boolean;
  handleToggle: () => void;
}>();

const store = useStore();
</script>

<template>
  <!--privacy settings-->
  <AccordionButton
    id="privacy-settings-toggler"
    class="w-full flex px-5 py-6 mb-3 rounded focus:outline-none"
    :collapsed="props.collapsed"
    chevron
    aria-controls="privacy-settings-collapse"
    @click="props.handleToggle()"
  >
    <Typography variant="heading-2" class="mb-4"> 隐私与安全 </Typography>
    <Typography variant="body-2"> 控制您的隐私设置 </Typography>
  </AccordionButton>

  <Collapse id="privacy-settings-collapse" :collapsed="props.collapsed">
    <SettingsSwitch
      title="显示最后在线时间"
      description="允许他人查看您的最后登录时间"
      :value="!!store.settings.lastSeen"
      :handle-toggle-switch="(value:boolean) => (store.settings.lastSeen = value)"
      class="mb-7"
    />
    <SettingsSwitch
      title="显示已读回执"
      description="允许他人查看您是否已读消息"
      :value="!!store.settings.readReceipt"
      :handle-toggle-switch="
        (value:boolean) => (store.settings.readReceipt = value)
      "
      class="mb-7"
    />
    <SettingsSwitch
      title="加入群组"
      description="允许他人将您加入群组"
      :value="!!store.settings.joiningGroups"
      :handle-toggle-switch="
        (value:boolean) => (store.settings.joiningGroups = value)
      "
      class="mb-7"
    />
    <SettingsSwitch
      title="私聊消息"
      description="接收来自非联系人的消息"
      :value="!!store.settings.privateMessages"
      :handle-toggle-switch="
        (value:boolean) => (store.settings.privateMessages = value)
      "
      class="mb-7"
    />
  </Collapse>
</template>
