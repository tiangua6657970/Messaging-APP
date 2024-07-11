<script setup lang="ts">
import Typography from '@src/components/ui/data-display/Typography.vue'
import ScrollBox from '@src/components/ui/utils/ScrollBox.vue'
import Modal from '@src/components/ui/utils/Modal.vue'
import Button from '@src/components/ui/inputs/Button.vue'
import { ref, watch } from 'vue'
import useChatStore from '@src/store/chat'
import { IFriendRequest } from '@src/typeV2'
import { ossURL } from '@src/service/config'
// TODO: newFriendModal await delete
const chatStore = useChatStore()
const props = defineProps<{
  open: boolean
  closeModal: () => void
}>()

const list = ref<IFriendRequest[]>([])

watch(
  () => props.open,
  newVal => {
    if (newVal) {
      chatStore.getFriendRequestList().then(res => {
        if (res.err) {
          return
        }
        list.value = res.data
      })
    }
  }
)

async function handleAccept(item: IFriendRequest) {
  const { err, data } = await chatStore.acceptFriend({ apply_id: item.id })
  if (err) {
    return
  }
  props.closeModal()
  await chatStore.refreshFriendList()
}
</script>

<template>
  <Modal :open="props.open" :close-modal="props.closeModal">
    <template v-slot:content>
      <div class="w-[400px] py-6 bg-white dark:bg-gray-800 rounded">
        <!--header-->
        <div class="mb-6 px-5 flex justify-between items-center">
          <Typography id="modal-title" variant="heading-1" tabindex="0">
            好友验证
          </Typography>

          <Button
            @click="props.closeModal"
            variant="outlined"
            color="danger"
            typography="body-4"
          >
            esc
          </Button>
        </div>
        <!--message-->
        <ScrollBox class="max-h-[230px] overflow-y-scroll">
          <button
            class="w-full p-5 flex outline-none"
            v-for="item in list"
            :key="item.id"
          >
            <!--profile image-->
            <div class="mr-4">
              <div
                :style="{
                  backgroundImage: `url(${item.avatar})`
                }"
                class="w-7 h-7 rounded-full bg-cover bg-center"
              ></div>
            </div>

            <!--name and message-->
            <div class="grow">
              <div class="flex flex-col items-start">
                <Typography variant="heading-2" class="mb-4">
                  {{ item.nickname }}
                </Typography>

                <Typography variant="body-2" v-if="item.content">{{
                  item.content
                }}</Typography>
                <Typography variant="body-2" v-else>无验证消息</Typography>
              </div>
            </div>

            <!--message date-->
            <div>
              <Button
                class="px-5 bg-indigo-400"
                @click="handleAccept(item)"
                v-if="item.text === '查看'"
              >
                接受
              </Button>
              <p
                class="opacity-60 font-light text-xs leading-4 tracking-[0.16px]"
                v-else
              >
                <Typography variant="body-4"> {{ item.text }} </Typography>
              </p>
            </div>
          </button>
        </ScrollBox>
      </div>
    </template>
  </Modal>
</template>

<style scoped></style>