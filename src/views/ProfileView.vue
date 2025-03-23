<script setup lang="ts">
import { useTitle } from "@vueuse/core"
import { ref } from "vue"
import { useI18n } from "vue-i18n"

import AdminButton from "@/components/account/AdminButton.vue"
import NewFlyerButton from "@/components/account/NewFlyerButton.vue"
import SignOutButton from "@/components/account/SignOutButton.vue"
import PageTemplate from "@/components/PageTemplate.vue"
import PresetsButton from "@/components/theming/PresetsButton.vue"

import { useAuth } from "@/composables/useAuth"
import { useJwt } from "@/composables/useJwt"
import { useScreenSizes } from "@/composables/useScreenSizes"

const { t } = useI18n()

useTitle("Flyer - Admin")

const {
    userProfile,
} = useAuth()

const {
    rolesText,
    isSuperuser,
} = useJwt()

const {
    isSmallScreen,
} = useScreenSizes()

const profileCached = ref(userProfile.value)
const rolesTextCached = ref(rolesText.value)
</script>

<template>
    <PageTemplate>
        <template #header>
            <div class="flex flex-grow-1 align-items-center justify-content-between">
                {{ profileCached.name }}
            </div>
        </template>

        <template #headerButtons>
            <SignOutButton :hideText="isSmallScreen" />
        </template>

        <template #content>
            <div class="flex justify-content-between">
                <span>{{ t('profile.username') }}</span>
                <span class="font-italic">{{ profileCached.preferred_username }}</span>
            </div>

            <div class="flex justify-content-between mt-1">
                <span>{{ t('profile.email') }}</span>
                <span class="font-italic">{{ profileCached.email }}</span>
            </div>

            <div class="flex justify-content-between mt-1">
                <span>{{ t('profile.roles') }}</span>
                <span class="font-italic">{{ rolesTextCached }}</span>
            </div>

            <div class="mt-2" v-if="isSmallScreen">
                <div class="p-fluid">
                    <NewFlyerButton />
                </div>

                <div class="p-fluid mt-2">
                    <PresetsButton :label="t('presets.adjustPresets')" />
                </div>

                <div v-if="isSuperuser" class="p-fluid mt-2">
                    <AdminButton />
                </div>
            </div>
        </template>

        <template v-if="!isSmallScreen" #sidebar>
            <div class="p-fluid">
                <NewFlyerButton />
            </div>

            <div class="p-fluid mt-2">
                <PresetsButton :label="t('presets.adjustPresets')" />
            </div>

            <div v-if="isSuperuser" class="p-fluid mt-2">
                <AdminButton />
            </div>
        </template>
    </PageTemplate>
</template>
