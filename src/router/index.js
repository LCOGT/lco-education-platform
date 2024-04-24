import { createRouter, createWebHistory } from 'vue-router'
import Home from '../components/views/HomeView.vue'
import RealTimeInterface from '../components/views/RealTimeInterfaceView.vue'
import Dashboard from '../components/views/DashboardView.vue'

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
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
