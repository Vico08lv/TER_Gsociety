import { createApp } from 'vue'
// import "bootstrap/dist/css/bootstrap.css"
import App from './App.vue'
import VueKonva from 'vue-konva'

const app = createApp(App);
app.use(VueKonva);
app.mount('#app');