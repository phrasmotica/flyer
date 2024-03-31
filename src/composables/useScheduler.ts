import { computed, ref } from "vue"

import type { FlyerSettings } from "../data/FlyerSettings"
import type { IScheduler } from "../data/IScheduler"
import { KnockoutScheduler } from "../data/KnockoutScheduler"
import { Format, type PhaseSettings } from "../data/PhaseSettings"
import { RoundRobinScheduler } from "../data/RoundRobinScheduler"
import { WinnerStaysOnScheduler } from "../data/WinnerStaysOnScheduler"

export const useScheduler = (s: FlyerSettings) => {
    const settings = ref(s)

    const scheduler = computed<IScheduler>(() => {
        if (settings.value.specification.format === Format.Knockout) {
            return new KnockoutScheduler()
        }

        if (settings.value.specification.format === Format.RoundRobin) {
            return new RoundRobinScheduler()
        }

        if (settings.value.specification.format === Format.WinnerStaysOn) {
            return new WinnerStaysOnScheduler()
        }

        throw `Invalid flyer format ${settings.value.specification.format}!`
    })

    return {
        scheduler,
    }
}

export const useSchedulerForPhase = (s: PhaseSettings) => {
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
