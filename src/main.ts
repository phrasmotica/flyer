import './assets/main.css'

import { createApp } from 'vue'
import { createI18n } from 'vue-i18n'
import { createPinia } from 'pinia'

import 'primevue/resources/themes/aura-light-green/theme.css'
import 'primeicons/primeicons.css'

import PrimeVue from 'primevue/config'

import Button from "primevue/button"
import Checkbox from 'primevue/checkbox'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import SelectButton from "primevue/selectbutton"

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createI18n({
    locale: "en-GB",
    fallbackLocale: "en-GB",
    legacy: false,
    datetimeFormats: {
        "en-GB": {
            long: {
                year: 'numeric', month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit', hour12: false,
            }
        }
    },
    messages: {},
}))

app.use(createPinia())
app.use(router)
app.use(PrimeVue)

app.component("Button", Button)
app.component("Checkbox", Checkbox)
app.component("Column", Column)
app.component("DataTable", DataTable)
app.component("Dialog", Dialog)
app.component("Dropdown", Dropdown)
app.component("InputNumber", InputNumber)
app.component("InputText", InputText)
app.component("SelectButton", SelectButton)

app.mount('#app')
