<template>
    <main class="relative">
        <div class="absolute right-[3%] ">
            <div class="container flex items-center w-[18vw] mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg border border-gray-900 ">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-shirt text-gray-400"></i> Clothing Store</h1>
                            <CloseButton :callback="close" />

                            <ui class="flex justify-center mt-2 space-x-10 border-b-2 pb-2 border-gray-500">
                                <button @click="browsingType = 'top'" class="hover:text-white">
                                    <img src="../../assets/img/shirt.png" class="w-9">
                                    <span class="text-gray-300 hover:text-white duration-300">Tops</span>
                                </button>

                                <button @click="browsingType = 'pants'" class="hover:text-green-500 duration-300">
                                    <img src="../../assets/img/pants.png" class="w-9">
                                    <span class="text-gray-300 hover:text-white duration-300">Pants</span>
                                </button>

                                <button @click="browsingType = 'shoes'" class="hover:text-green-500 duration-300">
                                    <img src="../../assets/img/shoes.png" class="w-9">
                                    <span class="text-gray-300 hover:text-white duration-300">Shoes</span>
                                </button>

                                <button @click="browsingType = 'masks'" class="hover:text-green-500 duration-300">
                                    <img src="../../assets/img/theater.png" class="w-9">
                                    <span class="text-gray-300 hover:text-white duration-300">Masks</span>
                                </button>
                            </ui>

                            <div class="p-6" v-if="clothingData">
                                <div v-if="browsingType == 'top'">

                                    <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Top ({{ clothingData.top }})</label>
                                    <input id="steps-range" v-model="clothingData.top" type="range" min="0" max="392" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                    <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Top Variant ({{ clothingData.top_texture }})</label>
                                    <input id="steps-range" v-model="clothingData.top_texture" type="range" min="0" max="10" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                    <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Undershirt ({{ clothingData.undershirt == -1 ? 0 : clothingData.undershirt  }})</label>
                                    <input id="steps-range" v-model="clothingData.undershirt" type="range" min="-1" max="188" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                    <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Undershirt Variant ({{ clothingData.undershirt_texture }})</label>
                                    <input id="steps-range" v-model="clothingData.undershirt_texture" type="range" min="0" max="10" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                    <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Torso ({{ clothingData.torso }})</label>
                                    <input id="steps-range" v-model="clothingData.torso" type="range" min="0" max="10" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                </div>

                                <div v-if="browsingType == 'pants'">

                                    <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Pants ({{ clothingData.leg }})</label>
                                    <input id="steps-range" v-model="clothingData.leg" type="range" min="0" max="143" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                    <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Pants Variant ({{ clothingData.leg_texture }})</label>
                                    <input id="steps-range" v-model="clothingData.leg_texture" type="range" min="0" max="10" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                </div>

                                <div v-if="browsingType == 'shoes'">

                                    <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Shoes ({{ clothingData.shoes }})</label>
                                    <input id="steps-range" v-model="clothingData.shoes" type="range" min="0" max="101" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                    <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Shoes Variant ({{ clothingData.shoes_texture }})</label>
                                    <input id="steps-range" v-model="clothingData.shoes_texture" type="range" min="0" max="10" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                </div>

                                <div v-if="browsingType == 'masks'">

                                    <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Masks ({{ clothingData.mask }})</label>
                                    <input id="steps-range" v-model="clothingData.mask" type="range" min="0" max="196" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                    <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Masks Variant ({{ clothingData.mask_texture }})</label>
                                    <input id="steps-range" v-model="clothingData.mask_texture" type="range" min="0" max="10" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                </div>
                            </div>
                            <div v-else>
                                <LoadingSpinner />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div class="text-center mt-5 text-white font-medium bg-black/50 p-3 rounded-lg">
                <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Rotation ({{ rotation }})</label>
                <input id="steps-range" v-model="rotation" type="range" min="0" max="360" class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">
            </div>

            <div class="text-center mt-5 text-white font-medium">
                <button v-if="!loadingState" :disabled="loadingState"  @click="buyClothes" class="bg-black/60 w-full p-3 rounded-xl duration-300 hover:text-green-400"><i class="fa-solid fa-cart-shopping"></i> Purchase clothing</button>
                <LoadingSpinner class="bg-black/60 w-full p-3 rounded-xl" v-if="loadingState" />
            </div>
        </div>
    </main>
</template>

<script>
import { mapGetters } from 'vuex';
import LoadingSpinner from '../ui/LoadingSpinner.vue';
import CloseButton from '../ui/CloseButton.vue';

export default {
    components: {
        LoadingSpinner,
        CloseButton
    },
    data() {
        return {
            clothingData: null,
            clothingDataOld: null,
            browsingType: "top",
            rotation: 180
        }
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
            loadingState: 'getLoadingState',
        })
    },
    watch: {
        clothingData: {
            handler() {
                if(window.mp) {
                    window.mp.trigger("clothes:setClothingData", JSON.stringify(this.clothingData), true);
                }
            },
            deep: true,
        },
        rotation() {
            if(window.mp) {
                window.mp.trigger("clothes:setRot", this.rotation);
            }
        }
    },
    methods: {
        buyClothes() {
            this.$store.state.uiStates.serverLoading = true;
            if(window.mp) {
                window.mp.trigger("browser:sendObject", "server:handleClothesPurchase", JSON.stringify(this.clothingData));
            }
        },
        close() {
            if(window.mp) {
                window.mp.trigger("clothes:setClothingData", JSON.stringify(this.clothingDataOld), true);
            }
        },
        checkForDifference() {
            let isDiff = false;

            Object.keys(this.clothingData).forEach((data, idx) => {
                if(this.clothingDataOld[idx] != data) {
                    isDiff = true;
                }
            })

            return isDiff;
        }
    },
    created() {
        if (!this.playerData.clothing_data) return;

        if (window.mp) {
            window.mp.trigger("clothes:setClothingData", this.playerData.clothing_data, true);
        }
        this.clothingDataOld = this.playerData.clothing_data_old;
        this.clothingData = this.playerData.clothing_data;
        console.log(JSON.stringify(this.playerData.clothing_data));
    }
}
</script>