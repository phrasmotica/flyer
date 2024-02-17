<script setup lang="ts">
const props = defineProps<{
    players: string[]
}>()
</script>

<template>
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
</template>

<style scoped>
th {
    width: 120px;
}

.not-played {
    background-color: lightgrey;
}
</style>
