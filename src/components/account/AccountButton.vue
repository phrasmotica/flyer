<script setup lang="ts">
import Button from "primevue/button"
import Menu from "primevue/menu"
import type { MenuItem } from "primevue/menuitem"
import { computed, ref } from "vue"
import { useI18n } from "vue-i18n"
import { useRouter } from "vue-router"

import { useAuth } from "@/composables/useAuth"
import { useRouting } from "@/composables/useRouting"

const props = defineProps<{
    hideText?: boolean,
    showUsernameInDropdown?: boolean,
}>()

const { t } = useI18n()

const {
    isAuthenticated,
    userProfile,
    signOut,
} = useAuth()

const routing = useRouting(useRouter())

const menu = ref()

const splitButtonText = computed(() => {
    if (props.hideText) {
        return ""
    }

    return isAuthenticated.value ? userProfile.value.preferred_username : ""
})

const menuModel = computed(() => {
    var model: MenuItem[] = [
        {
            label: t("auth.myProfile"),
            icon: "pi pi-address-book",
            command: routing.toProfile,
        },
        {
            label: t("auth.signout"),
            icon: "pi pi-sign-out",
            command: signOut,
        },
    ]

    if (props.showUsernameInDropdown && isAuthenticated.value) {
        model = [
            {
                label: userProfile.value.preferred_username,
                items: model,
            },
        ]
    }

    return model
})

const toggle = (event: MouseEvent) => {
    menu.value.toggle(event)
}
</script>

<template>
    <div>
        <Button
            type="button"
            icon="pi pi-user"
            severity="warning"
            :label="splitButtonText"
            @click="toggle"
            aria-haspopup="true"
            aria-controls="overlay_menu" />

        <Menu
            ref="menu"
            id="overlay_menu"
            :model="menuModel"
            :popup="true" />
    </div>
</template>

<style>
#overlay_menu_list > .p-submenu-header {
    padding: 0.25rem 0.75rem;
}

#overlay_menu_list > li.p-menuitem > .p-menuitem-content {
    padding: 0.25rem 0.75rem;
}
</style>
