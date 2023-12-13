<template>
    <body class="w-full text-white font-medium">
        <div v-if="!loadingState" class="flex justify-center mt-6">
            <div class="p-2 text-center w-[40%] relative">
                <div class="absolute w-full rounded-xl shadow-2xl shadow-black bg-black/70 p-2">
                    <font class="text-2xl font-bold">
                        <i class="fa-solid fa-car text-gray-400"></i>
                        Vehicle Dealership
                    </font>
                </div>
            </div>
        </div>

        <main v-if="!loadingState" class="relative">
            <div class="absolute left-[3%] top-20">

                <div class="bg-black/70 shadow-2xl shadow-black rounded-xl">
                    <ui class="flex justify-center space-x-5 border-gray-500 p-4">
                        Choose a vehicle
                    </ui>
                </div>

                <div class="container flex items-center w-[24vw] mx-auto mt-14">
                    <div class="flex justify-center w-full">
                        <div class="rounded-xl text-white w-full select-none">

                            <div
                                class="relative w-full h-fit rounded-lg text-center max-h-[37vw] overflow-scroll overflow-x-hidden">

                                <div class="p-4">
                                    <div v-for="item in playerData.vehicle_dealer_data.vehicles"
                                        :key="playerData.vehicle_dealer_data.vehicles.indexOf(item)">


                                        <div class="bg-black/70 shadow-md shadow-black/70 h-32 p-4 rounded-xl relative"
                                            :class="playerData.vehicle_dealer_data.vehicles.indexOf(item) == 0 ? '' : 'mt-6'">
                                            <div class="relative w-full">
                                                <img :src="getCarImagePath(item)" alt="Car Image"
                                                    class="absolute rounded-xl w-40" />

                                                <font class="absolute font-bold text-2xl">{{ playerData.vehicle_dealer_data.vehDispNames[playerData.vehicle_dealer_data.vehicles.indexOf(item)] }}</font>
                                            </div>


                                            <button @click="viewVehicle(item)" class="absolute bottom-4 w-[40%] rounded-lg border border-gray-500 duration-300 hover:text-green-400">
                                                View
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="absolute right-[3%] top-20">

                <div class="bg-black/70 shadow-2xl shadow-black p-4 rounded-xl relative h-full">
                    <div v-if="getCarImagePath" class="absolute left-3">
                        <img :src="getCarImagePath" alt="Car Image" class="w-70  h-20 rounded-xl" />
                    </div>
                    <div class="ml-[24%]" :class="getCarImagePath ? 'left-40' : 'left-3'">
                        <font class="font-bold text-xl">
                            {{ uiStates.vehicleSpeedoData.displayName != "NULL" ?
                                uiStates.vehicleSpeedoData.displayName :
                                "Vehicle" }}
                        </font>
                        <br />
                        <div class="relative mt-2">
                            <div id="numberplate" style="text-shadow: rgba(0, 0, 0, 0.563) 1px 0 10px;"
                                class='bg-gray-300/40 w-40 text-center text-3xl outline-none rounded-lg'>
                                {{ uiStates.vehicleSpeedoData.numberPlate }}
                            </div>
                        </div>
                    </div>

                </div>

                <div class="container flex items-center w-[24vw] mx-auto mt-14">
                    <div class="flex justify-center w-full">
                        <div
                            class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none max-h-[34vw]">

                            <div class="relative border-b-2 p-4 border-gray-500">
                                <h1 class="font-bold text-2xl pl-4"><i class="fa-solid fa-cart-shopping text-gray-400"></i>

                                </h1>
                            </div>

                            <div
                                class="relative w-full h-fit rounded-lg text-center max-h-[30vw] overflow-scroll overflow-x-hidden">

                                <div class="p-4">



                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="fixed bottom-4 space-x-16 text-2xl w-full">
                <div class="flex justify-center space-x-16">
                    <button @click="close"
                        class="w-[250px] duration-300 hover:text-red-400 shadow-black shadow-2xl p-2 rounded-lg bg-black/70 border-gray-500">
                        Close <i class="fa-solid fa-rotate-left text-red-400"></i>
                    </button>
                    <button
                        class="w-[250px] duration-300 p-2 rounded-lg hover:text-green-400 shadow-black shadow-2xl bg-black/70 border-gray-500">
                        Purchase
                        <i class="fa-solid fa-dollar-sign text-green-400"></i>
                    </button>
                </div>
            </div>
        </main>

        <div v-if="loadingState" class="flex bg-black/70 h-screen items-center justify-center">
            <b role="status" class="flex justify-center">
                <svg class="h-20 w-20 animate-spin text-gray-500 fill-black/30" viewBox="0 0 100 101" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                        fill="currentColor" />
                    <path
                        d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                        fill="currentFill" />
                </svg>
            </b>
        </div>

    </body>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            closeDealerEvent: "dealers:closeDealership",
            selectedVehicle: {}
        }
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
            uiStates: 'getUiStates',
            loadingState: 'getLoadingState'
        }),
    },
    mounted() {
        if (window.mp) {
            window.mp.trigger("gui:toggleHudComplete", false);
        }
    },
    methods: {
        close() {
            if (!window.mp) return;
            window.mp.trigger("browser:resetRouter");
            window.mp.trigger("dealers:closeDealership");
        },
        getCarImagePath(name) {
            try {
                const imageModule = require(`../../assets/img/cars/${name}.png`);
                return imageModule;
            } catch (error) {
                return require("../../assets/img/cars/sentinel.png");
            }
        },
        viewVehicle(name) {
            if(!window.mp) return;
            this.selectedVehicle = name;
            window.mp.trigger("dealers:changeSelectVeh", name);
        }
    }
}
</script>