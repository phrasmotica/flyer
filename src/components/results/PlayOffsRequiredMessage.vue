<script setup lang="ts">
import { useI18n } from "vue-i18n"

import { useFlyer } from "@/composables/useFlyer"

import { useFlyerStore } from "@/stores/flyer"

const { t } = useI18n()

const flyerStore = useFlyerStore()

const {
    playOffs,
    phaseIsComplete,
} = useFlyer(flyerStore.flyer)
</script>

<template>
    <Message severity="info" :closable="false">
        <p v-for="p, i in playOffs.filter(x => !phaseIsComplete(x.id))" class="m-0">
            <sup class="text-xs">{{ i + 1 }}</sup>
            {{ t('results.playOffRequiredMessage', {
                name: p.name,
            }) }}
        </p>
    </Message>
</template>
