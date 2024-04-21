import { computed, ref } from "vue"
import type { MeterItem } from "primevue/metergroup"

import { useSpecification } from "./usePhaseSettings"

import { MoneySplit, type PhaseSettings } from "@/data/PhaseSettings"

export const usePrizes = (s: PhaseSettings, c: number) => {
    const playerCount = ref(c)

    const {
        settings,
        isKnockout,
    } = useSpecification(s)

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
                "prizePot.winner",
                "prizePot.runnerUp",
                "prizePot.semiFinalist", "prizePot.semiFinalist",
                "prizePot.quarterFinalist", "prizePot.quarterFinalist", "prizePot.quarterFinalist", "prizePot.quarterFinalist"
            ]
        }

        return [
            "prizePot.winner",
            "prizePot.runnerUp",
            // LOW: do localisation with "Nst/Nnd/Nrd/Nth" in different languages
            "prizePot.pos3", "prizePot.pos4",
            "prizePot.pos5", "prizePot.pos6", "prizePot.pos7", "prizePot.pos8"
        ]
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
