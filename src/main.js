import { createApp } from 'vue'
import router from './router'
import './style.css'
import App from './App.vue'
import { registerGoogleCompleteProfileGuard } from '@/guards/googleCompleteProfileGuard'

registerGoogleCompleteProfileGuard(router)

createApp(App)
    .use(router)
    .mount('#app')
