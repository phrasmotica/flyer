import { type Ref, ref } from "vue"

export const useStringToggle = (initial: string) => {
    const val = ref(initial)

    const setVal = (value: string) => {
        // unsets the value if the incoming value is the same
        if (val.value === value) {
            val.value = ""
        }
        else {
            val.value = value
        }
    }

    return <[Ref<string>, (value: string) => void]>[val, setVal]
}
