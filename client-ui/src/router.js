import Router from 'vue-router';
import Vue from 'vue';

import LoginPageVue from './components/auth/LoginPage.vue';

Vue.use(Router);
export default new Router({
    routes: [
        { path: '/login', component: LoginPageVue}
    ]
});