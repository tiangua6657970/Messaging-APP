import { defineStore } from 'pinia'
import { ref } from 'vue'
import { IUserinfo } from '@src/typeV2'

const useAuthStore = defineStore(
  'authStore',
  () => {
    const token = ref('')
    const userinfo = ref<IUserinfo>()
    const code = ref('')
    return {
      token,
      code,
      userinfo
    }
  },
  {
    persist: {
      paths: ['token', 'userinfo', 'code']
    }
  }
)

export default useAuthStore