<script setup lang="ts">
const props = defineProps<{
    comment: string
}>()
</script>

<template>
    <Message class="m-0" icon="pi pi-comment" :closable="false">
        {{ props.comment }}
    </Message>
</template>

<style>
.p-message .p-message-wrapper {
    padding-top: 0.25rem!important;
    padding-bottom: 0.25rem!important;
}
</style>
