<script setup lang="ts">
import { useTitle } from "@vueuse/core"
import { computed } from "vue"
import { useRouter } from "vue-router"

import PageTemplate from "@/components/PageTemplate.vue"

import { useAuth } from "@/composables/useAuth"
import { useEnv } from "@/composables/useEnv"
import { useJwt } from "@/composables/useJwt"
import { useRouting } from "@/composables/useRouting"
import { useScreenSizes } from "@/composables/useScreenSizes"
import { useTimedRef } from "@/composables/useTimedRef"

// debug page, no need to localise

useTitle("Flyer - Admin")

const routing = useRouting(useRouter())

const {
    oidcEnabled,
} = useEnv()

const {
    isAuthenticated,
    userProfile,
} = useAuth()

const {
    roles,
    isSuperuser,
} = useJwt()

const {
    isSmallScreen,
} = useScreenSizes()

const {
    value: isCleared,
} = useTimedRef(2000, false)

const clearButtonLabel = computed(() => isCleared.value ? "Done!" : "Clear local storage")

const clearLocalStorage = () => {
    localStorage.clear()

    isCleared.value = true
}

const goBack = () => {
    if (oidcEnabled) {
        routing.toProfile()
    }
    else {
        routing.toSetup()
    }
}
</script>

<template>
    <PageTemplate>
        <template #header>
            <div class="flex flex-grow-1 align-items-center justify-content-between">
                Admin
            </div>
        </template>

        <template #content>
            <div v-if="oidcEnabled && isAuthenticated">
                <div v-if="isSuperuser">
                    <p>Roles</p>
                    <pre class="text-sm">{{ roles }}</pre>

                    <p>User Profile</p>
                    <pre class="text-sm">{{ userProfile }}</pre>
                </div>

                <div v-else>
                    <p>You do not have permission to view this page.</p>
                </div>
            </div>

            <div class="p-fluid">
                <Button
                    :label="clearButtonLabel"
                    :disabled="isCleared"
                    severity="danger"
                    @click="clearLocalStorage" />
            </div>
        </template>

        <template v-if="!isSmallScreen" #sidebar>
            <div class="p-fluid">
                <Button
                    label="Go back"
                    severity="info"
                    @click="goBack" />
            </div>
        </template>

        <template v-if="isSmallScreen" #buttons>
            <Button
                label="Go back"
                severity="info"
                @click="goBack" />
        </template>
    </PageTemplate>
</template>
