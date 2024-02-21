<template>
    <body class="w-full text-white font-medium">
        <div v-if="!loadingState" class="flex justify-center mt-6">
            <div class="p-2 text-center w-[40%] relative">
                <div
                    class="absolute w-full rounded-xl shadow-2xl shadow-black colourBackground p-2 border-b-4 border-t-4 border-purple-400/50">
                    <font class="text-2xl font-bold">
                        <i class="fa-solid fa-car text-gray-300"></i>
                        Vehicle Dealership
                    </font>
                </div>
            </div>
        </div>

        <main v-if="!loadingState" class="relative">
            <div class="absolute left-[1%] top-20">

                <div class="colourBackground border-b-4 border-t-4 border-purple-400/50 shadow-2xl shadow-black rounded-xl">
                    <ui class="flex justify-center space-x-5 border-gray-400/40 p-4">
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


                                        <div class="colourBackground border-b-4 border-t-4 border-purple-400/50 shadow-md shadow-black/70 h-32 p-4 rounded-xl relative"
                                            :class="playerData.vehicle_dealer_data.vehicles.indexOf(item) == 0 ? '' : 'mt-6'">
                                            <div class="relative w-full">
                                                <img :src="getCarImagePath(item.spawnName)" alt="Car Image"
                                                    class="absolute rounded-xl w-40 h-24" />

                                                <font class="absolute font-bold text-2xl">
                                                    {{
                                                        playerData.vehicle_dealer_data.vehDispNames[playerData.vehicle_dealer_data.vehicles.indexOf(item)]
                                                    }}
                                                </font>

                                            </div>

                                            <font class="absolute bottom-14 text-green-400">${{
                                                item.price?.toLocaleString('en-US') }}</font>

                                            <button @click="viewVehicle(item.spawnName)"
                                                class="absolute bottom-4 w-[40%] border-b-4 border-purple-400/50 duration-300 hover:text-purple-300">
                                                <i class="fa-solid fa-eye"></i> View
                                            </button>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="absolute right-[1%] top-20">
                <div v-if="playerData.vehicle_performance_data"
                    class="colourBackground shadow-2xl shadow-black p-4 rounded-xl relative h-full w-[24vw] font-medium border-b-4 border-t-4 border-purple-400/50">
                    <div class="w-full">
                        <div class=" w-full duration-300">

                            <div class="mt-2">Acceleration</div>
                            <div class="p-3 duration-300 bg-purple-400/30 mt-2 text-center rounded-lg max-w-full"
                                :style="{ 'width': playerData.vehicle_performance_data.maxTraction * 30 + '%' }">
                                {{ (playerData.vehicle_performance_data.maxTraction * 30).toFixed(0) }}%</div>

                            <div class="mt-2">Top Speed</div>
                            <div class="p-3 duration-300 bg-purple-400/30 mt-2 text-center rounded-lg max-w-full"
                                :style="{ 'width': playerData.vehicle_performance_data.estimatedMaxSpeed * 1.4 + '%' }">
                                {{ (playerData.vehicle_performance_data.estimatedMaxSpeed * 1.4).toFixed(0) }}%</div>

                            <div class="mt-2">Brakes</div>
                            <div class="p-3 duration-300 bg-purple-400/30 mt-2 text-center rounded-lg max-w-full"
                                :style="{ 'width': (playerData.vehicle_performance_data.maxBraking * 100).toFixed(0) + '%' }">
                                {{ (playerData.vehicle_performance_data.maxBraking * 100).toFixed(0) }}%</div>


                        </div>
                    </div>
                </div>

                <div class="colourBackground shadow-2xl shadow-black rounded-xl border-t-4 border-b-4 border-purple-400/50"
                    :class="playerData.vehicle_performance_data ? 'mt-14' : ''">
                    <ui class="flex justify-center space-x-5 p-4">
                        Choose your vehicle's colour
                    </ui>
                </div>

                <div
                    class="colourBackground border-b-4 border-t-4 border-purple-400/50 shadow-2xl shadow-black p-4 rounded-xl relative h-full w-[24vw] mt-14">
                    <div class="grid grid-cols-4 gap-4">
                        <div class="text-center" v-for="item in possibleVehicleColours"
                            :key="possibleVehicleColours.indexOf(item)">
                            <button @click="selectedColour = item.rage" class="w-20 h-20 rounded-full"
                                :style="{ 'background-color': item.html }">
                            </button>
                        </div>
                    </div>
                </div>

            </div>

            <div class="fixed bottom-4 text-2xl w-full">

                <div class="flex justify-center ">
                    <div
                        class="w-[450px] colourBackground border-b-4 border-t-4 border-purple-400/50 shadow-2xl shadow-black/60 pr-4 pl-4 pt-1 pb-2 rounded-lg">
                        <label for="steps-range" class="block mb-2 text-sm font-medium  text-white text-center">Rotation {{
                            rotation }}°</label>
                        <input id="steps-range" v-model="rotation" type="range" min="0" max="360"
                            class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-purple-400/30 border border-gray-400/40 accent-gray-300 accent-shadow-lg accent-shadow-black">
                    </div>
                </div>

                <div class="flex justify-center mt-6 space-x-16">

                    <button @click="close"
                        class="w-[250px] duration-300 hover:text-red-400 border-t-4 border-b-4 shadow-black shadow-2xl p-2 rounded-lg colourBackground border-red-400/50">
                        Close <i class="fa-solid fa-rotate-left text-red-400"></i>
                    </button>
                    <button @click="purchaseVehicle"
                        class="w-[250px] duration-300 p-2 rounded-lg hover:text-purple-400 shadow-black shadow-2xl colourBackground border-b-4 border-t-4 border-purple-400/50">
                        Purchase
                        <i class="fa-solid fa-dollar-sign text-purple-400"></i>
                    </button>
                </div>
            </div>
        </main>

        <div v-if="loadingState" class="flex colourBackground h-screen items-center justify-center">
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
            selectedVehicle: {},
            rotation: 180,
            possibleVehicleColours: [
                { html: "#fffff6", rage: 111 },
                { html: "#f78616", rage: 38 },
                { html: "#66b81f", rage: 55 },
                { html: "#2446a8", rage: 79 },
                { html: "#ffcf20", rage: 88 },
                { html: "#df5891", rage: 137 },
                { html: "#f21f99", rage: 135 },
                { html: "#c00e1a", rage: 27 },
            ],
            selectedColour: 111
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
        window.mp.trigger("gui:toggleHudComplete", false);

        this.selectedVehicle = this.playerData.vehicle_dealer_data.vehicles[0].spawnName;
    },
    watch: {
        rotation() {
            window.mp.trigger("dealers:setSelectedVehRot", this.rotation)
        },
        selectedColour() {
            window.mp.trigger("dealers:changeSelectVehColour", this.selectedColour);
        }
    },
    methods: {
        close() {
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
            this.selectedVehicle = name;
            window.mp.trigger("dealers:changeSelectVeh", name, this.rotation, this.selectedColour);
        },
        purchaseVehicle() {
            if (!this.selectedVehicle) return;
            this.$store.state.uiStates.serverLoading = true;
            window.mp.trigger("dealers:purchaseVehicle", this.selectedVehicle, this.selectedColour);
        }
    }
}
</script>