import { createRouter, createWebHistory } from 'vue-router'
import { useUserDataStore } from '../stores/userData'
import RealTimeInterface from '../components/Views/RealTimeInterfaceView.vue'
import Dashboard from '../components/Views/DashboardView.vue'
import Images from '../components/Views/ImagesView.vue'
import Scheduling from '../components/Views/SchedulingView.vue'
import About from '../components/Views/AboutView.vue'
import BookRTI from '../components/Views/BookRTIView.vue'
import LogIn from '../components/LogIn/LogIn.vue'
import ObservationDetailsView from '../components/Views/ObservationDetailsView.vue'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard'
  },
  {
    path: '/realtime/:id',
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
  },
  {
    path: '/login',
    name: 'LogIn',
    component: LogIn
  },
  {
    path: '/observation/:id',
    name: 'ObservationDetails',
    component: ObservationDetailsView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Add navigation guard
router.beforeEach((to, from, next) => {
  const userDataStore = useUserDataStore()
  const isLoggedIn = !!userDataStore.username

  // Allow access only to the login page if not logged in
  if (!isLoggedIn && to.path !== '/login') {
    next('/login')
  } else {
    next()
  }
})

export default router
