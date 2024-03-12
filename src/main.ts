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
import IconField from "primevue/iconfield"
import InputIcon from "primevue/inputicon"
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"
import MeterGroup from 'primevue/metergroup'
import SelectButton from "primevue/selectbutton"
import Slider from "primevue/slider"
import TabMenu from 'primevue/tabmenu'
import Textarea from 'primevue/textarea'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'

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
    numberFormats: {
        "en-GB": {
            currency: {
                style: "currency",
                currency: "GBP",
            }
        },
    },
    messages: {},
}))

app.use(createPinia())
app.use(router)
app.use(PrimeVue)
app.use(ToastService)

app.component("Button", Button)
app.component("Checkbox", Checkbox)
app.component("Column", Column)
app.component("DataTable", DataTable)
app.component("Dialog", Dialog)
app.component("Dropdown", Dropdown)
app.component("IconField", IconField)
app.component("InputIcon", InputIcon)
app.component("InputNumber", InputNumber)
app.component("InputText", InputText)
app.component("MeterGroup", MeterGroup)
app.component("SelectButton", SelectButton)
app.component("Slider", Slider)
app.component("TabMenu", TabMenu)
app.component("Textarea", Textarea)
app.component("Toast", Toast)

app.mount('#app')
