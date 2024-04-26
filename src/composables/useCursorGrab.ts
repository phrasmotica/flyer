import { computed, ref, type CSSProperties } from "vue"

export const useCursorGrab = () => {
    const isGrabbing = ref(false)

    const cursorStyle = computed<CSSProperties>(() => ({
        cursor: isGrabbing.value ? "grabbing" : "grab"
    }))

    const setGrabbing = (v: boolean) => {
        isGrabbing.value = v
    }

    return {
        cursorStyle,
        setGrabbing,
    }
}
