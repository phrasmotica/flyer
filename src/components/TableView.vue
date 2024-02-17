<script setup lang="ts">
import { computed, ref } from "vue"

const props = defineProps<{
    players: string[]
}>()

const results = ref([])

const expectedResults = computed(() => props.players.length * (props.players.length - 1) / 2)
const resultsRemaining = computed(() => expectedResults.value - results.value.length)
</script>

<template>
    <div>
        <div class="d-flex justify-content-between align-items-end">
            <h3>Table</h3>

            <span>Results remaining: {{ resultsRemaining }}</span>
        </div>

        <table class="table">
            <thead>
                <tr>
                    <th></th>
                    <th v-for="p, i in props.players" scope="col">
                        <strong>{{ p }}</strong>
                    </th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="p in props.players">
                    <th scope="row">
                        <strong>{{ p }}</strong>
                    </th>
    
                    <td v-for="q in props.players" :class="[q === p && 'not-played']">
                        <div v-if="q !== p">-</div>
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>
h3 {
    margin: 0px;
}

th {
    width: 120px;
}

.not-played {
    background-color: lightgrey;
}
</style>
