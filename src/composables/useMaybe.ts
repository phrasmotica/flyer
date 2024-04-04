import { ref } from "vue"

export const useMaybe = <T>(v?: T) => ref<T | null>(v || null)
