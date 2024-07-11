<script setup lang="ts">
import NoNotifications from '@src/components/states/empty-states/NoNotifications.vue'
import Loading1 from '@src/components/states/loading-states/Loading1.vue'
import SidebarHeader from '@src/components/views/HomeView/Sidebar/SidebarHeader.vue'
import useChatStore from '@src/store/chat'
import { computed, ref, watchEffect } from 'vue'
import { IFriendRequest } from '@src/typeV2'
import Typography from '@src/components/ui/data-display/Typography.vue'
import Button from '@src/components/ui/inputs/Button.vue'
import { showToast } from '@src/assets/utils'

const chatStore = useChatStore()
const noData = ref(false)
const friendRequestList = computed(() => chatStore.friendRequestList)
const groupJoinRequestList = computed(() => chatStore.groupJoinRequestList)

async function handleAccept(item: IFriendRequest) {
  const { err, data } = await chatStore.acceptFriend({ apply_id: item.id })
  if (err) {
    return
  }
  await chatStore.refreshFriendList()
  await chatStore.refreshFriendRequestList()
}

async function handleDelete(item: IFriendRequest) {
  const { err, data } = await chatStore.deleteFriendRequest({ id: item.id })
  if (err) {
    return
  }
  await chatStore.refreshFriendRequestList()
}

watchEffect(() => {
  if (chatStore.status === 'success') {
    chatStore.refreshFriendRequestList()
    chatStore.refreshGroupJoinRequests()
  }
})

async function handleApprove(id: string) {
  const { err, msg } = await chatStore.approveGroupJoinRequest({ id })
  showToast({ text: msg, icon: err ? 'error' : 'error'})
  chatStore.refreshGroupJoinRequests().then()
}
async function handleReject(id: string) {
  const { err, msg } = await chatStore.rejectGroupJoinRequest({ id })
  showToast({ text: msg, icon: err ? 'error' : 'error'})
  chatStore.refreshGroupJoinRequests().then()
}
</script>

<template>
  <div>
    <SidebarHeader>
      <template v-slot:title>通知</template>
    </SidebarHeader>

    <div
      class="w-full h-full scroll-smooth scrollbar-hidden"
      style="overflow-x: visible; overflow-y: scroll"
    >
      <Loading1 v-if="chatStore.status === 'loading'" v-for="item in 6" />
      <div v-for="item in friendRequestList">
        <button class="w-full p-5 flex outline-none" :key="item.id">
          <!--profile image-->
          <div class="mr-4">
            <div
              :style="{
                backgroundImage: `url(${item.avatar})`
              }"
              class="w-7 h-7 rounded-full bg-cover bg-center"
            ></div>
          </div>
          <div class="grow text-left">
            <div class="flex justify-between items-center mb-4">
              <Typography variant="heading-2">
                {{ item.nickname }}
              </Typography>

              <Typography variant="body-2" v-if="item.text === '查看'">
                未处理
              </Typography>
            </div>
            <Typography variant="body-2" v-if="item.content"
              >{{ item.content }}
            </Typography>
            <Typography variant="body-2" v-else>无验证消息</Typography>
          </div>
        </button>
        <div class="flex justify-end" v-if="item.text === '查看'">
          <Button class="px-5 bg-indigo-400" @click="handleDelete(item)">
            删除
          </Button>
          <Button class="ml-5 px-5 bg-indigo-400" @click="handleAccept(item)">
            接受
          </Button>
        </div>
      </div>
      <div v-for="item in groupJoinRequestList">
        <button class="w-full p-5 flex outline-none" :key="item.id">
          <!--profile image-->
          <div class="mr-4">
            <div
              :style="{
                backgroundImage: `url(${item.avatar})`
              }"
              class="w-7 h-7 rounded-full bg-cover bg-center"
            ></div>
          </div>
          <div class="grow text-left">
            <div class="flex justify-between items-center mb-4">
              <Typography variant="heading-2">
                {{ item.nickname }}
              </Typography>

              <Typography variant="body-2">
                {{ item.text }}
              </Typography>
            </div>
            <Typography variant="body-2" v-if="item.content"
              >{{ item.content }}
            </Typography>
            <Typography variant="body-2" v-else>无验证消息</Typography>
          </div>
        </button>
        <div class="flex justify-end" v-if="item.status === 0">
          <Button class="px-5 bg-indigo-400" @click="handleReject(item.id)">
            拒绝
          </Button>
          <Button
            class="px-5 bg-indigo-400 ml-5"
            @click="handleApprove(item.id)"
          >
            接受
          </Button>
        </div>
      </div>

      <NoNotifications v-if="noData" />
    </div>
  </div>
</template>
