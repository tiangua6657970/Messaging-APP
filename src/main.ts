import router from "@src/router";
import "@src/style.css";
import { createPinia } from "pinia";
import { createApp } from "vue";
import vClickOutside from "click-outside-vue3";
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'

import App from "@src/App.vue";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate)


createApp(App).use(pinia).use(router).use(vClickOutside).mount("#app");
