<template>
    <main class="relative">
        <div class="absolute right-[3%] text-white">

            <div class="relative mt-52 bg-black/70 p-3 rounded-xl">
                <h1 class="font-bold text-2xl pl-4">
                    <i class="fa-solid fa-car text-gray-400"></i> Vehicle Parking
                </h1>
                <CloseButton />
            </div>

            <div class="container flex items-center w-[25vw] mx-auto mt-6">

                <div class="flex justify-center w-full">
                    <div class="rounded-xl w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit pb-2 rounded-lg border border-gray-900 ">
                            <div class="max-h-[30vw] overflow-scroll overflow-x-hidden">
                                <div v-for="item in playerData.parked_vehicles" :key="item.key_uuid">
                                    <div class="border-t-2 w-full mt-6 relative p-6 border-b-2 border-gray-500">
                                        <div v-if="getCarImagePath(item.vehicle_name)" class="absolute right-3">
                                            <img :src="getCarImagePath(item.vehicle_name)" alt="Car Image"
                                                class="w-30 h-20 rounded-xl" />
                                        </div>
                                        <font class="font-bold text-xl">
                                            {{ item.vehicle_display_name }}
                                        </font>
                                        <br />
                                        <div class="relative mt-2">
                                            <div id="numberplate" style="text-shadow: rgba(0, 0, 0, 0.563) 1px 0 10px;"
                                                class='bg-gray-300/40 w-40 text-center text-3xl outline-none rounded-lg'>
                                                {{ item.numberplate }}
                                            </div>
                                        </div>
                                        <button @click="unparkVeh(item.vehicle_id)"
                                            class=" mt-2 bg-green-500/50 p-1 font-medium rounded-lg pr-4 pl-4 hover:bg-green-500/80 duration-300">
                                            Select
                                        </button>
                                        <div class="mt-3">
                                            <div class="absolute right-4 bottom-1 font-medium text-gray-300">
                                                <p><i class="fa-solid fa-gauge"></i> {{ (item.vehicle_distance /
                                                    1000).toFixed(0) }}km </p>
                                            </div>
                                            <div v-if="item.vehicle_distance / 1609 > 0"
                                                class="absolute right-4 bottom-7 font-medium text-gray-300">
                                                <p><i class="fa-solid fa-gas-pump"></i> {{ item.vehicle_fuel.toFixed(0) }}%</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="p-3" v-if="playerData.parked_vehicles == 0">
                                You don't have any vehicles parked here.
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
import { mapGetters } from 'vuex';
import CloseButton from '../ui/CloseButton.vue';

export default {
    components: {
        CloseButton
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
            uiStates: 'getUiStates',
            loadingState: 'getLoadingState'
        }),
    },
    methods: {
        getCarImagePath(dbName) {
            try {
                const imageModule = require(`../../assets/img/cars/${dbName}.png`);
                return imageModule;
            } catch (error) {
                return require("../../assets/img/cars/sentinel.png");
            }
        },
        unparkVeh(vehId) {
            if (window.mp) {
                window.mp.trigger("browser:sendString", "server:unparkVehicle", vehId);
            }
        }
    }
}
</script>