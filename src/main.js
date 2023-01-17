import '@unocss/reset/tailwind.css'
import './styles/main.css'
import "@fontsource/lato"
import 'uno.css'

import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
import { createWebHistory, createRouter } from 'vue-router'
import { createHead } from '@vueuse/head'
import App from './App.vue'

const app = createApp(App)

const router = createRouter({
  history: createWebHistory(),
  routes: setupLayouts(generatedRoutes)
})

app.use(router)

const head = createHead()
app.use(head)

// NOTE: ctx is a compat for ViteSSG
const ctx = { app, router, isClient: true, initialState: {} }
Object.values(import.meta.globEager('./modules/*.ts')).forEach(i => i.install?.(ctx))

app.mount('#app')
