import type { OrganizationChartNode } from "primevue/organizationchart"
import { computed } from "vue"

import { useFixtureList } from "./useFixtureList"
import { useRounds } from "./useRounds"
import { usePhaseSpecification } from "./useSpecification"

import type { Fixture } from "@/data/Fixture"
import type { Phase } from "@/data/Phase"

export const useKnockout = (p: Phase | null) => {
    const {
        fixtures,
    } = useFixtureList(p)

    const {
        rounds,
    } = useRounds(p)

    const {
        isKnockout,
    } = usePhaseSpecification(p)

    const bracketData = computed<OrganizationChartNode>(() => {
        if (!isKnockout.value) {
            return <OrganizationChartNode>{}
        }

        const finalRound = rounds.value[rounds.value.length - 1]
        if (!finalRound) {
            return <OrganizationChartNode>{}
        }

        const final = finalRound.fixtures[finalRound.fixtures.length - 1]

        return computeNode(final, fixtures.value)
    })

    const computeNode = (f: Fixture, allFixtures: Fixture[]): OrganizationChartNode => {
        const childFixtures = f.parentFixtures.map(pf => allFixtures.find(x => x.id === pf.fixtureId))
        if (childFixtures.some(cf => !cf)) {
            // could not find some child fixtures
            return {
                key: f.id,
                label: f.id,
                data: f,
                children: [],
            }
        }

        return {
            key: f.id,
            label: f.id,
            data: f,
            children: childFixtures.map(cf => computeNode(cf!, allFixtures))
        }
    }

    return {
        bracketData,
    }
}
