<script setup lang="ts">
import { ref } from "vue"
import { useRouter } from "vue-router"

import ConfirmModal from "../components/ConfirmModal.vue"
import FixtureList from "../components/FixtureList.vue"
// import RoundRobinTable from "../components/RoundRobinTable.vue"

import { useFlyerStore } from "../stores/flyer"

enum Display {
    Fixtures = "Fixtures",
    HeadToHead = "Head-to-Head",
}

const router = useRouter()

const flyerStore = useFlyerStore()

const display = ref(Display.Fixtures)
const showFinishModal = ref(false)

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
</script>

<template>
    <main>
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

        <div class="p-fluid mt-2">
            <Button
                label="Finish"
                :disabled="!flyerStore.settings.allowEarlyFinish && flyerStore.remainingCount > 0"
                @click="confirmFinish" />
        </div>

        <ConfirmModal
            :visible="showFinishModal"
            header="Finish Flyer"
            message="Are you ready to finish the flyer?"
            confirmLabel="Yes"
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
