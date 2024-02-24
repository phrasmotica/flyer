<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { differenceInMinutes } from "date-fns"

import type { Result, Score } from "../data/Result"

import { useFlyerStore } from "../stores/flyer"
import { useSettingsStore } from "../stores/settings"

const props = defineProps<{
    visible: boolean
    result: Result
}>()

const emit = defineEmits<{
    hide: []
}>()

const flyerStore = useFlyerStore()
const settings = useSettingsStore().settings

const visible = ref(props.visible)
const result = ref(props.result)
const scores = ref(props.result.scores.map(r => r.score))

watch(props, () => {
    visible.value = props.visible
    result.value = props.result
    scores.value = props.result.scores.map(r => r.score)
})

const players = computed(() => result.value.scores.map(r => r.playerId))
const round = computed(() => flyerStore.getRound(result.value.id)!)

// hack to stop InputNumber elements from focusing after pressing their buttons.
// Important for mobile UX
watch([scores], () => {
    (<any>document.activeElement)?.blur()
})

const setScore = (index: number, score: number) => {
    scores.value = scores.value.map((s, i) => i === index ? score : s)
}

const startFixture = () => {
    flyerStore.startFixture(result.value.id)
    emit('hide')
}

const updateScores = (finish: boolean) => {
    const newScores = players.value.map((id, i) => <Score>{
        playerId: id,
        score: scores.value[i],
        isBye: false,
    })

    flyerStore.updateScores(result.value.id, newScores, finish)

    emit('hide')
}

const startButtonText = computed(() => {
    if (result.value.scores.some(s => !s.playerId)) {
        return "Waiting for a previous result"
    }

    if (settings.requireCompletedRounds && round.value.index > flyerStore.currentRound) {
        return "Waiting for round to start"
    }

    if (flyerStore.ongoingCount >= settings.tableCount) {
        return "Waiting for a free table"
    }

    return "Start"
})

const disableStart = computed(() => {
    if (result.value.scores.some(s => !s.playerId)) {
        return true
    }

    if (settings.requireCompletedRounds) {
        return round.value.index > flyerStore.currentRound
    }

    return flyerStore.ongoingCount >= settings.tableCount
})

const disableFinish = computed(() => {
    if (scores.value.every(s => s < settings.raceTo)) {
        return true
    }

    if (scores.value.reduce((a, b) => a + b) > 2 * settings.raceTo - 1) {
        return true
    }

    // TODO: prevent submitting a draw, configurable?

    return false
})

const description = computed(() => result.value.scores.map(s => {
    if (s.isBye) {
        return "(bye)"
    }

    return flyerStore.getPlayerName(s.playerId) || "(???)"
}).join(" v "))

const header = computed(() => `${round.value.name} - ${description.value}`)

const fixtureDuration = computed(() => {
    if (!result.value.startTime) {
        return null
    }

    if (!result.value.finishTime) {
        // TODO: make this update in real time, by using setInterval()
        return differenceInMinutes(new Date(), (new Date(result.value.startTime)))
    }

    return differenceInMinutes(new Date(result.value.finishTime), new Date(result.value.startTime))
})
</script>

<template>
    <Dialog v-model:visible="visible" modal :header="header" @hide="emit('hide')">
        <div v-if="result.finishTime" class="flex flex-column md:flex-row md:align-items-center justify-content-between mb-2">
            <p>Took {{ fixtureDuration }} minute(s)</p>

            <div v-for="id, i in players" class="font-bold">
                {{ flyerStore.getPlayerName(id) }}: {{ scores[i] }}
            </div>
        </div>

        <div v-else-if="result.startTime">
            <p v-if="fixtureDuration && fixtureDuration > 0">
                Started {{ fixtureDuration }} minute(s) ago
            </p>
            <p v-else>Just started</p>

            <div v-for="id, i in players" class="flex flex-column md:flex-row md:align-items-center justify-content-between mb-2">
                <div class="font-bold">
                    {{ flyerStore.getPlayerName(id) }}
                </div>

                <div class="md:ml-3">
                    <InputNumber
                        showButtons
                        buttonLayout="horizontal"
                        :modelValue="scores[i]"
                        :min="0" :max="settings.raceTo"
                        @update:modelValue="v => setScore(i, v)">
                        <template #incrementbuttonicon>
                            <span class="pi pi-plus" />
                        </template>
                        <template #decrementbuttonicon>
                            <span class="pi pi-minus" />
                        </template>
                    </InputNumber>
                </div>
            </div>
        </div>

        <div class="p-fluid">
            <Button v-if="!result.startTime"
                class="mb-2"
                type="button"
                :label="startButtonText"
                :disabled="disableStart"
                @click="startFixture" />

            <Button v-if="result.startTime && !result.finishTime"
                class="mb-2"
                type="button"
                label="Update"
                severity="info"
                @click="() => updateScores(false)" />

            <Button v-if="result.startTime && !result.finishTime"
                class="mb-2"
                type="button"
                label="Finish"
                :disabled="disableFinish"
                @click="() => updateScores(true)" />

            <Button
                type="button"
                label="Close"
                severity="secondary"
                @click="emit('hide')" />
        </div>
    </Dialog>
</template>
