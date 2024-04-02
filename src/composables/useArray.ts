import { type Ref, ref } from "vue"

export const useArray = <T>(initial?: T[]) => {
    const arr = ref(initial || []) as Ref<T[]>

    const push = (value: T) => {
        arr.value = [...arr.value, value]
    }

    const set = (value: T, index: number) => {
        arr.value = arr.value.map((v, i) => i === index ? value : v)
    }

    const includes = (value: T) => arr.value.includes(value)

    const clear = () => {
        arr.value = []
    }

    return {
        arr,
        push,
        set,
        includes,
        clear,
    }
}
