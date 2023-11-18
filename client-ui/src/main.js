import { createApp } from 'vue';
import App from './App.vue';
import router from './router.js';

import './assets/styles.css';

createApp(App).use(router).mount('#app')


global.router = router;