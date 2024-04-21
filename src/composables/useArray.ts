import { type Ref, ref, computed, type MaybeRefOrGetter } from "vue"

export const useArray = <T>(initial?: MaybeRefOrGetter<T[]>) => {
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

export const useArrayGroupBy = <T, TKey extends string = string>(
    initial: MaybeRefOrGetter<T[]>,
    selector: (x: T) => TKey,
) => {
    const {
        arr,
    } = useArray<T>(initial)

    // adapted from https://stackoverflow.com/a/47752730
    const groupedMap = computed(() => arr.value.reduce(
        (entryMap, e) => entryMap.set(selector(e), [...entryMap.get(selector(e)) || [], e]),
        new Map<TKey, T[]>()
    ))

    return groupedMap
}
