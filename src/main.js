import { ViteSSG } from 'vite-ssg'
import App from './App.vue'
import { routes } from './router'
import { getSchools } from './utils/data.js'

export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL
  }
)

export const includedRoutes = (paths) => {
  const staticPaths = paths.filter(path => !path.includes(':'))
  const schoolPaths = getSchools().map(school => `/schools/${school.id}`)
  return [...new Set([...staticPaths, ...schoolPaths])]
}
