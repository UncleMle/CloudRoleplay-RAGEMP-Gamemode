<template>
    <main class="flex justify-center w-full">
        <div class="text-white">

            <div class="relative mt-52 colourBackground border-b-4 border-t-4 border-purple-400/50 p-3 rounded-xl">
                <h1 class="font-bold text-2xl pl-4">
                    <i class="fa-solid fa-car text-gray-300"></i> Vehicle Insurance
                </h1>
                <CloseButton />
            </div>

            <div class="container flex items-center w-[25vw] mx-auto mt-6">

                <div class="flex justify-center w-full">
                    <div class="rounded-xl w-full colourBackground border-t-4 border-b-4 border-purple-400/50 shadow-2xl shadow-black select-none">

                        <div class="relative w-full h-fit pb-2 rounded-xl">
                            <div class="max-h-[30vw] overflow-scroll overflow-x-hidden">

                                <button @click="currentView = 'home'" v-if="currentView !== 'home'" class="mt-2 ml-2">
                                    <i class="fa-solid fa-arrow-left duration-300 hover:text-gray-400 text-lg"></i>
                                </button>


                                <div v-if="currentView === 'home'" class="flex justify-center p-2 font-medium">

                                    <div class="w-full text-xl">

                                        <button @click="currentView = 'insurance'"
                                            class="p-4 border-2 rounded-xl w-full border-purple-400/50 duration-300 hover:text-purple-400">View
                                            Insurance</button>

                                        <button @click="currentView = 'insure'"
                                        class="p-4 border-2 rounded-xl w-full border-purple-400/50 duration-300 hover:text-purple-400 mt-4">
                                            Insure
                                            Vehicles</button>
                                    </div>

                                </div>


                                <div v-if="currentView === 'insurance'">
                                    <div v-for="(item, i) in playerData.insurance_vehicle_data" :key="i">
                                        <div class="border-t-2 w-full mt-6 relative p-6 border-b-2 border-gray-400/40">
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
                                            <button @click="removeFromInsurance(item.vehicle_id)"
                                                class=" mt-2 bg-green-500/50 p-1 font-medium rounded-lg pr-4 pl-4 hover:bg-green-500/80 duration-300">
                                                Select Vehicle
                                            </button>

                                            <button v-if="!item.insurance_status"
                                                class="ml-2 mt-2 bg-red-500/50 p-1 font-medium rounded-lg pr-4 pl-4">
                                                Uninsured
                                            </button>

                                            <div class="mt-3">
                                                <div class="absolute right-4 bottom-1 font-medium text-gray-300">
                                                    <p><i class="fa-solid fa-gauge"></i> {{ (item.vehicle_distance /
                                                        1000).toFixed(0) }}km </p>
                                                </div>
                                                <div v-if="item.vehicle_distance / 1609 > 0"
                                                    class="absolute right-4 bottom-7 font-medium text-gray-300">
                                                    <p><i class="fa-solid fa-gas-pump"></i> {{ item.vehicle_fuel.toFixed(0)
                                                    }}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>



                                    <div class="p-3 text-center pb-4 pt-4"
                                        v-if="playerData.insurance_vehicle_data == 0">
                                        You don't have any vehicles in this insurance.
                                    </div>

                                </div>

                                <div v-if="currentView === 'insure'">

                                    <div v-for="(item, i) in playerData.uninsured_vehicle_data" :key="i">
                                        <div class="border-t-2 w-full mt-6 relative p-6 border-b-2 border-gray-400/40">

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
                                            <button @click="insureVehicle(item.vehicle_id)"
                                                class=" mt-2 bg-green-500/50 p-1 font-medium rounded-lg pr-4 pl-4 hover:bg-green-500/80 duration-300">
                                                Purchase Insurance for ${{ insuranceFee.toLocaleString("en-US") }}
                                            </button>
                                            <div class="mt-3">
                                                <div class="absolute right-4 bottom-1 font-medium text-gray-300">
                                                    <p><i class="fa-solid fa-gauge"></i> {{ (item.vehicle_distance /
                                                        1000).toFixed(0) }}km </p>
                                                </div>
                                                <div v-if="item.vehicle_distance / 1609 > 0"
                                                    class="absolute right-4 bottom-7 font-medium text-gray-300">
                                                    <p><i class="fa-solid fa-gas-pump"></i> {{ item.vehicle_fuel.toFixed(0)
                                                    }}%
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="p-3 text-center pb-4 pt-4 "
                                        v-if="playerData.uninsured_vehicle_data.length == 0">
                                        You don't have any vehicles valid for insurance. Ensure the vehicles are parked
                                        next
                                        to the insurance company and don't already have insurance.
                                    </div>

                                </div>

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
import { getCarImagePath } from '../../helpers';
import { sendToServer } from '@/helpers';

export default {
    data() {
        return {
            currentView: "home",
            insuranceFee: 400
        }
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
        })
    },
    components: {
        CloseButton
    },
    methods: {
        getCarImagePath,
        removeFromInsurance(vehicleId) {
            sendToServer("server:removeVehicleFromInsurance", vehicleId);
        },
        insureVehicle(vehicleId) {
            sendToServer("server:insureVehicle", vehicleId);
        }
    }
}

</script>