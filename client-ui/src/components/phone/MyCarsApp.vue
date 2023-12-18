<template>
    <main class="w-full mt-2 relative">

        <button @click="viewState = 'home'" v-if="viewState != 'home'"
            class="absolute left-2 duration-300 hover:text-red-400">
            <i class="fa-solid fa-arrow-left"></i>
        </button>

        <div class="w-full overflow-y-scroll h-[60%]"
            v-if="viewState == 'home' && playerData.phone_data_player_vehicles.length">
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
                    {{ targetVehicleData.vehicle_insurance_id }}
                </div>

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
                                (targetVehicleData.vehicle_distance / 1609).toFixed(0) }}KM</font>
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

        <LoadingSpinner v-if="!playerData.phone_data_player_vehicles && viewState == 'home'" />
    </main>
</template>

<script>
import { mapGetters } from 'vuex';
import LoadingSpinner from '../ui/LoadingSpinner.vue';
import getCarImagePath from '@/helpers';

export default {
    data() {
        return {
            insurances: ['Mors Mutual', 'Paleto Bay'],
            viewState: "home",
            targetVehicleData: { "key_uuid": "d77c4e49-8f9e-47b7-a2ab-30f6889b65a8", "vehicle_id": 5, "vehicle_uuid": "2b7d6a2b-fd57-4b7e-9a80-a66b232b1e42", "owner_id": 1, "vehicle_name": "kamacho", "vehicle_locked": true, "vehicle_spawn_hash": 4173521127, "numberplate": "5OBIKVLY", "position_x": -56.3845, "position_y": -1116.38, "position_z": 26.1103, "rotation": -176.866, "vehicle_dimension": "world", "vehicle_insurance_id": 0, "vehicle_garage_id": 3, "vehicle_fuel": 89.71223123359677, "vehicle_distance": 45246, "vehicle_doors": [false, false, false, false, false, false], "vehicle_windows": [false, false, false, false, false, false], "engine_status": false, "indicator_status": -1, "vehicle_siren": false, "emergency_lights": false, "vehicle_mods": null, "vehicle_key_holders": [], "dirt_level": 6, "vehicle_fuel_purchase": -1, "vehicle_fuel_purchase_price": 0, "player_refuelling_char_id": -1, "CreatedDate": "2023-12-14T11:13:39.501036", "UpdatedDate": "2023-12-18T10:18:52.014416" },
            fetchVehiclesEvent: "server:myCarsApp::fetchVehicles",
        }
    },
    components: {
        LoadingSpinner
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
        getAllVehicleData() {
            window.mp.trigger("browser:sendString", this.fetchVehiclesEvent);
        },
        trackVehicle() {
            if (this.targetVehicleData) {
                window.mp.trigger("phone:trackVehicle", this.targetVehicleData.numberplate, this.targetVehicleData.position_x, this.targetVehicleData.position_y, this.targetVehicleData.position_z);
            }
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