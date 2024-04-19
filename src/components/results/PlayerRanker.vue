<script setup lang="ts">
import Draggable from "vuedraggable"

import type { Player } from "@/data/Player"

const finalOrder = defineModel<Player[]>()
</script>

<template>
    <div class="p-fluid">
        <Draggable :list="finalOrder" itemKey="id" ghostClass="opacity-40">
            <template #item="{ index, element: player }">
                <div class="grid m-0 border-1 border-round-md border-gray-300 p-1 my-1 cursor-move">
                    <div class="col-1 p-0 pr-1 text-right">
                        <span>
                            {{ index + 1 }}.
                        </span>
                    </div>
                    <div class="col-10 p-0">
                        <span class="font-bold">
                            {{ player.name }}
                        </span>
                    </div>
                    <div class="col-1 p-0 text-right pr-2">
                        <i class="pi pi-bars text-color-secondary text-sm" />
                    </div>
                </div>
            </template>
        </Draggable>
    </div>
</template>
