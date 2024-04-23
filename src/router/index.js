import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/Views/HomeView.vue'
import RealTimeInterface from '../components/Views/RealTimeInterfaceView.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/rti',
    name: 'RealTimeInterface',
    component: RealTimeInterface
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
