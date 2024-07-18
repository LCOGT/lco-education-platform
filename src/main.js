import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import router from './router/index'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { library } from '@fortawesome/fontawesome-svg-core'
import { faBook, faStar, faChartLine, faCalendarDays, faGamepad, faChevronRight, faSquare, faThLarge, faGear, faSliders, faClock, faXmark, faPlusCircle, faDownload, faPenRuler } from '@fortawesome/free-solid-svg-icons'

library.add(faBook, faStar, faChartLine, faCalendarDays, faGamepad, faChevronRight, faSquare, faThLarge, faGear, faSliders, faClock, faXmark, faPlusCircle, faDownload, faPenRuler)

require('@/assets/ptr_main.scss')

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

createApp(App)
  .use(router)
  .use(vuetify)
  .use(pinia)
  .mount('#app')
