import { jwtDecode, type JwtPayload } from "jwt-decode"
import { computed } from "vue"

import { useAuth } from "./useAuth"

export const useJwt = () => {
    const auth = useAuth()

    const token = computed(() => {
        try {
            // we need to manually decode the token to get its custom KC roles.
            return jwtDecode<JwtToken>(auth.accessToken.value || "")
        }
        catch {
            return null
        }
    })

    const roles = computed(() => token.value?.resource_access["flyer-frontend"]?.roles || [])

    const rolesText = computed(() => {
        if (roles.value.length <= 0) {
            return "none"
        }

        return roles.value.join(", ")
    })

    const isSuperuser = computed(() => roles.value.includes("superuser"))

    return {
        roles,
        rolesText,
        isSuperuser,
    }
}

interface JwtToken extends JwtPayload {
    resource_access: {
        "flyer-frontend": {
            roles: string[]
        } | undefined
    }
}
