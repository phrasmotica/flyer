const isDebugEnv = Number(import.meta.env.VITE_IS_DEBUG) === 1

export const useEnv = () => {
    return {
        isDebug: isDebugEnv,
    }
}