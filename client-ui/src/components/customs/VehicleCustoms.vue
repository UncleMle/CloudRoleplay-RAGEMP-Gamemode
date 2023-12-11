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

                            <div class="relative w-full h-fit py-4 rounded-lg border border-gray-900 text-center max-h-[37vw] overflow-scroll overflow-x-hidden">

                                <div>
                                    {{ playerData }}

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

                            <div class="relative w-full h-fit py-4 rounded-lg border border-gray-900 text-center">

                                <div class="mt-3 text-gray-300">
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
            basketItems: []
        }
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    components: {
        CloseButton
    },
    mounted() {
        if(window.mp) {
            window.mp.trigger("gui:toggleHudComplete", false);
        }
    }
}
</script>