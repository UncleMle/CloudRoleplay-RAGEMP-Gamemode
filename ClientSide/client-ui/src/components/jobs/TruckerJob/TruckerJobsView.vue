<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-truck text-gray-400"></i> Available Jobs</h1>
                            <CloseButton />

                            <div class="overflow-x-hidden overflow-y-scroll max-h-[40vw]">
                                <div v-for="(item, idx) in truckerJobs" :key="idx"
                                    class="p-4 border mt-4 ml-2 mr-4 rounded-lg border-gray-500">
                                    <img :src="getTruckerImagePath(item.img)" class="w-40 h-40" />
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

export default {
    data() {
        return {
            truckerJobs: [
                {
                    name: "Test",
                    img: "fleet"
                },
                {
                    name: "Test",
                    img: "gravel"
                },
                {
                    name: "Test",
                    img: "gravel"
                },
                {
                    name: "Test",
                    img: "gravel"
                }
            ]
        }
    },
    methods: {
        getTruckerImagePath(jobImage) {
            try {
                const imageModule = require(`../../../assets/img/jobs/trucker/${jobImage}.png`);
                return imageModule;
            } catch (error) {
                return require("../../../assets/img/cars/sentinel.png");
            }
        }
    },
    components: {
        CloseButton
    }
}
</script>