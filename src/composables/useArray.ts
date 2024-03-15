import { type Ref, ref } from "vue"

export const useArray = <T>(initial?: T[]) => {
    const arr = ref(initial || []) as Ref<T[]>

    const push = (value: T) => {
        arr.value = [...arr.value, value]
    }

    const clear = () => {
        arr.value = []
    }

    return <[
        Ref<T[]>,
        (value: T) => void,
        () => void,
    ]>[
        arr,
        push,
        clear,
    ]
}
