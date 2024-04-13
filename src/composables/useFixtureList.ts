import { computed, ref } from "vue"

import type { Phase } from "@/data/Phase"

export const useFixtureList = (p: Phase | null) => {
    const phase = ref(p)

    const fixtures = computed(() => phase.value?.rounds.flatMap(r => r.fixtures) || [])

    const isComplete = computed(() => fixtures.value.every(x => x.startTime && x.finishTime))
    const remainingCount = computed(() => fixtures.value.filter(f => !f.finishTime && !f.cancelledTime).length)

    const nextFixture = computed(() => fixtures.value.find(f => !f.tableId))

    return {
        fixtures,

        isComplete,
        remainingCount,
        nextFixture,
    }
}
