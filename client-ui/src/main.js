import Vue from 'vue'
import App from './App.vue'
import router from './router'

import './assets/styles.css';

// eslint-disable-next-line
import store from './stores/store'

Vue.config.productionTip = false;

const app = new Vue({
    router,
    store,
    render: h => h(App)
}).$mount('#app');


global.router = app.$router;
global.store = app.$store;
