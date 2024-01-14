<template>
    <main class="w-full mt-2 relative">

        <button @click="backToHome" v-if="viewState != 'home'" class="absolute left-2 duration-300 hover:text-red-400">
            <i class="fa-solid fa-arrow-left"></i>
        </button>

        <div class="w-full overflow-y-scroll h-[90%]" v-if="viewState == 'home' && playerData.phone_data_player_vehicles">
            <div v-for="(item, i) in playerData.phone_data_player_vehicles" :key="i">
                <div class="relative border border-gray-700 rounded-lg p-3 mt-3 mr-1 ml-1">
                    <img :src="getCarImagePath(item.vehicle_name)" class="w-20 h-10 rounded-lg" />
                    <font class="absolute text-gray-400">{{ item.numberplate }}</font>
                    <div class="p-2">
                        <font class="absolute right-3 top-2">{{ item.vehicle_name }}</font>
                        <button @click="viewVehicleData(item.vehicle_id)"
                            class="absolute right-3 bottom-2 bg-green-400/50 duration-300 hover:bg-green-400/80 p-0.2 w-[30%] rounded-lg">
                            View
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-center mt-10 w-full" v-if="viewState == 'vehData'">
            <div>
                <img :src="getCarImagePath(targetVehicleData.vehicle_name)" class="w-52 h-32 rounded-lg" />

                <div class="text-center mt-2">
                    {{ targetVehicleData.numberplate }}
                </div>

                <button @click="manage"
                    class="w-full bg-gray-600 outline outline-green-200/20 p-1 rounded-lg mt-3 duration-300 hover:text-green-400">
                    Manage Key Holders
                </button>

                <div v-if="targetVehicleData.vehicle_dimension == 'world'" class="mt-2 text-lg">
                    <div class="relative h-5 w-full">
                        <font class="absolute left-0 top-2">Track Vehicle</font>
                        <font class="absolute right-0 top-2">
                            <button @click="trackVehicle" class="text-green-400 duration-300 hover:text-green-600">
                                <i class="fa-solid fa-location-dot"></i>
                            </button>
                        </font>
                    </div>
                </div>
                <div class="mt-4 text-lg">
                    <div class="relative h-5 w-full">
                        <font class="absolute left-0 top-2">Fuel</font>
                        <font class="absolute right-0 top-2"><i class="fa-solid fa-gas-pump pr-2 text-red-400"></i>{{
                            targetVehicleData.vehicle_fuel.toFixed(0) }}%</font>
                    </div>
                </div>
                <div class="mt-4 text-lg">
                    <div class="relative h-5 w-full">
                        <font class="absolute left-0 top-2">Distance</font>
                        <font class="absolute right-0 top-2 overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px]">
                            <i class="fa-solid fa-gauge pr-2 text-orange-400"></i>{{
                                (targetVehicleData.vehicle_distance / 1609).toFixed(0) }}KM
                        </font>
                    </div>
                </div>
                <div class="mt-4 text-lg">
                    <div class="relative h-5 w-full">
                        <font class="absolute left-0 top-2">Status</font>
                        <font class="absolute right-0 top-2">{{
                            targetVehicleData.vehicle_dimension }}</font>
                    </div>
                </div>
                <div class="mt-4 text-lg" v-if="targetVehicleData.vehicle_dimension == 'insurance'">
                    <div class="relative h-5 w-full">
                        <font class="absolute left-0 top-2">Insurance</font>
                        <font class="absolute right-0 top-2">
                            {{ insurances[targetVehicleData.vehicle_insurance_id] }}
                        </font>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex justify-center mt-7 w-full" v-if="viewState == 'manageVeh'">
            <div class="mr-4 ml-4 text-center">
                <h1 class="border-b-2 border-gray-600 pb-1 text-md">Add a new keyholder</h1>
                <input v-model="keyHolderId" class="w-full p-2 rounded-lg bg-transparent border border-gray-600 mt-3" placeholder="Player ID...">
                <input v-model="keyHolderNick" class="w-full p-2 mt-5 rounded-lg bg-transparent border border-gray-600" placeholder="Nickname...">

                <button @click="addKey" class="mt-3 border w-full p-0.5 rounded-lg border-gray-600 duration-300 hover:text-green-400">Add <i
                        class="fa-solid fa-plus"></i></button>

                <div v-if="targetVehicleData.vehicle_key_holders && targetVehicleData.vehicle_key_holders.length > 0">
                    <h1 class="mt-2 border-b-2 pb-1 border-gray-600">Current Key Holders</h1>
                    <div class="mt-2" v-for="(item, i) in targetVehicleData.vehicle_key_holders" :key="i">
                        <div class="relative border p-2 text-right rounded-lg border-gray-600">
                            <font class="absolute left-2 max-w-[65%] overflow-hidden text-ellipsis whitespace-nowrap">
                                {{ item.nickname }}</font>
                            <button @click="removeKey(item)" class="">
                                <i class="fa-solid fa-trash text-red-400 duration-300 hover:text-red-200"></i>
                            </button>
                        </div>
                    </div>
                </div>
                <div v-else>
                    <h1 class="mt-6 text-gray-400">You haven't given this vehicle's key to anyone.</h1>
                </div>

            </div>

        </div>

        <LoadingSpinner class="mt-6" v-if="!playerData.phone_data_player_vehicles && viewState == 'home'" />
    </main>
