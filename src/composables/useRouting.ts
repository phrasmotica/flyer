import type { LocationQuery, Router } from "vue-router"

export const useRouting = (router: Router, query?: LocationQuery) => {
    const toSetup = () => {
        router.push({
            name: "setup",
        })
    }

    const toPlay = () => {
        router.push({
            name: "play",
        })
    }

    const toPlayHistoric = () => {
        router.push({
            name: "play",
            query: {
                historic: 1,
            },
        })
    }

    const toResults = () => {
        router.push({
            name: "results",
            query,
        })
    }

    const toHistory = () => {
        router.push({
            name: "history",
        })
    }

    const toProfile = () => {
        router.push({
            name: "profile",
        })
    }

    const toAdmin = () => {
        router.push({
            name: "admin",
        })
    }

    return {
        toSetup,
        toPlay,
        toPlayHistoric,
        toResults,
        toHistory,
        toProfile,
        toAdmin,
    }
}
