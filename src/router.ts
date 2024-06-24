import { createRouter, createWebHistory, RouteLocationNormalized } from "vue-router";
import AccessView from "@src/components/views/AccessView/AccessView.vue";
import HomeView from "@src/components/views/HomeView/HomeView.vue";
import PasswordResetView from "@src/components/views/PasswordResetView/PasswordResetView.vue";
import { __TOKEN__ } from "@src/service/base";
import useAuthStore from "@src/store/auth";

const routes = [
  {
    path: "/",
    name: "Home",
    component: HomeView,
  },
  {
    path: "/access/:method/",
    name: "Access",
    component: AccessView,
  },
  {
    path: "/reset/",
    name: "Password Reset",
    component: PasswordResetView,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized) => {
  const authStore = useAuthStore()
  if (to.path !== '/access/sign-in/') {
    if (!authStore.token) {
      return {
        path: '/access/sign-in/'
      }
    }
  }

  if (to.path === '/access/sign-in/') {
    if (authStore.token) {
      return { name: 'Home' }
    }
  }

})
export default router;
