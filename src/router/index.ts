import { createRouter, createWebHistory } from 'vue-router'

import HomeView from "../views/HomeView.vue"
import PlayView from "../views/PlayView.vue"
import ResultsView from "../views/ResultsView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: { name: 'setup' }
    },
    {
      path: '/flyer',
      name: 'setup',
      component: HomeView,
    },
    {
      path: '/flyer/play',
      name: 'play',
      component: PlayView,
    },
    {
      path: '/flyer/results',
      name: 'results',
      component: ResultsView,
    },
  ]
})

export default router
