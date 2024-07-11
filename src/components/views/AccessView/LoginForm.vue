<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

import Typography from '@src/components/ui/data-display/Typography.vue'
import Button from '@src/components/ui/inputs/Button.vue'
import IconButton from '@src/components/ui/inputs/IconButton.vue'
import TextInput from '@src/components/ui/inputs/TextInput.vue'
import { EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import { useRouter } from 'vue-router'
import { ILogin } from '@src/typeV2'
import { getThemes, login } from '@src/service'
import useThemeStore from '@src/store/theme'
import useChatStore from '@src/store/chat'
import useAuthStore from '@src/store/auth'
import { showModal, showToast } from '@src/assets/utils'
import ScrollBox from '@src/components/ui/utils/ScrollBox.vue'

const showPassword = ref(false)
const themeStore = useThemeStore()
const chatStore = useChatStore()
const authStore = useAuthStore()
const router = useRouter()
const themes = computed(() => themeStore.themes)
const activeIndex = ref(0)
const open = computed(() => authStore.token && themes.value.length > 1)

const loginForm = reactive<ILogin>({ username: '你好', password: '123456' })

async function handleLogin() {
  if (!loginForm.username) {
    showToast({ text: '输入您的用户名或邮箱', icon: 'warning' })
    return
  }
  if (!loginForm.password) {
    showToast({ text: '输入您的密码', icon: 'warning' })
    return
  }
  try {
    const res = await login(loginForm)
    if (res.err) {
      showToast({ text: res.msg, icon: 'error' })
      return
    }
    authStore.userinfo = res.data.userinfo
    authStore.token = res.data.userinfo.token
    const themesRes = await getThemes()
    if (themesRes.err) {
      showToast({ text: themesRes.msg, icon: 'error' })
      return
    }
    const inviteCodeList = themesRes.data.merchant
    if (!inviteCodeList || !inviteCodeList.length) {
      await showModal({ text: '这个账户没有邀请码！', icon: 'error' })
      return
    }
    themeStore.setThemes(inviteCodeList)
    if (inviteCodeList.length === 1) {
      chatStore.refreshChat((authStore.code = inviteCodeList[0].code)).then()
      await router.push({ name: 'Home' })
      return
    }
  } catch (e) {}
}

function handleConfirm() {
  authStore.code = themes.value[activeIndex.value].code
  chatStore.refreshChat(authStore.code).then()
  router.push({ name: 'Home' })
}

function handleLogout() {
  authStore.token = ''
  authStore.userinfo = undefined
}
</script>

<template>
  <div
    class="p-5 md:basis-1/2 xs:basis-full flex flex-col justify-center items-center"
  >
    <div class="w-full md:px-[26%] xs:px-[10%]" v-if="!open">
      <!--header-->
      <div class="mb-6 flex flex-col">
        <img
          src="@src/assets/vectors/logo-gradient.svg"
          class="w-[22px] h-[18px] mb-4 opacity-70"
          alt="bird logo"
        />
        <Typography variant="heading-2" class="mb-4">欢迎回来 趴窝</Typography>
        <Typography variant="body-3" class="text-opacity-75 font-light">
          登录您的账户并选择一个邀请码!
        </Typography>
      </div>

      <!--form-->
      <div class="mb-6">
        <TextInput
          label="用户名/邮箱"
          placeholder="输入您的用户名或邮箱"
          class="mb-5"
          :value="loginForm.username"
          @value-changed="$event = loginForm.username = $event"
        />
        <TextInput
          label="密码"
          placeholder="输入您的密码"
          :type="showPassword ? 'text' : 'password'"
          class="pr-[40px]"
          :value="loginForm.password"
          @value-changed="$event = loginForm.password = $event"
        >
          <template v-slot:endAdornment>
            <IconButton
              title="toggle password visibility"
              aria-label="toggle password visibility"
              class="m-[8px] p-2"
              @click="showPassword = !showPassword"
            >
              <EyeSlashIcon
                v-if="showPassword"
                class="w-5 h-5 text-black opacity-50 dark:text-white dark:opacity-60"
              />
              <EyeIcon
                v-else
                class="w-5 h-5 text-black opacity-50 dark:text-white dark:opacity-60"
              />
            </IconButton>
          </template>
        </TextInput>
      </div>

      <!--local controls-->
      <div class="mb-6">
        <Button class="w-full mb-4" @click="handleLogin">登录</Button>
      </div>
    </div>
    <div class="w-full">
      <div
        class="w-[400px] mx-auto bg-white dark:bg-gray-800 rounded py-6 shadow-lg"
        v-if="open"
      >
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
        </div>
        <ScrollBox class="overflow-y-scroll max-h-[400px]">
          <div
            class="w-full p-5 flex transition duration-200 ease-out outline-none cursor-pointer"
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
        </ScrollBox>

        <!--submit button-->
        <div class="px-5 mt-5">
          <Button class="w-full py-4" @click="handleConfirm">确定</Button>
        </div>
        <div class="px-5 mt-5">
          <Button color="danger" class="w-full py-4" @click="handleLogout"
            >退出登录
          </Button>
        </div>
      </div>
    </div>
  </div>
</template>
