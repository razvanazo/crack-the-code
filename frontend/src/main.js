
import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import socket from "./socket.js";

const app = createApp(App)
app.use(router)
app.config.globalProperties.$socket = socket;

app.mount('#app')
