import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import router from './router/index'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBook, faStar, faChartLine, faCalendarDays, faGamepad } from '@fortawesome/free-solid-svg-icons'

library.add(faBook, faStar, faChartLine, faCalendarDays, faGamepad)

require('@/assets/ptr_main.scss')

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

createApp(App)
  .use(pinia)
  .use(router)
  .use(vuetify)
  .mount('#app')
