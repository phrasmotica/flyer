<script setup lang="ts">
import { useI18n } from "vue-i18n"

import TableBadge from "./TableBadge.vue"

import { useFlyer } from "../composables/useFlyer"

import { useFlyerStore } from "../stores/flyer"

const props = defineProps<{
    isInProgress?: boolean
}>()

const { n } = useI18n()

const flyerStore = useFlyerStore()

const {
    currentPhase,
} = useFlyer(flyerStore.flyer)
</script>

<template>
    <div v-if="currentPhase">
        <div class="p-fluid">
            <div v-for="_, i in currentPhase.tables">
                <div class="flex" :class="i > 0 && 'mt-1 pt-1 border-none border-top-1 border-dashed border-gray-200'">
                    <div class="flex-grow-1">
                        <TableBadge :tableId="currentPhase.tables[i].id" />

                        <p class="m-0">
                            {{ n(currentPhase.tables[i].costPerHour, "currency") }} per hour
                        </p>

                        <!-- MEDIUM: indicate which fixture is being played on the table,
                        and allow opening the fixture modal -->
                    </div>

                    <!-- MEDIUM: allow pausing (deactivating) the table if it is not being used -->
                    <Button v-if="props.isInProgress"
                        class="ml-2"
                        icon="pi pi-pause-circle"
                        severity="warning"
                        :disabled="true"
                        @click="" />
                </div>
            </div>
        </div>
    </div>
</template>
