import { createRouter, createWebHistory } from 'vue-router'
import RealTimeInterface from '../components/Views/RealTimeInterfaceView.vue'
import Dashboard from '../components/Views/DashboardView.vue'
import Images from '../components/Views/ImagesView.vue'
import Scheduling from '../components/Views/SchedulingView.vue'

const routes = [
  {
    path: '/realtime',
    name: 'RealTimeInterface',
    component: RealTimeInterface
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/images',
    name: 'Images',
    component: Images
  },
  {
    path: '/schedule',
    name: 'Scheduling',
    component: Scheduling
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
