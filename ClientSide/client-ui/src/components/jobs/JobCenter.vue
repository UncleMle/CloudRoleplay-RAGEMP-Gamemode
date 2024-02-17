<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black select-none">
                        <div class="relative w-full h-fit py-4 rounded-lg">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-briefcase text-gray-400"></i> Job Center ({{ playerData.job_center_jobs.length }} available jobs)</h1>
                            <CloseButton />

                            <div class="overflow-x-hidden overflow-y-scroll max-h-[30vw]">
                                <div v-for="(item, idx) in playerData.job_center_jobs" :key="idx"
                                    class="relative border mt-4 ml-2 mr-4 rounded-lg border-gray-500">

                                    <div class="p-4 h-56">
                                        <div class="absolute left-8">
                                            <div class="font-medium text-3xl">
                                                {{ item.jobName }}
                                            </div>
                                            <div class="mt-2 font-medium">
                                                Average Pay <font class="text-green-400">${{
                                                    item.averagePay.toLocaleString("en-US") }}</font>
                                            </div>
                                        </div>


                                        <div class="absolute left-8 top-24 text-md text-gray-400">
                                            <span class="font-medium max-h-sm">
                                                {{ item.jobDescription }}
                                            </span>
                                        </div>
                                    </div>

                                    <div class="absolute w-full bottom-0">
                                        <div class="flex justify-center">
                                            <button @click="markOnMap(item.jobName)"
                                                class="w-full w-[40%] p-1.5 bg-black/40 rounded-lg border-gray-500 duration-300 hover:text-yellow-400 hover:border-yellow-400">
                                                <i class="fa-solid fa-solid fa-location-dot"></i>
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
import { mapGetters } from 'vuex';
import CloseButton from '../ui/CloseButton.vue';
import { sendToServer } from '@/helpers';

export default {
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    created() {
        if (this.playerData.job_center_jobs) return;

        this.playerData.job_center_jobs.sort((a, b) => b.averagePay - a.averagePay);
    },
    components: { CloseButton },
    methods: {
        markOnMap(jobName) {
            sendToServer("server:jobCenter:showJobOnMap", jobName);
        }
    }
}
</script>