<script setup lang="ts">
import { useFlyer } from "../composables/useFlyer"
import { useFlyerStore } from "../stores/flyer"

const flyerStore = useFlyerStore()

const {
    playOffs,
    phaseIsComplete,
} = useFlyer(flyerStore.flyer)
</script>

<template>
    <Message severity="info" :closable="false">
        <p v-for="p, i in playOffs.filter(x => !phaseIsComplete(x.id))" class="m-0">
            <em>
                <sup class="text-xs">{{ i + 1 }}</sup>
                these players must take part in the
                {{ p.name }}
            </em>
        </p>
    </Message>
</template>
