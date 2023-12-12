<template>
    <main class="relative">
        <div class="absolute right-[3%] ">
            <div class="container flex items-center w-[25vw] mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg border border-gray-900 ">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-car text-gray-400"></i> Vehicle Parking</h1>
                            <CloseButton />

                            <div class="max-h-[50vw] overflow-scroll overflow-x-hidden">
                                <div v-for="item in playerData.parked_vehicles" :key="item.key_uuid">
                                    <div class="bg-black/40 w-full mt-6 relative p-6 border-b-2 border-gray-500">
                                        <div v-if="getCarImagePath(item.vehicle_name)" class="absolute right-3">
                                            <img :src="getCarImagePath(item.vehicle_name)" alt="Car Image" class="w-30 h-20 rounded-xl" />
                                        </div>
                                        <font class="font-bold text-xl">
                                            {{ item.vehicle_name }}
                                        </font>
                                        <br />
                                        <div class="relative mt-2">
                                            <div id="numberplate" style="text-shadow: rgba(0, 0, 0, 0.563) 1px 0 10px;"
                                                class='bg-gray-300/40 w-40 text-center text-3xl outline-none rounded-lg'>
                                                {{item.numberplate}}
                                            </div>
                                        </div>
                                        <button @click="unparkVeh(item.vehicle_id)" class="mt-2 bg-green-500/50 p-1 font-medium rounded-lg pr-4 pl-4 hover:bg-green-500/80 duration-300">
                                            Select
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <div v-if="playerData.parked_vehicles == 0">
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
                return "";
            }
        },
        unparkVeh(vehId) {
            if(window.mp) {
                window.mp.trigger("browser:sendString", "server:unparkVehicle", vehId);
            }
        }
    }
}
</script>