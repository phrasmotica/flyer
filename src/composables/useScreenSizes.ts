import { computed } from "vue"
import { breakpointsPrimeFlex, useBreakpoints } from "@vueuse/core"

export const useScreenSizes = () => {
    const {
        smallerOrEqual,
        greaterOrEqual,
    } = useBreakpoints(breakpointsPrimeFlex)

    const isSmallScreen = computed(() => smallerOrEqual("sm").value)

    const isNotSmallScreen = computed(() => greaterOrEqual("md").value)

    return {
        isSmallScreen,
        isNotSmallScreen,
    }
}
