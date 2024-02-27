<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from "vue"
import { useRouter } from "vue-router"

import Clock from "../components/Clock.vue"
import ConfirmModal from "../components/ConfirmModal.vue"
import FixtureList from "../components/FixtureList.vue"
// import RoundRobinTable from "../components/RoundRobinTable.vue"

import { useFlyer } from "../composables/useFlyer"

import { Format } from "../data/FlyerSettings"

import { useFlyerStore } from "../stores/flyer"

enum Display {
    Fixtures = "Fixtures",
    HeadToHead = "Head-to-Head",
}

const router = useRouter()

const flyerStore = useFlyerStore()

const {
    elapsedSeconds,
    durationSeconds,
    hasStarted,
    hasFinished,
    isInProgress,
    isComplete,
    readyForNextRound,
    pauseClock,
    resumeClock,
} = useFlyer(flyerStore.flyer)

const display = ref(Display.Fixtures)

const showFinishModal = ref(false)
const showInfoModal = ref(false)
const showAbandonModal = ref(false)

onMounted(() => {
    if (isInProgress.value) {
        resumeClock()
    }
})

const isKnockout = computed(() => flyerStore.settings.format === Format.Knockout)

const progressText = computed(() => {
    if (hasStarted.value) {
        if (hasFinished.value) {
            return "Finished"
        }

        if (isComplete.value) {
            return "Completed"
        }

        return "In progress"
    }

    return "Ready to start"
})

const clockDisplay = computed(() => durationSeconds.value || elapsedSeconds.value)

const finishButtonText = computed(() => {
    if (hasStarted.value && hasFinished.value) {
        return "View results"
    }

    return "Finish"
})

const generateNextRound = () => {
    // TODO: implement
}

const confirmFinish = () => {
    if (hasFinished.value) {
        finish()
    }
    else {
        showFinishModal.value = true
    }
}

const finish = () => {
    flyerStore.finish()

    hideFinishModal()

    router.push({
        name: "results",
    })
}

const hideFinishModal = () => {
    showFinishModal.value = false
}

const hideInfoModal = () => showInfoModal.value = false

const abandon = () => {
    flyerStore.clear()

    hideAbandonModal()

    router.push({
        name: "setup",
    })
}

const hideAbandonModal = () => showAbandonModal.value = false

onUnmounted(() => {
    pauseClock()
})
</script>

<template>
    <main>
        <div class="border-bottom-1 pb-1">
            <h1>{{ flyerStore.settings.name }} - Fixtures</h1>

            <div class="flex align-items-end justify-content-between">
                <p class="m-0 text-lg font-italic">{{ progressText }}</p>

                <Clock :elapsedSeconds="clockDisplay" />
            </div>
        </div>

        <!-- <div class="p-fluid">
            <SelectButton v-model="display" :options="[Display.Fixtures, Display.HeadToHead]" :allowEmpty="false" aria-labelledby="basic" />
        </div> -->

        <FixtureList v-if="display === Display.Fixtures" />

        <!-- <RoundRobinTable v-if="display === Display.HeadToHead"
            :players="actualPlayers"
            :raceTo="raceTo"
            :rounds="rounds"
            :results="results"
            @start="startFixture"
            @updateResult="updateResult" /> -->

        <ConfirmModal
            :visible="showFinishModal"
            header="Finish Flyer"
            message="Are you ready to finish the flyer?"
            confirmLabel="Yes"
            :confirmDisabled="false"
            cancelLabel="No"
            @confirm="finish"
            @hide="hideFinishModal" />

        <Dialog
            modal
            class="w-full mx-4"
            v-model:visible="showInfoModal"
            :header="flyerStore.settings.name + ' - Info'"
            @hide="hideInfoModal">
            <div class="p-fluid mb-2">
                <h4 class="font-bold">Rules</h4>

                <ul>
                    <li>
                        {{ flyerStore.settings.format }} format
                        <span v-if="isKnockout && flyerStore.settings.randomlyDrawAllRounds">
                            <em>(random draw)</em>
                        </span>
                        <span v-else-if="isKnockout">
                            <em>(fixed draw)</em>
                        </span>
                    </li>
                    <li>Races to {{ flyerStore.settings.raceTo }}</li>
                    <li>{{ flyerStore.settings.ruleSet }} rules</li>
                </ul>
            </div>

            <div class="p-fluid">
                <Button
                    type="button"
                    label="Close"
                    severity="secondary"
                    @click="hideInfoModal" />
            </div>
        </Dialog>

        <ConfirmModal
            :visible="showAbandonModal"
            header="Abandon flyer"
            message="Are you sure you want to abandon this flyer?"
            confirmLabel="Yes"
            :confirmDisabled="false"
            cancelLabel="No"
            @confirm="abandon"
            @hide="hideAbandonModal" />
    </main>

    <div class="nav-buttons sticky bottom-0 bg-colour p-fluid w-full pt-2 px-5">
        <Button
            v-if="flyerStore.settings.randomlyDrawAllRounds"
            class="mb-2"
            label="Generate next round"
            :disabled="!readyForNextRound"
            @click="generateNextRound" />

        <Button
            v-else
            class="mb-2"
            :label="finishButtonText"
            :disabled="!flyerStore.settings.allowEarlyFinish && flyerStore.remainingCount > 0"
            @click="confirmFinish" />

        <Button
            class="mb-2"
            label="Info"
            severity="info"
            @click="() => showInfoModal = true" />

        <Button
            v-if="!hasFinished"
            class="mb-2"
            label="Abandon"
            severity="danger"
            @click="() => showAbandonModal = true" />
    </div>
</template>

<style scoped>
@media screen and (max-width: 767px) {
    main {
        width: 100%;
    }
}

@media screen and (min-width: 768px) {
    main {
        width: 600px;
    }
}
</style>
