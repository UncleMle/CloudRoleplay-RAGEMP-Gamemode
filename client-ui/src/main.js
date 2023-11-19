import { createApp } from 'vue';
import App from './App.vue';
import router from './router.js';
import ChatBox from './components/ui/ChatBox.vue';
import stores from './stores/stores';

import './assets/styles.css';

createApp(App).use(router).use(stores).mount('#app')


global.router = router;
global.chat = ChatBox;
global.store = stores;