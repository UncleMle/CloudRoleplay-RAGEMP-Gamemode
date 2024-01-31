<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-list text-gray-400"></i> DMV Courses</h1>
                            <CloseButton />

                            <div class="overflow-x-hidden overflow-y-scroll max-h-[30vw]">
                                <div v-for="(item, idx) in playerData.dmv_courses" :key="idx"
                                    class="relative border mt-4 ml-2 mr-4 rounded-lg border-gray-500">

                                    <div class="p-4 h-48">
                                        <div class="absolute left-8">
                                            <div class="font-medium text-3xl">
                                                {{ licenses[item.license] }} License
                                            </div>

                                            <div
                                                class="font-medium text-lg max-w-[4vw] w-[4vw] overflow-hidden text-ellipsis text-green-400 bg-black/20 p-2 mt-2 w-[40%] rounded-xl">
                                                ${{ item.coursePrice.toLocaleString("en-US") }}
                                                <br>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="absolute w-full bottom-0">
                                        <div class="flex justify-center">
                                            <button @click="startCourse(item.courseId)"
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
import { mapGetters } from 'vuex';
import { sendToServer } from '@/helpers';
import CloseButton from '../ui/CloseButton.vue';
import { licenses } from '@/helpers';

export default {
    data() {
        return {
            licenses: licenses
        }
    },
    components: {
        CloseButton
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
        })
    },
    methods: {
        startCourse(id) {
            sendToServer("server:dmv:selectDmvCourse", id);
        }
    }
}
</script>