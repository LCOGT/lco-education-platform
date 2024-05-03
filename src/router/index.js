import { createRouter, createWebHistory } from 'vue-router'
import RealTimeInterface from '../components/Views/RealTimeInterfaceView.vue'
import Dashboard from '../components/Views/DashboardView.vue'
import Images from '../components/Views/ImagesView.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
