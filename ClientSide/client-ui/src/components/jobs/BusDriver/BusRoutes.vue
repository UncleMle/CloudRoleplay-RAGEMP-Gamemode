<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg border border-gray-900">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-bus text-gray-400"></i> Available Routes</h1>
                            <CloseButton />

                            <div class="max-h-[20vw] overflow-y-scroll">
                                <div v-for="(item, idx) in playerData.player_bus_job_routes" :key="idx" class="p-3">
                                    <div class="relative border border-gray-500 p-4 rounded-lg font-medium">
                                        <font class="absolute right-20">
                                            Total Stops
                                            {{ item.stops.length }}
                                        </font>

                                        <font class="flex left-10 text-3xl">
                                            {{ item.routeName }}
                                        </font>

                                        <font class="flex">
                                            Total Pay <font class="text-green-400 ml-2">${{
                                                item.routePay.toLocaleString('en-US') }}</font>
                                        </font>

                                        <div v-for="(item, idx) in item.stops" :key="idx">
                                            <div class="relative h-10">
                                                <div class="absolute bg-gray-300 w-6 h-0.5 mt-6">
                                                </div>
                                                <font class="absolute float-right ml-9 mt-3">
                                                    {{ item.stopName }}
                                                </font>
                                            </div>
                                        </div>

                                        <button @click="startBusRoute(item.character_name)"
                                            class="border p-2 w-full mt-10 rounded-lg border-gray-500 duration-300 hover:text-green-400 hover:border-green-400">
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
    </main>
</template>

<script>
import CloseButton from '../../../components/ui/CloseButton.vue';
import { mapGetters } from "vuex";
import { sendToServer } from '../../../helpers';

export default {
    components: {
        CloseButton
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        }),
    },
    methods: {
        startBusRoute(idx) {
            sendToServer("server:startBusJobRoute", idx);
        }
    }
}
</script>