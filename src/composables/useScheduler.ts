import { computed, ref } from "vue"

import type { IScheduler } from "../data/IScheduler"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import { Format, type PhaseSettings } from "../data/PhaseSettings"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"
import { WinnerStaysOnScheduler } from "../data/WinnerStaysOnScheduler"

export const useScheduler = (s: PhaseSettings) => {
    const settings = ref(s)

    const scheduler = computed<IScheduler>(() => {
        if (settings.value.format === Format.Knockout) {
            return new KnockoutScheduler()
        }

        if (settings.value.format === Format.RoundRobin) {
            return new RoundRobinScheduler()
        }

        if (settings.value.format === Format.WinnerStaysOn) {
            return new WinnerStaysOnScheduler()
        }

        throw `Invalid flyer format ${settings.value.format}!`
    })

    return {
        scheduler,
    }
}
