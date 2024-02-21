<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div class="colourBackground rounded-xl text-white w-full bg-black/70 border-t-4 border-b-4 border-purple-400/50 shadow-2xl shadow-black select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg">
                            <h1 class="font-bold text-2xl pb-2 pl-4"><i
                                    class="fa-solid fa-truck text-gray-300"></i> Available Trucker Jobs</h1>
                            <CloseButton />

                            <div class="border-2 ml-4 mr-4 border-gray-400/50">

                            </div>

                            <div class="overflow-x-hidden overflow-y-scroll max-h-[30vw]">
                                <div v-for="(item, idx) in playerData.trucker_jobs" :key="idx"
                                    class="relative border mt-4 ml-2 mr-4 rounded-lg border-gray-500">

                                    <div class="p-4 h-48">
                                        <img :src="getTruckerImagePath(item.image)" class="absolute w-32 h-32 mb-4 ml-4" />

                                        <div class="absolute left-48">
                                            <div class="font-medium text-3xl">
                                                {{ item.jobName }}
                                            </div>
                                            <div
                                                class="font-medium text-lg max-w-[4vw] w-[4vw] overflow-hidden text-ellipsis text-green-400 bg-black/20 p-2 mt-2 w-[40%] rounded-xl">
                                                ${{ item.jobPay.toLocaleString("en-US") }}
                                                <br>
                                                <font class="text-white text-sm">$22 per KM</font>
                                            </div>
                                        </div>


                                        <div class="absolute left-[42%] top-24 text-md text-gray-400">
                                            <span class="font-medium">
                                                Eta {{ item.estimatedTime }} minutes
                                            </span>
                                        </div>

                                        <div class="absolute left-[42%] top-14 text-md text-gray-400">
                                            <span class="font-medium text-xl">
                                                {{ item.destinationName }}
                                            </span>
                                        </div>
                                    </div>


                                    <div class="absolute w-full bottom-0">
                                        <div class="flex justify-center">
                                            <button @click="startTruckJob(item.jobId)"
                                                class="w-full w-[40%] p-1.5 bg-black/40 rounded-lg border-gray-500 duration-300 hover:text-green-400 hover:border-green-400">
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
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    methods: {
        getTruckerImagePath(jobImage) {
            try {
                const imageModule = require(`../../../assets/img/jobs/trucker/${jobImage}.png`);
                return imageModule;
            } catch (error) {
                return require("../../../assets/img/cars/sentinel.png");
            }
        },
        startTruckJob(jobId) {
            sendToServer("server:handleTruckerJobRequest", jobId);
        }
    },
    components: {
        CloseButton
    }
}
</script>