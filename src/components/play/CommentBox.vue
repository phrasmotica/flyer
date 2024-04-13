<script setup lang="ts">
import { useI18n } from "vue-i18n"

const { t } = useI18n()

const comment = defineModel<string>()
</script>

<template>
    <div class="p-fluid">
        <Textarea
            class="text-xs md:text-sm"
            rows="3"
            :placeholder="t('fixture.addAComment')"
            v-model="comment" />
    </div>
</template>
