<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue"
import { useRouter } from "vue-router"

import Clock from "../components/Clock.vue"
import ConfirmModal from "../components/ConfirmModal.vue"
import FixtureList from "../components/FixtureList.vue"
// import RoundRobinTable from "../components/RoundRobinTable.vue"

import { useClock } from "../composables/useClock"

import { useFlyerStore } from "../stores/flyer"

enum Display {
    Fixtures = "Fixtures",
    HeadToHead = "Head-to-Head",
}

const router = useRouter()

const flyerStore = useFlyerStore()

const display = ref(Display.Fixtures)
const showFinishModal = ref(false)

const { elapsedSeconds, interval } = useClock(
    "flyer",
    flyerStore.flyer.startTime,
    !!flyerStore.flyer.startTime && !flyerStore.flyer.finishTime)

const clockDisplay = computed(() => {
    if (flyerStore.flyer.startTime && flyerStore.flyer.finishTime) {
        return Math.floor((flyerStore.flyer.finishTime - flyerStore.flyer.startTime) / 1000)
    }

    return elapsedSeconds.value
})

const confirmFinish = () => {
    showFinishModal.value = true
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

onUnmounted(() => {
    interval.pause()
})
</script>

<template>
    <main>
        <div class="flex flex-column md:flex-row justify-content-between md:align-items-end border-bottom-1 pb-1">
            <h1>{{ flyerStore.settings.name }} - Fixtures</h1>

            <Clock :elapsedSeconds="clockDisplay" />
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

        <div class="sticky bottom-0 bg-colour p-fluid pt-2">
            <Button
                class="mb-4"
                label="Finish"
                :disabled="!flyerStore.settings.allowEarlyFinish && flyerStore.remainingCount > 0"
                @click="confirmFinish" />
        </div>

        <ConfirmModal
            :visible="showFinishModal"
            header="Finish Flyer"
            message="Are you ready to finish the flyer?"
            confirmLabel="Yes"
            :confirmDisabled="false"
            cancelLabel="No"
            @confirm="finish"
            @hide="hideFinishModal" />
    </main>

    <footer>
        <a href="https://www.flaticon.com/free-icons/ball-eight" title="ball eight icons">Ball eight icons created by Boris farias - Flaticon</a>
    </footer>
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
