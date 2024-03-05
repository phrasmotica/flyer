import { createRouter, createWebHistory } from 'vue-router'

import AdminView from "../views/AdminView.vue"
import HistoryView from "../views/HistoryView.vue"
import HomeView from "../views/HomeView.vue"
import PlayView from "../views/PlayView.vue"
import PlayOffView from "../views/PlayOffView.vue"
import ResultsView from "../views/ResultsView.vue"
import TestView from "../views/TestView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  scrollBehavior: () => {
    window.scrollTo(0, 0)
  },
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
      path: '/playOff',
      name: 'playOff',
      component: PlayOffView,
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
    {
      path: '/admin',
      name: 'admin',
      component: AdminView,
    },
  ]
})

if (process.env.NODE_ENV === 'development') {
  router.addRoute({
    path: '/test',
    name: 'test',
    component: TestView,
  })
}

export default router
