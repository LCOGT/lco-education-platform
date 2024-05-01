import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedState from 'pinia-plugin-persistedstate'
import router from './router/index'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import 'material-icons/iconfont/material-icons.css'

const pinia = createPinia()
pinia.use(piniaPluginPersistedState)

createApp(App)
  .use(pinia)
  .use(router)
  .use(vuetify)
  .mount('#app')
