import { computed, ref } from "vue"

import type { Phase } from "@/data/Phase"

export const useTables = (p: Phase | null) => {
    const phase = ref(p)

    const tables = computed(() => phase.value?.tables || [])

    const costPerHour = computed(() => tables.value.map(t => t.costPerHour).reduce((a, b) => a + b, 0))

    const getTable = (id: string) => tables.value.find(p => p.id === id)

    return {
        tables,

        costPerHour,

        getTable,
    }
}
