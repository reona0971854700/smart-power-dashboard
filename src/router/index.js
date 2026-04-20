import { createRouter, createWebHistory } from 'vue-router'
import Dashboard from '../views/Dashboard.vue'
import History from '../views/History.vue'
import Management from '../views/Management.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard
  },
  {
    path: '/history',
    name: 'History',
    component: History
  },
  {
    path: '/management',
    name: 'Management',
    component: Management
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router