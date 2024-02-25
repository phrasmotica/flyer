import { createRouter, createWebHistory } from 'vue-router'

import HistoryView from "../views/HistoryView.vue"
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
      path: '/setup',
      name: 'setup',
      component: HomeView,
    },
    {
      path: '/play',
      name: 'play',
      component: PlayView,
    },
    {
      path: '/results',
      name: 'results',
      component: ResultsView,
    },
    {
      path: '/history',
      name: 'history',
      component: HistoryView,
    },
  ]
})

export default router
