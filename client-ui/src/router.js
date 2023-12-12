import Vue from 'vue';
import Router from 'vue-router';

Vue.use(Router);

import LoginPage from './components/auth/LoginPage.vue';
import StatsPage from './components/ui/StatsPage.vue';
import BanPage from './components/auth/BanPage.vue';
import CharacterCreation from './components/auth/CharacterCreation.vue';
import AdminReports from './components/admin/AdminReports.vue';
import ClothingStore from './components/clothing/clothingStore.vue';
import VehicleCustoms from './components/customs/VehicleCustoms.vue';
import VehicleParking from './components/vehicle/ParkingLot.vue';

export default new Router({
    routes: [
        { path: '/login', component: LoginPage },
        { path: '/stats', component: StatsPage },
        { path: '/ban', component: BanPage },
        { path: '/charcreation', component: CharacterCreation },
        { path: '/reports', component: AdminReports },
        { path: '/clothing', component: ClothingStore },
        { path: '/vehiclemods', component: VehicleCustoms },
        { path: '/parking', component: VehicleParking }
    ]
});