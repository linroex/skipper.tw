import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Activities from '../views/Activities.vue'
import Courses from '../views/Courses.vue'
import Schools from '../views/Schools.vue'
import School from '../views/School.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
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
    path: '/schools/:name',
    name: 'School',
    component: School
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
