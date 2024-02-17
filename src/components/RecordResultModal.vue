<script setup lang="ts">
const props = defineProps<{
    player1: string
    player2: string
}>()

const emit = defineEmits<{
    confirm: []
}>()
</script>

<template>
    <div class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">{{ props.player1 }} vs. {{ props.player2 }}</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                </div>

                <div class="modal-body">
                    <p>{{ props.player1 }} beats {{ props.player2 }} 1-0?</p>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">
                        Cancel
                    </button>

                    <button type="button" class="btn btn-primary" data-bs-dismiss="modal" @click="emit('confirm')">
                        Confirm
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>
