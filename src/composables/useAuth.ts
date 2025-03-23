import { computed } from "vue"

import { mainOidc } from "@/auth"

export const useAuth = () => {
    const accessToken = computed(() => mainOidc?.accessToken || "")
    const isAuthenticated = computed(() => mainOidc?.isAuthenticated || "")
    const userProfile = computed(() => mainOidc?.userProfile || "")

    const signIn = () => {
        if (mainOidc) {
            mainOidc.signIn()
        }
    }

    const signOut = () => {
        if (mainOidc) {
            mainOidc.signOut()
        }
    }

    return {
        accessToken,
        isAuthenticated,
        userProfile,
        signIn,
        signOut,
    }
}
