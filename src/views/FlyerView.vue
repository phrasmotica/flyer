<script setup lang="ts">
import { ref } from "vue"

import PlayersForm from "../components/PlayersForm.vue"
import TableView from "../components/TableView.vue"

const phase = ref(0)
const players = ref<string[]>([])

const setPhase = (p: number) => phase.value = p

const start = (p: string[]) => {
    players.value = p
    setPhase(1)
}

const restart = () => {
    setPhase(0)
}
</script>

<template>
    <main>
        <div v-if="phase === 0">
            <PlayersForm @start="start" />
        </div>

        <div v-else-if="phase === 1">
            <h3>Table</h3>

            <TableView :players="players" />

            <button class="btn btn-primary w-100" @click="() => setPhase(2)">Finish</button>
        </div>

        <div v-else-if="phase === 2">
            <p>Flyer complete</p>
            <ul>
                <li v-for="p in players">
                    {{ p }}
                </li>
            </ul>

            <button class="btn btn-primary w-100" @click="restart">Restart</button>
        </div>
    </main>
</template>

<style scoped>
main {
    width: 600px;
}
</style>
