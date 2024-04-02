import { ref, watch, type Ref, computed } from "vue"

export const useTimedRef = <T>(timeoutMs: number, initial: T) => {
    const value = ref(initial) as Ref<T>

    const isRaised = computed(() => value.value !== initial)

    watch(value, () => {
        if (value.value !== initial) {
            setTimeout(() => {
                value.value = initial
            }, timeoutMs)
        }
    })

    return {
        value,
        isRaised,
    }
}
