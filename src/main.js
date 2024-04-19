import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { loadFonts } from './plugins/webfontloader'
import router from './router'
import 'leaflet/dist/leaflet.css'

import './assets/css/custom-colors.css'

loadFonts()

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

createApp(App)
  .use(vuetify)
  .use(pinia)
  .use(router)
  .mount('#app')
