<script setup lang="ts">
import { computed, ref } from "vue"
import { useRouter } from "vue-router"
import html2canvas from "html2canvas"

import Clock from "../components/Clock.vue"
import ConfirmModal from "../components/ConfirmModal.vue"
import LightsCalculator from "../components/LightsCalculator.vue"
import PageTemplate from "../components/PageTemplate.vue"
import Podium from "../components/Podium.vue"
import ResultsTable from "../components/ResultsTable.vue"

import { useFlyer } from "../composables/useFlyer"
import { usePhase } from "../composables/usePhase"
import { usePhaseSettings } from "../composables/usePhaseSettings"
import { useQueryParams } from "../composables/useQueryParams"
import { useStandings } from "../composables/useStandings"

import { useFlyerStore } from "../stores/flyer"
import { useFlyerHistoryStore } from "../stores/flyerHistory"

const router = useRouter()

const flyerStore = useFlyerStore()
const flyerHistoryStore = useFlyerHistoryStore()

const {
    flyer,
    mainPhase,
    phaseIsComplete,
} = useFlyer(flyerStore.flyer)

const {
    settings,
    durationMilliseconds,
} = usePhase(mainPhase.value)

const {
    isKnockout,
    isRoundRobin,
    isWinnerStaysOn,
    estimatedDurationMinutes,
} = usePhaseSettings(mainPhase.value)

const {
    requiresPlayOff,
    orderedPlayOffs,
} = useStandings(mainPhase.value)

const {
    isHistoric,
} = useQueryParams()

const showGoToSetupModal = ref(false)
const showStartPlayOffModal = ref(false)

const imageSaved = ref(false)

const confirmGoToSetup = () => {
    if (alreadySaved.value) {
        goToSetup()
    }
    else {
        showGoToSetupModal.value = true
    }
}

const goToSetup = () => {
    flyerStore.clear()

    hideGoToSetupModal()

    router.push({
        name: "setup",
    })
}

const confirmStartPlayOff = () => {
    showStartPlayOffModal.value = true
}

const nextPlayOff = computed(() => {
    const remaining = orderedPlayOffs.value.filter(p => !phaseIsComplete(p.id))
    return remaining.length > 0 ? remaining[0] : null
})

const hasPlayedOff = computed(() => !nextPlayOff.value)

const alreadySaved = computed(() => {
    return flyerHistoryStore.pastFlyers.some(f => f.id === flyer.value?.id)
})

const startPlayOff = () => {
    if (!nextPlayOff.value || !mainPhase.value) {
        console.debug("No play-offs remaining!")
        return
    }

    flyerStore.addPlayOff(nextPlayOff.value, mainPhase.value)

    hideStartPlayOffModal()

    router.push({
        name: "play",
    })
}

const saveImageButtonText = computed(() => imageSaved.value ? "Downloading..." : "Download image")

const saveButtonText = computed(() => alreadySaved.value ? "Flyer saved!" : "Save flyer")

const playOffButtonText = computed(() => "Start the " + nextPlayOff.value?.name || "(UNKNOWN PLAY-OFF)")

const downloadImage = (blob: string, fileName: string) => {
    const fakeLink = document.createElement("a")

    fakeLink.download = fileName
    fakeLink.href = blob

    document.body.appendChild(fakeLink)
    fakeLink.click()
    document.body.removeChild(fakeLink)

    fakeLink.remove()
}

const saveResults = () => {
    const element = document.getElementById("results-container")!

    html2canvas(element, {
        onclone: (_, element) => {
            element.style.padding = "1rem"
        }
    })
    .then(canvas => canvas.toDataURL("image/png", 1.0))
    .then(blob => downloadImage(blob, settings.value.name + "-" + Date.now()))
    .then(() => {
        imageSaved.value = true

        setTimeout(() => {
            imageSaved.value = false
        }, 2000)
    })
}

const save = () => {
    if (flyerStore.flyer && !alreadySaved.value) {
        flyerHistoryStore.add(flyerStore.flyer)
    }
}

const hideGoToSetupModal = () => {
    showGoToSetupModal.value = false
}

const hideStartPlayOffModal = () => {
    showStartPlayOffModal.value = false
}

const goToPastFlyers = () => {
    router.push({
        name: "history",
    })
}
</script>

<template>
    <PageTemplate>
        <template #content>
            <div id="results-container">
                <div class="flex align-items-baseline justify-content-between border-bottom-1 mb-1">
                    <h1>{{ settings.name }}</h1>

                    <Clock
                        :elapsedMilliseconds="durationMilliseconds || 0"
                        :warnAfterMilliseconds="estimatedDurationMinutes * 60000" />
                </div>

                <ResultsTable v-if="isRoundRobin || isWinnerStaysOn" />

                <Podium v-if="isKnockout" />
            </div>

            <div v-if="!requiresPlayOff && !isHistoric" class="border-top-1 mt-1 pt-1">
                <LightsCalculator />
            </div>

            <ConfirmModal
                :visible="showGoToSetupModal"
                header="New flyer"
                message="Are you sure you want to start a new flyer? The current one has not been saved!"
                confirmLabel="Yes"
                :confirmDisabled="false"
                cancelLabel="No"
                @confirm="goToSetup"
                @hide="hideGoToSetupModal" />

            <ConfirmModal
                :visible="showStartPlayOffModal"
                header="Start Play-Off"
                :message="`Are you sure you want to start the ${nextPlayOff?.name || '(UNKNOWN)'}?`"
                confirmLabel="Yes"
                :confirmDisabled="false"
                cancelLabel="No"
                @confirm="startPlayOff"
                @hide="hideStartPlayOffModal" />
        </template>

        <template #buttons>
            <div v-if="!hasPlayedOff && requiresPlayOff">
                <Button :label="playOffButtonText" @click="confirmStartPlayOff" />
            </div>

            <div v-else>
                <div v-if="!isHistoric">
                    <div class="p-fluid flex gap-2 mb-2">
                        <Button :label="saveButtonText" :disabled="alreadySaved" @click="save" />

                        <Button :label="saveImageButtonText" :disabled="imageSaved" @click="saveResults" />
                    </div>

                    <Button label="New flyer" severity="info" @click="confirmGoToSetup" />
                </div>

                <div v-else>
                    <Button
                        label="Back to past flyers"
                        severity="info"
                        @click="goToPastFlyers" />
                </div>
            </div>
        </template>
    </PageTemplate>
</template>
