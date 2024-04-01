const isDebugEnv = Number(import.meta.env.VITE_IS_DEBUG) === 1
const clockLoggingEnabledEnv = Number(import.meta.env.VITE_ENABLE_CLOCK_LOGGING) === 1

export const useEnv = () => {
    return {
        isDebug: isDebugEnv,
        clockLoggingEnabled: clockLoggingEnabledEnv,
    }
}
