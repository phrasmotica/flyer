import { computed, ref } from "vue"
import type { MeterItem } from "primevue/metergroup"

import { usePhaseSettings } from "./usePhaseSettings"

import { MoneySplit, type PhaseSettings } from "../data/PhaseSettings"

export const usePrizes = (p: PhaseSettings, c: number) => {
    const playerCount = ref(c)

    const {
        settings,
        isKnockout,
    } = usePhaseSettings(p)

    const prizePot = computed(() => playerCount.value * settings.value.entryFee)

    const prizeMonies = computed(() => {
        if (!settings.value.entryFeeRequired) {
            return []
        }

        if (settings.value.moneySplit === MoneySplit.SeventyThirty) {
            const winnerPrize = roundX(prizePot.value * 0.7, 5)
            return [winnerPrize, prizePot.value - winnerPrize]
        }

        if (settings.value.moneySplit === MoneySplit.SixtyTwentyFiveFifteen) {
            const winnerPrize = roundX(prizePot.value * 0.6, 5)
            const runnerUpPrize = roundX(prizePot.value * 0.25, 5)
            return [winnerPrize, runnerUpPrize, prizePot.value - winnerPrize - runnerUpPrize]
        }

        if (settings.value.moneySplit === MoneySplit.SemiFinalists) {
            const winnerPrize = roundX(prizePot.value * 0.55, 5)
            const runnerUpPrize = roundX(prizePot.value * 0.25, 5)
            const semiFinalistPrize = (prizePot.value - winnerPrize - runnerUpPrize) / 2
            return [winnerPrize, runnerUpPrize, semiFinalistPrize, semiFinalistPrize]
        }

        return [prizePot.value]
    })

    const roundX = (v: number, multiple: number) => {
        return Math.round(v / multiple) * multiple
    }

    // LOW: vary colours and labels depending on the flyer format and
    // relative amount of winnings for each place in the standings. E.g. if the
    // two losing semi-finalists in a knockout tournament each win the same
    // amount, perhaps their prize colours should be the same?
    const prizeColours = computed(() => ["#ffd700", "#c0c0c0", "#a0522d", "#c084fc"])

    const prizeLabels = computed(() => {
        if (isKnockout.value) {
            return [
                "Winner",
                "Runner-Up",
                "Semi-Finalist 1", "Semi-Finalist 2",
                "Quarter-Finalist 1", "Quarter-Finalist 2", "Quarter-Finalist 3", "Quarter-Finalist 4"
            ]
        }

        return ["Winner", "Runner-Up", "3rd Place", "4th Place", "5th Place", "6th Place", "7th Place", "8th Place"]
    })

    const prizeMoniesMeterItems = computed(() => prizeMonies.value.map<MeterItem>((x, i) => ({
        icon: "",
        color: prizeColours.value[Math.min(i, prizeColours.value.length - 1)],
        label: prizeLabels.value[i],
        value: x,
    })))

    return {
        prizePot,
        prizeMonies,
        prizeColours,
        prizeMoniesMeterItems,
    }
}
