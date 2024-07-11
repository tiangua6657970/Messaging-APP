<script setup lang="ts">
import { MinusIcon, PlusIcon } from '@heroicons/vue/24/outline'
import ChatInfoSettings from '@src/components/views/HomeView/Chat/ChatInfoSettings/ChatInfoSettings.vue'
import useChatStore from '@src/store/chat'
import useActionStore from '@src/store/action'
import useComposeStore from '@src/store/compose'
import { IMember } from '@src/typeV2'
import Swal from 'sweetalert2'
import { computed, watch } from 'vue'

const chatStore = useChatStore()
const currentChatInfo= computed(() => chatStore.currentChatInfo)
const actionStore = useActionStore()
const composeStore = useComposeStore()
// TODO: IMember
function handleMemberItemClick(item: IMember) {
  if (currentChatInfo.value.type === 1 && !currentChatInfo.value.is_action && !currentChatInfo.value.can_add_friend) {
    Swal.fire({
      title: '该群不允许查看用户信息！',
      icon: 'info',
      timer: 1500
    }).then()
    return
  }
  actionStore.handleOpenContactInfo(item)
}

watch(() => chatStore.conversationOpen, newVal => {
  if (!newVal) {
    actionStore.openChatInfo = false
  }
})
</script>

<template>
  <transition name="slide">
    <div v-if="actionStore.openChatInfo" class="fixed inset-0 overflow-hidden">
      <div class="absolute inset-0 overflow-hidden">
        <div
          class="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10"
        >
          <transition name="slide">
            <div class="pointer-events-auto relative w-screen max-w-md">
              <!-- Close button -->
              <div
                class="absolute left-0 top-0 -ml-8 flex pr-2 pt-4 sm:-ml-10 sm:pr-4"
              >
                <button
                  @click="actionStore.openChatInfo = false"
                  type="button"
                  class="relative rounded-md text-gray-300 hover:text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <span class="absolute -inset-2.5"></span>
                  <span class="sr-only">Close panel</span>
                  <svg
                    class="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="1.5"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <!-- Panel content -->
              <div
                class="flex h-full flex-col overflow-y-scroll bg-white py-6 shadow-xl dark:bg-gray-800 overflow-y-scroll scrollbar:!w-1.5 scrollbar:!h-1.5 scrollbar:bg-transparent scrollbar-track:!bg-slate-100 scrollbar-thumb:!rounded scrollbar-thumb:!bg-slate-300 scrollbar-track:!rounded dark:scrollbar-track:!bg-slate-500/[0.16] dark:scrollbar-thumb:!bg-slate-500/50 lg:supports-scrollbars:pr-2"
              >
                <div class="px-4 sm:px-6">
                  <h2
                    class="text-base font-semibold leading-6 text-gray-900 dark:text-white"
                    id="slide-over-title"
                  >
                    详情
                  </h2>
                </div>
                <div class="relative mt-6 flex-1 px-4 sm:px-6">
                  <!-- Your content -->
                  <div
                    class="grid grid-cols-5 gap-2"
                    v-if="chatStore.currentChatInfo.member"
                  >
                    <div
                      class="p-4"
                      v-for="item in chatStore.currentChatInfo.member"
                      :key="item.user_id"
                    >
                      <div class="flex-col flex justify-center items-center">
                        <div class="flex-shrink-0">
                          <a href="#" class="relative block" @click="handleMemberItemClick(item)">
                            <img
                              alt="profil"
                              :src="item.avatar"
                              class="mx-auto object-cover rounded-full h-8 w-8"
                            />
                          </a>
                        </div>
                        <div class="mt-2 text-center flex flex-col">
                          <span class="text-xs text-gray-400 line-clamp-1">
                            {{ item.show_name || item.user_id }}
                          </span>
                        </div>
                      </div>
                    </div>
                    <template v-if="currentChatInfo.type === 1">
                      <div
                        class="p-4"
                        @click="composeStore.selectContactOpen = true"
                      >
                        <div class="flex-col flex justify-center items-center">
                          <div class="flex-shrink-0">
                            <a href="#" class="relative block">
                              <PlusIcon class="h-8 w-8 text-gray-400" />
                            </a>
                          </div>
                          <div class="mt-2 text-center flex flex-col">
                            <span class="text-xs text-gray-400"> 邀请好友 </span>
                          </div>
                        </div>
                      </div>
                      <div
                        class="p-4"
                        @click="composeStore.kickOutGroupModalOpen = true"
                        v-if="currentChatInfo.type === 1 && currentChatInfo.is_action"
                      >
                        <div class="flex-col flex justify-center items-center">
                          <div class="flex-shrink-0">
                            <a href="#" class="relative block">
                              <MinusIcon class="h-8 w-8 text-gray-400" />
                            </a>
                          </div>
                          <div class="mt-2 text-center flex flex-col">
                            <span class="text-xs text-gray-400"> 踢出成员 </span>
                          </div>
                        </div>
                      </div>
                    </template>
                  </div>
                  <div class="m-6">
                    <!--<SettingsAccordion />-->
                    <ChatInfoSettings />
                  </div>
                </div>
              </div>
            </div>
          </transition>
        </div>
      </div>
    </div>
  </transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 500ms ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-enter-active,
.slide-leave-active {
  transition: transform 500ms ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateX(100%);
}
</style>