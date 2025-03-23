import { createRouter, createWebHistory } from 'vue-router'

import { mainOidc } from "@/auth"

import AdminView from "../views/AdminView.vue"
import HistoryView from "../views/HistoryView.vue"
import HomeView from "../views/HomeView.vue"
import PlayView from "../views/PlayView.vue"
import ProfileView from "../views/ProfileView.vue"
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

if (process.env.NODE_ENV === 'development') {
    router.addRoute({
        path: '/test',
        name: 'test',
        component: TestView,
    })
}

if (mainOidc) {
    router.addRoute({
        path: '/profile',
        name: 'profile',
        component: ProfileView,
        meta: {
            authName: mainOidc.authName,
        },
    })

    router.addRoute({
        path: '/admin',
        name: 'admin',
        component: AdminView,
        meta: {
            authName: mainOidc.authName,
        },
    })

    mainOidc.useRouter(router)
}
else {
    router.addRoute({
        path: '/admin',
        name: 'admin',
        component: AdminView,
    },)
}

export default router
