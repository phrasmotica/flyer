import { useCycleList } from "@vueuse/core"
import { computed } from "vue"

export const useZoomLevel = (zooms: number[], initialValue: number) => {
    const {
        state: currentLevel,
        next: zoomIn,
        prev: zoomOut,
    } = useCycleList(zooms, { initialValue })

    const currentPercentage = computed(() => 100 * currentLevel.value)

    const minZoom = computed(() => Math.min(...zooms))
    const maxZoom = computed(() => Math.max(...zooms))

    const isMinZoom = computed(() => currentLevel.value === minZoom.value)
    const isMaxZoom = computed(() => currentLevel.value === maxZoom.value)

    return {
        currentLevel,
        currentPercentage,
        minZoom,
        maxZoom,
        isMinZoom,
        isMaxZoom,
        zoomIn,
        zoomOut,
    }
}
