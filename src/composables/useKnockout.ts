import type { OrganizationChartNode } from "primevue/organizationchart"
import { computed } from "vue"


import type { Phase } from "@/data/Phase"
import { usePhaseSpecification } from "./useSpecification"

export const useKnockout = (p: Phase | null) => {
    const {
        isKnockout,
    } = usePhaseSpecification(p)

    const bracketData = computed<OrganizationChartNode>(() => {
        if (!isKnockout.value) {
            return <OrganizationChartNode>{}
        }

        return {
            key: "final-0",
            label: "Final",
            children: [
                {
                    key: "semi-final-0",
                    label: "Semi-Final 1",
                    children: [],
                },
                {
                    key: "semi-final-1",
                    label: "Semi-Final 2",
                    children: [],
                },
            ],
        }
    })

    return {
        bracketData,
    }
}
