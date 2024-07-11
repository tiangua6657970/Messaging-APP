<script setup lang="ts">
import type { IContactGroup, IFriend } from '@src/typeV2'
import type { Ref } from 'vue'
import { ref } from 'vue'

import {
  EllipsisVerticalIcon,
  InformationCircleIcon,
  PaperAirplaneIcon,
  TrashIcon
} from '@heroicons/vue/24/outline'
import Typography from '@src/components/ui/data-display/Typography.vue'
import IconButton from '@src/components/ui/inputs/IconButton.vue'
import Dropdown from '@src/components/ui/navigation/Dropdown/Dropdown.vue'
import DropdownLink from '@src/components/ui/navigation/Dropdown/DropdownLink.vue'
import useChatStore from '@src/store/chat'
import useActionStore from '@src/store/action'
import Swal from 'sweetalert2'
import ContactItemV2 from '@src/components/shared/blocks/ContactItemV2.vue'

const props = defineProps<{
  contactGroups: IContactGroup[]
  bottomEdge?: number
}>()

const chatStore = useChatStore()
const actionStore = useActionStore()

// the position of the dropdown menu.
const dropdownMenuPosition = ref(['top-6', 'right-0'])

// controll the states of contact dropdown menus
const dropdownMenuStates: Ref<boolean[][]> = ref(
  props.contactGroups.map(contactGroup => {
    return contactGroup.data.map(() => false)
  })
)

// close all contact dropdown menus
const handleCloseAllMenus = () => {
  dropdownMenuStates.value = props.contactGroups.map(contactGroup => {
    return contactGroup.data.map(() => false)
  })
}

// (event) open/close the selected dropdown menu.
const handleToggleDropdown = (
  event: Event,
  groupIndex: number,
  index: number
) => {
  if (props.bottomEdge) {
    let buttonBottom = (
      event.currentTarget as HTMLElement
    ).getBoundingClientRect().bottom

    if (buttonBottom >= props.bottomEdge - 75) {
      dropdownMenuPosition.value = ['bottom-6', 'right-0']
    } else {
      dropdownMenuPosition.value = ['top-6', 'right-0']
    }
  }

  dropdownMenuStates.value = (dropdownMenuStates.value as boolean[][]).map(
    group => {
      return group.map((value, idx) => {
        if (idx === index) return value
        else return false
      })
    }
  )

  dropdownMenuStates.value[groupIndex][index] = !(
    dropdownMenuStates.value as boolean[][]
  )[groupIndex][index]
}

// (event) close doprdown menu when clicking outside
const handleClickOutside = (event: Event) => {
  let target = event.target as HTMLElement
  let parentElement = target.parentElement as HTMLElement
  if (
    target &&
    !target.classList.contains('open-menu') &&
    !(parentElement && parentElement.classList.contains('open-menu'))
  ) {
    handleCloseAllMenus()
  }
}

function handleDelete(contact: IFriend) {
  Swal.fire({
    title: '系统提示',
    text: '确定删除这个好友吗？',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#3085d6',
    cancelButtonColor: '#d33',
    confirmButtonText: '是的，删除',
    cancelButtonText: '取消',
    keydownListenerCapture: true
  }).then(async result => {
    if (result.isConfirmed) {
      const { err, data } = await chatStore.deleteFriend({
        user_id: contact.user_id
      })
      if (err) {
        return
      }
      Swal.fire({
        title: '好友已删除!',
        icon: 'success'
      }).then()
      chatStore.refreshFriendList().then()
      chatStore.refreshChatList().then()
    }
  })
}

async function handleSelect(contact: IFriend, event?: Event) {
  if (event) {
    const target = event.target as HTMLDivElement
    if (target.classList.contains('fixed')) {
      return
    }
  }

  const { err, data } = await chatStore.getListId({ user_id: contact.user_id })
  if (err) {
    return
  }
  chatStore.activeConversationId = data.list_id
  chatStore.conversationOpen = 'open'
}
</script>

<template>
  <div v-for="(group, groupIndex) in props.contactGroups" :key="groupIndex">
    <!--group title-->
    <Typography variant="heading-3" class="w-full px-5 pb-3 pt-5">
      {{ group.letter }}
    </Typography>

    <ContactItemV2
      class="cursor-pointer"
      :data-j="`contactItem-${groupIndex}-${index}`"
      @click="handleSelect(contact, $event)"
      v-for="(contact, index) in group.data"
      :contact="contact"
      :key="index"
    >
      <template v-slot:menu>
        <div class="relative">
          <!--dropdown menu button-->
          <IconButton
            :id="'open-contact-menu-' + index"
            :aria-expanded="dropdownMenuStates[groupIndex][index]"
            :aria-controls="'contact-menu-' + index"
            @click.stop="
              event => handleToggleDropdown(event, groupIndex, index)
            "
            class="open-menu w-6 h-6"
            title="toggle contact menu"
            aria-label="toggle contact menu"
          >
            <EllipsisVerticalIcon
              class="open-menu h-5 w-5 text-black opacity-60 dark:text-white dark:opacity-70"
              tabindex="0"
            />
          </IconButton>

          <Dropdown
            :id="'contact-menu-' + index"
            :close-dropdown="handleCloseAllMenus"
            :handle-click-outside="handleClickOutside"
            :aria-labelledby="'open-contact-menu-' + index"
            :show="Boolean(dropdownMenuStates[groupIndex][index])"
            :position="dropdownMenuPosition"
          >
            <DropdownLink
              :handle-click="
                () => {
                  handleSelect(contact)
                  handleCloseAllMenus()
                }
              "
            >
              <PaperAirplaneIcon class="h-5 w-5 mr-3" />
              打开会话
            </DropdownLink>
            <DropdownLink
              :handle-click="
                () => {
                  actionStore.handleOpenContactInfo(contact)
                  handleCloseAllMenus()
                }
              "
            >
              <InformationCircleIcon
                class="h-5 w-5 mr-3 text-black opacity-60 dark:text-white dark:opacity-70"
              />
              好友信息
            </DropdownLink>

            <DropdownLink
              color="danger"
              :handle-click="
                () => {
                  handleDelete(contact)
                  handleCloseAllMenus()
                }
              "
            >
              <TrashIcon class="h-5 w-5 mr-3" />
              删除好友
            </DropdownLink>
          </Dropdown>
        </div>
      </template>
    </ContactItemV2>
  </div>
</template>