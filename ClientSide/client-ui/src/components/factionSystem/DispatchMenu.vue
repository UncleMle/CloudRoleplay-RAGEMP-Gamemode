<template>
    <main class="relative">
        <div class="absolute right-[3%] ">
            <div class="container flex items-center w-[18vw] mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg ">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-list text-gray-400"></i> Dispatch Menu</h1>
                            <CloseButton />


                            <div class="p-6">

                                <div v-if="playerData.faction_dispatch_calls.length == 0">
                                    There are no calls to dispatch right now.
                                </div>

                                <div v-for="(item, idx) in playerData.faction_dispatch_calls" :key="idx">
                                    {{ item.Value.callDesc }}

                                    <div>

                                        <button class="bg-red-400" @click="handleDispatchCall(item.Key, true)">
                                            end
                                        </button>

                                    </div>

                                    <div>

                                        <button class="bg-green-400" @click="handleDispatchCall(item.Key, false)">
                                            start
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
import { sendToServer } from '@/helpers';
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
            uiStates: 'getUiStates'
        })
    },
    methods: {
        handleDispatchCall(key, endCall) {

            let event = endCall ? "server:factionSystem:dispatch:endCall" : "server:factionSystem:dispatch:answerCall";

            sendToServer(event, key);
        }
    }
}
</script>