import { createSSRApp } from 'vue'
import App from './App.vue'
import router from './router'

export function createApp() {
  const app = createSSRApp(App)
  app.use(router)
  
  // 確保 router 準備就緒
  router.isReady().then(() => {
    app.mount('#app')
  })
  
  return { app, router }
}
