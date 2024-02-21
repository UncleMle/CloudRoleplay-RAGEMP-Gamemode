<template>
    <main class="relative">
        <div class="absolute right-[3%] text-white">

            <div class="relative mt-20 bg-black/70 p-3 rounded-xl">
                <h1 class="font-bold text-2xl pl-4">
                    <i class="fa-solid fa-scissors text-gray-400"></i> Barber Shop
                </h1>
                <CloseButton />
            </div>

            <div class="container flex items-center w-[25vw] mx-auto mt-6">

                <div class="flex justify-center w-full">
                    <div class="rounded-xl w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit pb-2 rounded-lg border border-gray-900 ">


                            <div v-for="(item, idx) in Object.keys(barberData)" :key="idx">

                                <div class="ml-10 mr-10 p-2">

                                    <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">{{
                                        itemNames[idx]
                                    }}</label>
                                    <input id="steps-range" v-model="barberData[item]" type="range" min="-1"
                                        :max="maxIndexs[idx]" value="0"
                                        class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-purple-400/30 border border-black/40 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div
                class="container flex items-center w-[25vw] mx-auto mt-6 bg-black/70 p-4 shadow-2xl shadow-black border border-gray-900 select-none rounded-lg">

                <div class="w-full text-center font-medium">

                    <span class="pb-2">Rotation ({{ rotation }}°)</span>

                    <input id="steps-range" v-model="rotation" type="range" min="0" max="360" value="0"
                        class="w-full h-4 mt-3 rounded-lg appearance-none cursor-pointer bg-purple-400/30 border border-black/40 accent-gray-300 accent-shadow-lg accent-shadow-black">
                </div>

            </div>

            <div
                class="container flex items-center w-[25vw] mx-auto mt-6 bg-black/70 shadow-2xl shadow-black border border-gray-900 select-none rounded-lg">

                <button @click="purchaseHairStyle" :disabled="loadingState"
                    class="w-full border p-5 font-medium text-xl duration-300 hover:text-green-400 rounded-lg border-gray-900">
                    <span v-if="!loadingState">
                        Purchase <i class="fa-solid fa-cart-shopping"></i>
                    </span>

                    <LoadingSpinner v-if="loadingState" />
                </button>

            </div>
        </div>
    </main>
</template>

<script>
import { mapGetters } from 'vuex';
import CloseButton from '../ui/CloseButton.vue';
import { sendToServer } from '@/helpers';
import LoadingSpinner from '../ui/LoadingSpinner.vue';

export default {
    data() {
        return {
            barberData: null,
            rotation: 0,
            itemNames: [
                "Hair Style",
                "Hair Colour",
                "Hair Highlights",
                "Facial Hair Style",
                "Facial Hair Colour",
                "Chest Hair Style",
                "Eyebrows Style",
                "Eyebrows Colour"
            ],
            maxIndexs: [
                76,
                63,
                63,
                32,
                63,
                32,
                32,
                63
            ]
        }
    },
    created() {
        this.barberData = this.playerData.barber_data;
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
            loadingState: 'getLoadingState'
        })
    },
    watch: {
        barberData: {
            handler() {
                if (this.barberData == null) return;
                window.mp.trigger("c::barber:applyStyle", JSON.stringify(this.barberData));
            },
            deep: true,
        },
        rotation() {
            window.mp.trigger("clothes:setRot", this.rotation);
        }
    },
    components: {
        CloseButton,
        LoadingSpinner
    },
    methods: {
        purchaseHairStyle() {
            this.$store.state.uiStates.serverLoading = true;

            sendToServer("server:barbers:handlePurchase", JSON.stringify(this.barberData));
        }
    }
}

</script>