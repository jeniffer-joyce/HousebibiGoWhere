import { createApp } from 'vue'
import router from './router'
import './style.css'
import App from './App.vue'
import { registerGoogleCompleteProfileGuard } from '@/guards/googleCompleteProfileGuard'
import { auth } from '@/firebase/firebase_config'
import { setPersistence, browserLocalPersistence, onAuthStateChanged } from 'firebase/auth'

await setPersistence(auth, browserLocalPersistence)

export const authReady = new Promise((resolve) => {
  const off = onAuthStateChanged(auth, () => {
    off()
    resolve()
  })
})

registerGoogleCompleteProfileGuard(router)

createApp(App)
    .use(router)
    .mount('#app')
