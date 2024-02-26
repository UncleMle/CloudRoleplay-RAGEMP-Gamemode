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
import VehicleDealerships from './components/dealership/VehicleDealerships.vue';
import TattooStore from './components/tattoos/TattooStore.vue';
import VehicleInsurance from './components/vehicleInsurance/VehicleInsurance.vue';
import HelpModal from './components/help/HelpModal.vue';
import PlayerAtm from './components/atm/PlayerAtm.vue';
import BusRoutes from './components/jobs/BusDriver/BusRoutes.vue';
import TruckerJobsView from './components/jobs/TruckerJob/TruckerJobsView.vue';
import PostalJobView from './components/jobs/PostalJob/PostalJobView.vue';
import GruppeSixJobView from './components/jobs/GruppeSix/GruppeSixJobView.vue';
import LicensePage from './components/ui/LicensePage.vue';
import DmvRouteView from './components/dmv/DmvRouteView.vue';
import UniformView from './components/factionSystem/UniformView.vue';
import BarberView from './components/barber/BarberView.vue';
import PromptMenu from './components/PromptMenu/PromptMenu.vue';
import JobCenter from './components/jobs/JobCenter.vue';
import FinesView from './components/police/FinesView.vue';

export default new Router({
    routes: [
        { path: '/login', component: LoginPage },
        { path: '/stats', component: StatsPage },
        { path: '/ban', component: BanPage },
        { path: '/charcreation', component: CharacterCreation },
        { path: '/reports', component: AdminReports },
        { path: '/clothing', component: ClothingStore },
        { path: '/vehiclemods', component: VehicleCustoms },
        { path: '/parking', component: VehicleParking },
        { path: '/dealerships', component: VehicleDealerships },
        { path: '/tattoos', component: TattooStore },
        { path: '/insurance', component: VehicleInsurance },
        { path: '/help', component: HelpModal },
        { path: '/atm', component: PlayerAtm },
        { path: '/busroutes', component: BusRoutes },
        { path: '/truckerjobs', component: TruckerJobsView },
        { path: '/postaljobview', component: PostalJobView },
        { path: '/gruppesixview', component: GruppeSixJobView },
        { path: '/licenseview', component: LicensePage },
        { path: '/dmvcourseview', component: DmvRouteView },
        { path: '/factionuniform', component: UniformView },
        { path: '/barbershop', component: BarberView },
        { path: '/promptscreen', component: PromptMenu },
        { path: '/jobcenter', component: JobCenter },
        { path: '/viewfines', component: FinesView }
    ]
});