import { defineStore } from "pinia";
import { ref } from "vue";
import { ITheme } from "@src/typeV2";

const useThemeStore = defineStore('themeStore', () => {
  const themes = ref<ITheme[]>([])
  function setThemes(list: ITheme[]) {
    themes.value = list
  }
  return {
    themes,
    setThemes
  }
}, {
  persist: {
    paths: ['themes']
  }
})
export default useThemeStore
