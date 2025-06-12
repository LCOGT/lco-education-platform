import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import router from './router/index'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import { library } from '@fortawesome/fontawesome-svg-core'
import {
  faBook, faStar, faChartLine, faCalendarDays, faGamepad, faChevronRight,
  faSquare, faThLarge, faGear, faSliders, faClock, faXmark, faPlusCircle,
  faDownload, faPenRuler, faListCheck, faChevronDown, faTrashCan, faExclamationTriangle,
  faEye
} from '@fortawesome/free-solid-svg-icons'
import { faTelescope, faLocationDot, faCameraRetro, faArrowRight } from '@fortawesome/pro-regular-svg-icons'
import VCalendar from 'v-calendar'
import 'v-calendar/style.css'

library.add(faBook, faStar, faChartLine, faCalendarDays, faGamepad, faChevronRight,
  faSquare, faThLarge, faGear, faSliders, faClock, faXmark, faPlusCircle, faDownload,
  faPenRuler, faTelescope, faLocationDot, faCameraRetro, faListCheck, faChevronDown,
  faArrowRight, faTrashCan, faExclamationTriangle, faEye)

require('@/assets/ptr_main.scss')

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

createApp(App)
  .use(router)
  .use(vuetify)
  .use(pinia)
  .use(VCalendar, {})
  .mount('#app')
