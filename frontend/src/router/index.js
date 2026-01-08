import { createRouter, createWebHistory } from 'vue-router'
import HomePageView from '@/views/HomePage.vue'
import GamePage from '@/views/GamePage.vue'
import testPage from "@/views/testPage.vue";

const routes = [
    { path: '/', name: 'home', component: HomePageView },
    { path: '/game', name: 'game', component: GamePage },
    {path: '/test', name: 'test', component: testPage },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
