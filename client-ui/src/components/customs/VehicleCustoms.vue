<template>
    <body class="w-full text-white font-medium">
        <div v-if="!loadingState" class="flex justify-center mt-6">
            <div class="p-2 text-center w-[40%] relative">
                <div class="absolute w-full rounded-xl shadow-2xl shadow-black bg-black/70 p-2">
                    <font class="text-3xl font-bold">
                        <i class="fa-solid fa-car text-gray-400"></i>
                        Vehicle Customs
                    </font>
                </div>
            </div>
        </div>

        <main v-if="!loadingState" class="relative">
            <div class="absolute left-[3%] top-20">

                <div class="bg-black/70 shadow-2xl shadow-black rounded-xl">
                    <ui class="flex justify-center space-x-5 border-gray-500 p-4">
                        <button @click="browsingType = 'general'" class="hover:text-white">
                            <i class="fa-solid fa-car text-2xl text-gray-300"></i><br />
                            <span class="text-gray-300 hover:text-white duration-300">General</span>
                        </button>

                        <button @click="browsingType = 'performance'" class="hover:text-green-500 duration-300">
                            <i class="fa-solid fa-gear text-2xl text-gray-300"></i><br />
                            <span class="text-gray-300 hover:text-white duration-300">Performance</span>
                        </button>

                        <!-- <button @click="browsingType = 'interior'" class="hover:text-green-500 duration-300">
                            <i class="fa-solid fa-person-shelter text-2xl text-gray-300"></i><br />
                            <span class="text-gray-300 hover:text-white duration-300">Interior</span>
                        </button> -->

                        <button @click="browsingType = 'other'" class="hover:text-green-500 duration-300">
                            <i class="fa-solid fa-wrench text-2xl text-gray-300"></i><br />
                            <span class="text-gray-300 hover:text-white duration-300">Other</span>
                        </button>
                    </ui>
                </div>

                <div class="container flex items-center w-[24vw] mx-auto mt-14">
                    <div class="flex justify-center w-full">
                        <div
                            class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                            <div
                                class="relative w-full h-fit rounded-lg border border-gray-900 text-center max-h-[37vw] overflow-scroll overflow-x-hidden">

                                <div class="p-4">

                                    <div v-if="browsingType == 'general'">
                                        <div v-for="item in generalItems" :key="item">
                                            <div v-if="getMaxIdx(item.name) > 0" class="pb-5 duration-300">
                                                <label for="steps-range"
                                                    class="block mb-2 text-sm font-medium  text-white">{{ item.name }} ({{
                                                        formatMod(vehicleData[item.dbName]) }})</label>
                                                <input id="steps-range" v-model="vehicleData[item.dbName]" type="range"
                                                    :min="getMinIdx(item.name)" :max="getMaxIdx(item.name)"
                                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">
                                                <button @click="vehicleData[item.dbName] = vehicleDataOld[item.dbName]"
                                                    v-if="vehicleDataOld[item.dbName] != vehicleData[item.dbName] && !checkBasket(item.name, vehicleData[item.dbName])"
                                                    class="border duration-300 w-[20%] mr-4 p-0.5 mt-2 rounded-lg border-gray-500 hover:text-red-500">
                                                    Reset <i class="fa-solid fa-rotate-left text-red-500"></i>
                                                </button>
                                                <button @click="addToBasket(item.name, vehicleData[item.dbName])"
                                                    v-if="vehicleDataOld[item.dbName] != vehicleData[item.dbName] && !checkBasket(item.name, vehicleData[item.dbName])"
                                                    class="border duration-300 w-[20%] p-0.5 mt-2 rounded-lg border-gray-500 hover:text-green-500">
                                                    Add <i class="fa-solid fa-plus text-green-500"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="browsingType == 'performance'">
                                        <div v-for="item in performanceItems" :key="item">
                                            <div v-if="getMaxIdx(item.name) > 0" class="pb-5 duration-300">
                                                <label for="steps-range"
                                                    class="block mb-2 text-sm font-medium  text-white">{{ item.name }} ({{
                                                        formatMod(vehicleData[item.dbName]) }})</label>
                                                <input id="steps-range" v-model="vehicleData[item.dbName]" type="range"
                                                    :min="getMinIdx(item.name)" :max="getMaxIdx(item.name)"
                                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">
                                                <button @click="vehicleData[item.dbName] = vehicleDataOld[item.dbName]"
                                                    v-if="vehicleDataOld[item.dbName] != vehicleData[item.dbName] && !checkBasket(item.name, vehicleData[item.dbName])"
                                                    class="border duration-300 w-[20%] mr-4 p-0.5 mt-2 rounded-lg border-gray-500 hover:text-red-500">
                                                    Reset <i class="fa-solid fa-rotate-left text-red-500"></i>
                                                </button>
                                                <button @click="addToBasket(item.name, vehicleData[item.dbName])"
                                                    v-if="vehicleDataOld[item.dbName] != vehicleData[item.dbName] && !checkBasket(item.name, vehicleData[item.dbName])"
                                                    class="border duration-300 w-[20%] p-0.5 mt-2 rounded-lg border-gray-500 hover:text-green-500">
                                                    Add <i class="fa-solid fa-plus text-green-500"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div v-if="browsingType == 'other'">
                                        <div v-for="item in otherItems" :key="item">
                                            <div v-if="getMaxIdx(item.name) > 0" class="pb-5 duration-300">
                                                <label for="steps-range"
                                                    class="block mb-2 text-sm font-medium  text-white">{{ item.name }} ({{
                                                        formatMod(vehicleData[item.dbName]) }})</label>
                                                <input id="steps-range" v-model="vehicleData[item.dbName]" type="range"
                                                    :min="item.name == 'Colour One' || item.name == 'Colour Two' ? 0 : getMinIdx(item.name)"
                                                    :max="item.maxIdx ? item.maxIdx : getMaxIdx(item.name)"
                                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">
                                                <button @click="vehicleData[item.dbName] = vehicleDataOld[item.dbName]"
                                                    v-if="vehicleDataOld[item.dbName] != vehicleData[item.dbName] && !checkBasket(item.name, vehicleData[item.dbName])"
                                                    class="border duration-300 w-[20%] mr-4 p-0.5 mt-2 rounded-lg border-gray-500 hover:text-red-500">
                                                    Reset <i class="fa-solid fa-rotate-left text-red-500"></i>
                                                </button>
                                                <button @click="addToBasket(item.name, vehicleData[item.dbName])"
                                                    v-if="vehicleDataOld[item.dbName] != vehicleData[item.dbName] && !checkBasket(item.name, vehicleData[item.dbName])"
                                                    class="border duration-300 w-[20%] p-0.5 mt-2 rounded-lg border-gray-500 hover:text-green-500">
                                                    Add <i class="fa-solid fa-plus text-green-500"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="absolute right-[3%] top-20">

                <div class="bg-black/70 shadow-2xl shadow-black p-4 rounded-xl relative">
                    <div v-if="getCarImagePath" class="h-20">
                        <div class="float-left">
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
                        <img :src="getCarImagePath" alt="Car Image" class="w-32 h-20 rounded-xl float-right">

                    </div>
                </div>

                <div class="container flex items-center w-[24vw] mx-auto mt-14">
                    <div class="flex justify-center w-full">
                        <div
                            class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none max-h-[34vw]">

                            <div class="relative border-b-2 p-4 border-gray-500">
                                <h1 class="font-bold text-2xl pl-4"><i class="fa-solid fa-cart-shopping text-gray-400"></i>
                                    Your basket

                                    <font class="text-green-500 absolute right-10">${{
                                        getBasketPrice().toFixed(0).toLocaleString('en-US') }}</font>
                                </h1>
                            </div>

                            <div
                                class="relative w-full h-fit rounded-lg text-center max-h-[30vw] overflow-scroll overflow-x-hidden">

                                <div class="p-4">
                                    <div class="text-gray-300" v-if="basketItems.length == 0">
                                        You don't have anything in your basket. Choose something nice for your vehicle!
                                    </div>

                                    <div v-for="item in basketItems" :key="basketItems.indexOf(item)"
                                        class="bg-gray-500/40 p-4 rounded-lg"
                                        :class="basketItems.indexOf(item) == 0 ? '' : 'mt-4'">

                                        <div>
                                            <div class="relative">
                                                <div class="text-left">{{ item.name }}</div>
                                                <div class="text-left text-xs text-gray-300">Mod {{ item.val }}</div>

                                                <div class="absolute right-5 bottom-0">
                                                    <button @click="removeFromBasket(item.name, item.val)"
                                                        class="bg-red-500/40 p-2 pr-3 pl-3 rounded-lg"><i
                                                            class="fa-solid fa-trash"></i></button>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
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
                    <button @click="purchase"
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
            browsingType: "general",
            basketItems: [],
            vehicleData: null,
            vehicleDataOld: null,
            vehImage: null,
            generalItems: [
                {
                    name: "Front Bumper",
                    dbName: "front_bumper",
                },
                {
                    name: "Rear Bumper",
                    dbName: "rear_bumper",
                },
                {
                    name: "Side Skirt",
                    dbName: "side_skirt",
                },
                {
                    name: "Exhaust",
                    dbName: "exhaust",
                },
                {
                    name: "Wheel Type",
                    dbName: "wheel_type",
                },
                {
                    name: "Wheels",
                    dbName: "front_wheels",
                },
                {
                    name: "Frame",
                    dbName: "frame",
                },
                {
                    name: "Grille",
                    dbName: "grille",
                },
                {
                    name: "Hood",
                    dbName: "hood",
                },
                {
                    name: "Right Fender",
                    dbName: "right_fender",
                },
                {
                    name: "Fender",
                    dbName: "fender",
                }
            ],
            performanceItems: [
                {
                    name: "Engine",
                    dbName: "engine",
                },
                {
                    name: "Brakes",
                    dbName: "brakes",
                },
                {
                    name: "Transmission",
                    dbName: "transmission",
                },
                {
                    name: "Suspension",
                    dbName: "suspension",
                },
                {
                    name: "Turbo",
                    dbName: "turbo",
                },
            ],
            otherItems: [
                {
                    name: "Colour One",
                    dbName: "colour_1",
                },
                {
                    name: "Colour Two",
                    dbName: "colour_2",
                },
                {
                    name: "Pearlesceant",
                    dbName: "pearleascent",
                },
                {
                    name: "Wheel Colour",
                    dbName: "wheel_colour",
                },
                {
                    name: "Livery",
                    dbName: "livery",
                },
                {
                    name: "Xenon",
                    dbName: "xenon",
                    maxIdx: 0
                },
                {
                    name: "Horns",
                    dbName: "horns",
                },
                {
                    name: "Plate",
                    dbName: "plate",
                },
                {
                    name: "Window Tint",
                    dbName: "window_tint",
                },
            ]
        }
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
            uiStates: 'getUiStates',
            loadingState: 'getLoadingState'
        }),
        getCarImagePath() {
            try {
                const imageModule = require(`../../assets/img/cars/${this.uiStates.vehicleSpeedoData.dbName}.png`);
                return imageModule;
            } catch (error) {
                return require("../../assets/img/cars/sentinel.png");
            }
        },
    },
    watch: {
        vehicleData: {
            handler() {
                if (window.mp) {
                    window.mp.trigger("vehicle:setAttachments", JSON.stringify(this.vehicleData), true);
                }
            },
            deep: true,
        },
    },
    methods: {
        formatMod(modIdx) {
            return modIdx == -1 || modIdx <= 0 ? 0 : modIdx;
        },
        addToBasket(modName, modVal) {
            this.basketItems.forEach((data, idx) => {
                if (data.name == modName) {
                    this.basketItems.splice(idx, 1);
                }
            })

            this.basketItems.push({
                name: modName,
                val: modVal,
                price: 300
            });
        },
        checkBasket(modName, val) {
            let found = false;
            this.basketItems.forEach(data => {
                if (data.name == modName && data.val == val) {
                    found = true;
                }
            });

            return found;
        },
        removeFromBasket(modName, val) {
            console.log(modName, val);
            let delIdx;
            this.basketItems.forEach((data, idx) => {
                if (data.name == modName && data.val == val) {
                    delIdx = idx;
                }
            })

            if (delIdx != null) {
                this.basketItems.splice(delIdx, 1);
            }

        },
        getBasketPrice() {
            let price = 0;
            this.basketItems.forEach(data => {
                if (data.price) {
                    price += data.price;
                }
            });

            return price;
        },
        purchase() {
            this.$store.state.uiStates.serverLoading = true;
            if (window.mp) {
                window.mp.trigger("browser:sendObject", "server:vehicleModsSave", JSON.stringify(this.vehicleData));
            }
        },
        saveBasket() {
            this.$store.state.uiStates.serverLoading = true;

            setTimeout(() => {
                this.$store.state.uiStates.serverLoading = false;
            }, 4000);
        },
        close() {
            if (!window.mp) return;
            window.mp.trigger("browser:resetRouter");
            window.mp.trigger("gui:toggleHudComplete", true);
            window.mp.trigger("vehicle:setAttachments", JSON.stringify(this.vehicleDataOld), true);
        },
        getMaxIdx(modName) {
            let getMaxIdx = this.playerData.vehicle_mod_indexes;
            let foundIdx;

            getMaxIdx.forEach(data => {
                if (data.name == modName) {
                    foundIdx = data.modNumber;
                }
            });

            if (modName == "Colour One" || modName == "Colour Two") {
                foundIdx = 166;
            }

            if (modName == "Wheel Type") {
                foundIdx = 13;
            }

            if (modName == "Pearlesceant" || modName == "Wheel Colour") {
                foundIdx = 166;
            }

            if (modName == "Wheels" && this.vehicleData.wheel_type == 12) {
                foundIdx = 209;
            } else if (modName == "Wheels") {
                foundIdx = 50;
            }


            return foundIdx != null ? foundIdx == 0 ? foundIdx : foundIdx - 1 : 100;
        },
        getMinIdx(modName) {
            if (modName == "Wheel Colour" || modName == "Pearlesceant") {
                return 1;
            }
            return -1;
        }
    },
    mounted() {
        if (window.mp) {
            window.mp.trigger("gui:toggleHudComplete", false);
        }

        this.vehicleData = this.playerData.vehicle_mod_data;
        this.vehicleDataOld = this.playerData.vehicle_mod_data_old;

    }
}
</script>

<style>
@font-face {
    font-family: "UKNumberPlate";
    src: url('../../assets/fonts/UKNumberPlate.ttf');
}

#numberplate {
    font-family: "UKNumberPlate";
}
</style>