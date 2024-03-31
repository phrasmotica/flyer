import { computed, ref } from "vue"

import { useScheduler } from "./useScheduler"

import type { FlyerSettings } from "../data/FlyerSettings"

export const useSettings = (s: FlyerSettings) => {
    const settings = ref(s)

    const {
        scheduler,
    } = useScheduler(s.specification)

    const durationPerFrame = computed(() => scheduler.value.frameTimeEstimateMins)

    const estimatedDurationMinutes = computed(() => scheduler.value.estimateDuration(settings.value))

    const roundNames = computed(() => scheduler.value.computeRoundNames(settings.value))

    const costPerHour = computed(() => {
        const tablesToUse = settings.value.tables.slice(0, settings.value.tableCount)
        const meanCostPerHour = tablesToUse.map(t => t.costPerHour).reduce((a, b) => a + b, 0) / tablesToUse.length
        return meanCostPerHour * settings.value.tableCount
    })

    const estimatedCost = computed(() => costPerHour.value * estimatedDurationMinutes.value / 60)

    const isInvalid = computed(() => {
        const actualPlayerNames = settings.value.playerNames.slice(0, settings.value.playerCount)
        return actualPlayerNames.some(p => !p)
    })

    return {
        settings,

        durationPerFrame,
        estimatedDurationMinutes,
        roundNames,
        estimatedCost,

        isInvalid,
    }
}