</template>

<script>
import { mapGetters } from 'vuex';
import LoadingSpinner from '../ui/LoadingSpinner.vue';
import { getCarImagePath } from '@/helpers';

export default {
    data() {
        return {
            insurances: ['Mors Mutual', 'Paleto Bay'],
            viewState: "home",
            keyHolderId: "",
            keyHolderNick: "",
            targetVehicleData: "",
            fetchVehiclesEvent: "server:myCarsApp::fetchVehicles",
        }
    },
    components: {
        LoadingSpinner
    },
    watch: {
        targetVehicleData() {
            console.log(JSON.stringify(this.targetVehicleData));
        }
    },
    methods: {
        getCarImagePath,
        viewVehicleData(vehicleId) {
            this.viewState = 'vehData';
            this.getAllVehicleData();

            this.playerData.phone_data_player_vehicles.forEach(data => {
                if (data.vehicle_id == vehicleId) {
                    this.targetVehicleData = data;
                }
            });
        },
        backToHome() {
            if (this.viewState == 'manageVeh') {
                this.viewState = 'vehData';
            } else {
                this.viewState = 'home';
            }
        },
        getAllVehicleData() {
            if (window.mp) {
                window.mp.trigger("browser:sendString", this.fetchVehiclesEvent);
            }
        },
        trackVehicle() {
            if (this.targetVehicleData && window.mp) {
                window.mp.trigger("phone:trackVehicle", this.targetVehicleData.numberplate, this.targetVehicleData.position_x, this.targetVehicleData.position_y, this.targetVehicleData.position_z);
            }
        },
        manage() {
            this.viewState = "manageVeh";
        },
        addKey() {
            window.mp.trigger("browser:sendObject", "server:addVehicleKey", JSON.stringify({
                nameOrId: this.keyHolderId,
                nickname: this.keyHolderNick,
                vehicleId: this.targetVehicleData.vehicle_id
            }));

            this.getAllVehicleData();
            this.viewState = "home";

            this.keyHolderId = "";
            this.keyHolderNick = "";
        },
        removeKey(keyData) {
            window.mp.trigger("browser:sendObject", "server:removeKey", JSON.stringify({
                keyId: keyData.vehicle_key_id,
                vehicle_id: keyData.vehicle_id
            }));

            this.getAllVehicleData();
            this.viewState = "home";
        }
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    created() {
        this.getAllVehicleData();
    }
}

</script>