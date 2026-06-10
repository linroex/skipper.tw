import { createRouter, createWebHistory } from 'vue-router'
import Activities from '../views/Activities.vue'
import Courses from '../views/Courses.vue'
import Schools from '../views/Schools.vue'
import School from '../views/School.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Courses
  },
  {
    path: '/activities',
    name: 'Activities',
    component: Activities
  },
  {
    path: '/courses',
    name: 'Courses',
    component: Courses
  },
  {
    path: '/schools',
    name: 'Schools',
    component: Schools
  },
  {
    path: '/schools/:id',
    name: 'School',
    component: School
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
