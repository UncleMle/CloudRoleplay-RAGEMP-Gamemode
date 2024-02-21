<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div class="colourBackground rounded-xl text-white w-full colourBackground border-t-4 border-b-4 border-purple-400/50 shadow-2xl shadow-black select-none">
                        <div class="relative w-full h-fit py-4 rounded-lg">
                            <h1 class="font-bold text-2xl pb-2 pl-4"><i
                                    class="fa-solid fa-money-bill text-gray-300"></i> Available Gruppe Six Jobs</h1>
                            <CloseButton />

                            <div class="border-b-4 ml-4 mr-4 border-gray-400/50">

                            </div>

                            <div class="overflow-x-hidden overflow-y-scroll max-h-[30vw]">
                                <div v-for="(item, idx) in playerData.gruppe_six_jobs" :key="idx"
                                    class="relative border mt-4 ml-2 mr-4 rounded-lg border-gray-400/40">


                                    <div class="p-4 h-48">
                                        <div class="absolute left-8">
                                            <div class="font-medium text-3xl">
                                                {{ item.name }}
                                            </div>
                                            <div
                                                class="font-medium text-lg max-w-[4vw] w-[4vw] overflow-hidden text-ellipsis text-green-400 bg-black/20 p-2 mt-2 w-[40%] rounded-xl">
                                                ${{ item.jobPay.toLocaleString("en-US") }}
                                                <br>
                                            </div>
                                        </div>


                                        <div class="absolute left-8 top-28 text-md text-gray-400">
                                            <span class="font-medium max-h-sm">
                                                {{ item.description }}
                                            </span>
                                        </div>

                                        <div class="absolute left-[42%] top-14 text-md text-gray-400">
                                            <span class="font-medium text-xl">
                                                Total Stops {{ item.deliveryStops.length }}
                                            </span>
                                        </div>
                                    </div>

                                    <div class="absolute w-full bottom-0">
                                        <div class="flex justify-center">
                                            <button @click="startGruppeSixJob(item.jobId)"
                                                class="w-full w-[40%] p-1.5 bg-black/40 rounded-lg border-gray-400/40 duration-300 hover:text-green-400 hover:border-green-400">
                                                <i class="fa-solid fa-play"></i>
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
    </main>
</template>

<script>
import CloseButton from '../../ui/CloseButton.vue'
import { sendToServer } from '../../../helpers';
import { mapGetters } from 'vuex';

export default {
    components: {
        CloseButton
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    methods: {
        startGruppeSixJob(jobId) {
            sendToServer("server:jobs:gruppeSixStart", jobId);
        }
    }
}
</script>