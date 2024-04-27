import { computed, ref } from "vue"

export const useCursorGrab = () => {
    const isGrabbing = ref(false)

    const cursorClass = computed(() => isGrabbing.value ? "grabbing" : "grab")

    const setGrabbing = (v: boolean) => {
        isGrabbing.value = v
    }

    return {
        cursorClass,
        setGrabbing,
    }
}
