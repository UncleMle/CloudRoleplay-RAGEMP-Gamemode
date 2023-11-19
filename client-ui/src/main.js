import { createApp } from 'vue';
import App from './App.vue';
import router from './router.js';
import ChatBox from './components/ui/ChatBox.vue';

import './assets/styles.css';

createApp(App).use(router).mount('#app')


global.router = router;
global.chat = ChatBox;