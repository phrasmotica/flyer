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

    const raceTos = computed(() => roundNames.value.map((n, i) => ({
        name: n,
        raceTo: settings.value.raceToPerRound[i],
    })))

    const estimatedCost = computed(() => {
        const tablesToUse = settings.value.tables.slice(0, settings.value.tableCount)
        const costPerHour = tablesToUse.map(t => t.costPerHour).reduce((a, b) => a + b, 0)
        return costPerHour * estimatedDurationMinutes.value / 60
    })

    const isInvalid = computed(() => {
        const actualPlayerNames = settings.value.playerNames.slice(0, settings.value.playerCount)
        return actualPlayerNames.some(p => !p)
    })

    return {
        settings,

        durationPerFrame,
        estimatedDurationMinutes,
        roundNames,
        raceTos,
        estimatedCost,

        isInvalid,
    }
}
