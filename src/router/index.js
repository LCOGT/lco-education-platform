import { createRouter, createWebHistory } from 'vue-router'
import RealTimeInterface from '../components/Views/RealTimeInterfaceView.vue'
import Dashboard from '../components/Views/DashboardView.vue'
import Images from '../components/Views/ImagesView.vue'
import Scheduling from '../components/Views/SchedulingView.vue'
import About from '../components/Views/AboutView.vue'
import BookRTI from '../components/Views/BookRTIView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/realtime',
    name: 'RealTimeInterface',
    component: RealTimeInterface
  },
  {
    path: '/book/realtime',
    name: 'BookRTI',
    component: BookRTI
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
  },
  {
    path: '/about',
    name: 'About',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
