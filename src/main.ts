import './assets/main.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import 'primevue/resources/themes/aura-light-green/theme.css'
import 'primeicons/primeicons.css'

import PrimeVue from 'primevue/config'

import Button from "primevue/button"
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import InputNumber from "primevue/inputnumber"
import InputText from "primevue/inputtext"

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(PrimeVue)

app.component("Button", Button)
app.component("Column", Column)
app.component("DataTable", DataTable)
app.component("InputNumber", InputNumber)
app.component("InputText", InputText)

app.mount('#app')
