<script setup lang="ts">
import { useAuth } from "@/composables/useAuth"

const auth = useAuth()
</script>

<template>
    <Button
        icon="pi pi-user"
        iconPos="right"
        severity="info"
        label="Login"
        @click.prevent="auth.signIn" />
</template>
