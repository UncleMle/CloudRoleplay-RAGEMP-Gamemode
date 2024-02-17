<template>
    <main v-if="getRoute === '/'" class="relative">
        <div class="absolute right-[3%] ">
            <div class="container flex items-center w-[22vw] mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg ">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-list text-gray-400"></i> Dispatch Menu</h1>
                            <CloseButton />

                            <div class="p-2">

                                <div v-if="playerData.faction_dispatch_calls.length == 0">
                                    There are no calls to dispatch right now.
                                </div>

                                <div v-for="(item, idx) in playerData.faction_dispatch_calls" :key="idx">

                                    <div class="border-b-2 border-t-2 pb-2 border-gray-500 p-4 font-medium">

                                        {{ item.Value.characterName }} {{ item.Value.callDesc }}.


                                        <div>
                                            <font class="text-gray-400">{{ formatTime(item.Value.createdAt) }}</font>
                                            <font class="text-orange-200"> #{{ item.Key }}</font>
                                            <font> Total Units {{ item.Value.units.length }}</font>
                                        </div>

                                        <div class="mt-4">
                                            <button class="bg-red-400/30 w-[50%]"
                                                @click="handleDispatchCall(item.Key, true)">
                                                Close
                                            </button>
                                            <button class="bg-green-400/30 w-[50%]"
                                                @click="handleDispatchCall(item.Key, false)">
                                                Accept
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
import { sendToServer } from '@/helpers';
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
            uiStates: 'getUiStates'
        }),
        getRoute() {
            return this.$router.currentRoute.path;
        }
    },
    methods: {
        handleDispatchCall(key, endCall) {

            let event = endCall ? "server:factionSystem:dispatch:endCall" : "server:factionSystem:dispatch:answerCall";

            sendToServer(event, key);
        },
        formatTime(unix) {
            let time = new Date(unix * 1000);

            let hours = time.getHours();
            let minutes = time.getMinutes();

            return `${hours < 10 ? "0" + hours : hours}:${minutes < 10 ? "0" + minutes : minutes}`;
        }
    }
}
</script>