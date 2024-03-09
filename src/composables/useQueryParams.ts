import { computed } from "vue"
import { useRoute } from "vue-router"

export const useQueryParams = () => {
    const route = useRoute()

    const queryParams = computed(() => route.query)

    const isHistoric = computed(() => Number(route.query.historic) === 1)

    return {
        queryParams,
        isHistoric,
    }
}
