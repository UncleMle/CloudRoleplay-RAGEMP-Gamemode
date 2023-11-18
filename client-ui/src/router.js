import { createWebHistory, createRouter } from "vue-router";
import LoginPage from './components/auth/LoginPage.vue';
import HomePage from './components/HomePage.vue';


const routes = [
    {
        path: "/login",
        name: "LoginPage",
        component: LoginPage,
    },
    {
        path: "/home",
        name: "homePage",
        component: HomePage,
    },
    {
        path: "/",
        name: "homePage",
        component: HomePage,
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;