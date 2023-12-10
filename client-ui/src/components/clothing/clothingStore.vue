<template>
    <main class="relative">
        <div class="absolute right-[3%] ">
            <div class="container flex items-center max-w-xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg border border-gray-900 ">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-shirt text-gray-400"></i> Clothing Store</h1>
                            <CloseButton />
                            Clothing stores
                            {{ clothingData }}
                            <div class="p-6" v-if="clothingData">
                                <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Top</label>
                                <input id="steps-range" v-model="clothingData.top" type="range" min="-1" max="12"
                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">
                                <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Ageing</label>
                                <input id="steps-range" type="range" min="-1" max="14"
                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                <label for="steps-range"
                                    class="block mb-2 text-sm font-medium  text-white">Complexion</label>
                                <input id="steps-range" type="range" min="-1" max="11"
                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                <label for="steps-range"
                                    class="block mb-2 text-sm font-medium  text-white">Sundamage</label>
                                <input id="steps-range" type="range" min="-1" max="16"
                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Moles /
                                    Freckles</label>
                                <input id="steps-range" type="range" min="-1" max="18"
                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">

                                <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Makeup</label>
                                <input id="steps-range" type="range" min="-1" max="100"
                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">


                                <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Blush
                                    Style</label>
                                <input id="steps-range" type="range" min="-1" max="100"
                                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">
                            </div>
                            <div v-else>
                                <LoadingSpinner />
                            </div>

                        </div>
                    </div>
                </div>
            </div>

            <div class="text-center mt-5 text-white font-medium">
                <button @click="buyClothes" class="bg-black/60 w-full p-3 rounded-xl duration-300 hover:text-green-400"><i class="fa-solid fa-cart-shopping"></i> Purchase clothing</button>
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
            clothingData: null
        }
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
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
    },
    methods: {
        buyClothes() {
            if(window.mp) {
                window.mp.trigger("browser:sendObject", "server:handleClothesPurchase", JSON.stringify(this.clothingData));
            }
        }
    },
    created() {
        if (!this.playerData.clothing_data) return;

        if (window.mp) {
            window.mp.trigger("clothes:setClothingData", this.playerData.clothing_data, true);
        }

        this.clothingData = this.playerData.clothing_data;
        console.log(JSON.stringify(this.playerData.clothing_data));
    }
}
</script>