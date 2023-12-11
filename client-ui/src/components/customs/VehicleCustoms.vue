<template>
    <body class="w-full text-white font-medium">
        <div class="flex justify-center mt-6">
            <div class="text-center p-2 bg-black/70 w-[70%] rounded-xl shadow-2xl shadow-black relative">
                <CloseButton resetGui="true" class="text-xl"/>
                Viewing mods for Kamacho - 1FFM6EMG
            </div>
        </div>

        <main class="relative">
            <div class="absolute left-[3%] top-20">
                <div class="container flex items-center w-[24vw] mx-auto">
                    <div class="flex justify-center w-full">
                        <div class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                            <div class="border-b-2 border-gray-500">
                                <h1 class="font-bold text-2xl pl-4 border-b-2 border-gray-500 pb-2 p-4"><i class="fa-solid fa-car text-gray-400"></i> Vehicle Customs</h1>

                                <ui class="flex justify-center space-x-5 border-gray-500 p-4">
                                    <button @click="browsingType = 'general'" class="hover:text-white">
                                        <i class="fa-solid fa-car text-2xl text-gray-300"></i><br />
                                        <span class="text-gray-300 hover:text-white duration-300">General</span>
                                    </button>

                                    <button @click="browsingType = 'performance'" class="hover:text-green-500 duration-300">
                                        <i class="fa-solid fa-gear text-2xl text-gray-300"></i><br />
                                        <span class="text-gray-300 hover:text-white duration-300">Performance</span>
                                    </button>

                                    <button @click="browsingType = 'wheels'" class="hover:text-green-500 duration-300">
                                        <i class="fa-solid fa-wrench text-2xl text-gray-300"></i><br />
                                        <span class="text-gray-300 hover:text-white duration-300">Wheels</span>
                                    </button>

                                    <button @click="browsingType = 'interior'" class="hover:text-green-500 duration-300">
                                        <i class="fa-solid fa-person-shelter text-2xl text-gray-300"></i><br />
                                        <span class="text-gray-300 hover:text-white duration-300">Interior</span>
                                    </button>
                                </ui>
                            </div>
                            {{ uiStates.vehicleSpeedoData }}

                            <div class="relative w-full h-fit rounded-lg border border-gray-900 text-center max-h-[37vw] overflow-scroll overflow-x-hidden">

                                <div class="p-4">

                                    <div class="pb-5 duration-300">
                                        <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Front bumper ({{formatMod(vehicleData.front_bumper)}})</label>
                                        <input id="steps-range" v-model="vehicleData.front_bumper" type="range" min="-1" max="20" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">
                                        <button @click="addToBasket('Front Bumper', vehicleData.front_bumper)" v-if="vehicleDataOld.front_bumper != vehicleData.front_bumper" class="border duration-300 w-[50%] p-0.5 mt-2 rounded-lg border-gray-500 hover:text-green-500">
                                            Add to Basket <i class="fa-solid fa-plus"></i>
                                        </button>
                                    </div>

                                    <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Front bumper ({{formatMod(vehicleData.front_bumper)}})</label>
                                    <input id="steps-range" v-model="vehicleData.front_bumper" type="range" min="0" max="10" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="absolute right-[3%] top-20">
                <div class="container flex items-center w-[24vw] mx-auto">
                    <div class="flex justify-center w-full">
                        <div class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none max-h-[37vw]">

                            <div class="border-b-2 p-4 border-gray-500">
                                <h1 class="font-bold text-2xl pl-4"><i class="fa-solid fa-cart-shopping text-gray-400"></i> Your basket</h1>
                            </div>

                            <div class="relative w-full h-fit rounded-lg border border-gray-900 text-center">

                                <div class="text-gray-300 p-4">
                                    <div v-if="basketItems.length == 0">
                                        You don't have anything in your basket. Choose something nice for your vehicle!
                                    </div>

                                    <div v-for="item in basketItems" :key="basketItems.indexOf(item)">
                                        <div>{{item}}</div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </main>
    </body>
</template>

<script>
import CloseButton from '../ui/CloseButton.vue';
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            browsingType: "general",
            basketItems: [],
            vehicleData: null,
            vehicleDataOld: null
        }
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
            uiStates: 'getUiStates'
        })
    },
    watch: {
        vehicleData: {
            handler() {
                if(window.mp) {
                    window.mp.trigger("vehicle:setAttachments", JSON.stringify(this.vehicleData), true);
                }
            },
            deep: true,
        },
    },
    components: {
        CloseButton
    },
    methods: {
        formatMod(modIdx) {
            return modIdx == -1 || modIdx <= 0 ? 0 : modIdx;
        },
        addToBasket(modName, modVal) {
            this.basketItems.push({
                name: modName,
                val: modVal
            });
        }
    },
    mounted() {
        if(window.mp) {
            window.mp.trigger("gui:toggleHudComplete", false);
        }

        this.vehicleData = this.playerData.vehicle_mod_data;
        this.vehicleDataOld = this.playerData.vehicle_mod_data_old;
    }
}
</script>