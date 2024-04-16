<script setup lang="ts">
import { computed } from "vue"
import { useI18n } from "vue-i18n"

import type { Fixture } from "@/data/Fixture"

const { t } = useI18n()

const props = defineProps<{
    fixture: Fixture
    isWinner: boolean
    isDraw: boolean
    score?: number
    simple?: boolean
    large?: boolean
    static?: boolean
}>()

const emit = defineEmits<{
    clicked: []
}>()

const cellClass = computed(() => {
    if (props.fixture.cancelledTime) {
        return "bg-pink-400 text-white"
    }

    if (props.fixture.finishTime && !props.isWinner) {
        if (props.isDraw) {
            return "bg-yellow-500 text-white"
        }

        return "loser text-white text-sm"
    }

    if (isWalkover.value || props.fixture.finishTime) {
        return "bg-primary text-white text-lg"
    }

    if (props.fixture.startTime) {
        return "in-progress text-white"
    }

    return "bg-orange-400 text-white"
})

const isWalkover = computed(() => props.fixture.scores.some(s => s.isBye))

const scoreText = computed(() => {
    if (props.simple && props.fixture.finishTime) {
        return props.isWinner ? t('score.win') : t('score.lose')
    }

    return props.score
})

const handleClick = () => {
    if (!props.static) {
        emit('clicked')
    }
}
</script>

<template>
    <div class="score-cell px-2 py-1 flex align-items-center justify-content-center border-round-md"
        :class="[cellClass, !props.static && !isWalkover && 'cursor-pointer', props.large && 'large']"
        @click="handleClick">
        <i v-if="props.fixture.cancelledTime" class="pi pi-times" />
        <span v-else-if="props.fixture.startTime"
            class="score-text"
            :class="[
                isWinner && 'font-bold',
                props.large && isWinner && 'text-4xl',
                props.large && !isWinner && 'text-2xl',
            ]">
            {{ scoreText }}
        </span>
        <span v-else>
            {{ t("score.unknown") }}
        </span>
    </div>
</template>

<style scoped>
.score-cell {
    width: 2rem;
    height: 2rem;
}

.score-cell.large {
    width: 4rem;
    height: 4rem;
}

/* MEDIUM: improve these colours for the colour themes */
.loser {
    background-color: red;
}

.in-progress {
    background-color: #0ea5e9;
}
</style>
