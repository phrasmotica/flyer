import { mainOidc } from "@/auth"

const isDebugEnv = Number(import.meta.env.VITE_IS_DEBUG) === 1
const clockLoggingEnabledEnv = Number(import.meta.env.VITE_ENABLE_CLOCK_LOGGING) === 1
const oidcEnabledEnv = Number(import.meta.env.VITE_ENABLE_OIDC) === 1 && mainOidc !== null

export const useEnv = () => {
    return {
        isDebug: isDebugEnv,
        clockLoggingEnabled: clockLoggingEnabledEnv,
        oidcEnabled: oidcEnabledEnv,
    }
}
