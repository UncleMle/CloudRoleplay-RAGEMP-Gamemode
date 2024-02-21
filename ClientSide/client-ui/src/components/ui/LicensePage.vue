<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container max-w-xl mx-auto mt-[10%]">
                <div class="flex justify-center w-full">
                    <div
                        class="colourBackground rounded-xl text-white w-full bg-black/70 border-t-4 border-b-4 border-purple-400/50 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg">
                            <h1 class="font-bold text-2xl pb-2 pl-4"><i
                                    class="fa-solid fa-id-card text-gray-300"></i> {{ licenses.character_name }}'s Licenses
                            </h1>

                            <CloseButton />

                            <div class="border-b-4 border-gray-400/50 ml-4 mr-4">

                            </div>

                            <div class="flex justify-center mt-4 font-medium text-xl"
                                v-if="!licenses.character_license_data">
                                <font class="text-gray-300">{{ licenses.character_name }} has no licenses.</font>
                            </div>


                            <div v-else>
                                <div class="relative border-2 mr-10 ml-10 mt-5 h-20 border-purple-400/50 rounded-lg font-medium"
                                    v-for="(item, idx) in JSON.parse(licenses.character_license_data)" :key="idx">

                                    <font class="absolute left-4 top-3">{{ licenseData[item.license] }}</font>
                                    <font class="absolute right-4 top-3 text-gray-300">Recieved at {{ new Date(item.givenAt
                                        * 1000).toLocaleDateString() }}</font>
                                    <font v-if="item.valid" class="absolute text-green-400 left-4 top-11">Valid</font>
                                    <font v-else class="absolute text-red-400 left-4 top-11">Suspended</font>
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
import CloseButton from './CloseButton.vue';
import { licenses } from '@/helpers';

export default {
    data() {
        return {
            licenseData: licenses
        }
    },
    computed: {
        ...mapGetters({
            licenses: "getPlayerStats"
        })
    },
    components: {
        CloseButton
    }
}
</script>