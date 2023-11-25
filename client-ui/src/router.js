import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

import LoginPage from './components/auth/LoginPage.vue';
import StatsPage from './components/ui/StatsPage.vue';
import BanPage from './components/auth/BanPage.vue';

export default new Router({
    routes: [
        { path: '/login', component: LoginPage },
        { path: '/stats', component: StatsPage },
        { path: '/ban', component: BanPage}
    ]
});