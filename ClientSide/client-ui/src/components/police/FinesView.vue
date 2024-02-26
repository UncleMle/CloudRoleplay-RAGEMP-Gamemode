<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="colourBackground rounded-xl text-white w-full colourBackground border-t-4 border-b-4 border-purple-400/50 shadow-2xl shadow-black select-none">
                        <div class="relative w-full h-fit py-4 rounded-lg">
                            <h1 class="font-bold text-2xl pb-2 pl-4"><i class="fa-solid fa-list text-gray-300"></i>
                                Current Fines</h1>
                            <CloseButton />

                            <div class="border-b-4 mr-4 ml-4 border-gray-400/50">

                            </div>

                            <div class="overflow-x-hidden overflow-y-scroll max-h-[30vw]">
                                <div v-for="(item, idx) in playerData.criminal_charges" :key="idx"
                                    class="relative border mt-4 ml-2 mr-4 rounded-lg border-gray-400/40">

                                    <div class="p-4 min-h-28">
                                        <div class="left-8">
                                            <div class="font-medium text-md">
                                                <span v-for="(item, idx) in item.charges" :key="idx">{{ idx }} | {{
                                                    item.chargeCode }} -
                                                    {{ item.chargeName
                                                    }} | {{ item.chargeDescription }}<br /></span>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="absolute  w-full bottom-0">
                                        <div class="flex justify-center">
                                            <button @click="payFine(item.chargeId)"
                                                class="font-medium w-full w-[40%] p-1.5 bg-black/40 rounded-lg border-gray-400/40 duration-300 hover:text-green-400 hover:border-green-400">
                                                Pay Fine <font class="text-green-400">(${{
                                                    item.totalFine.toLocaleString("en-US") }})</font>
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
    components: { CloseButton },
    methods: {
        payFine(id) {
            sendToServer("server:policeSystems:handleFinePay", id);
        }
    }
}
</script>