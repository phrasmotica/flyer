import { useCycleList } from "@vueuse/core"
import { computed } from "vue"

export const useZoomLevel = () => {
    const {
        state: currentLevel,
        next: zoomIn,
        prev: zoomOut,
    } = useCycleList([0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2], {
        initialValue: 1,
    })

    const currentPercentage = computed(() => 100 * currentLevel.value)

    return {
        currentLevel,
        currentPercentage,
        zoomIn,
        zoomOut,
    }
}
