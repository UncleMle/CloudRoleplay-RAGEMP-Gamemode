<template>
    <main class="absolute w-full top-[10%]">
        <div class="flex justify-center">
            <div class="container flex items-center max-w-[25vw] mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none font-medium">

                        <div class="relative w-full py-4 rounded-lg ">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    :class="playerData.player_prompt_data.icon + ' text-gray-400'"></i> {{
                                        playerData.player_prompt_data.title }}
                            </h1>

                            <div class="p-2 text-center mt-3 text-xl overflow-auto">

                                {{ playerData.player_prompt_data.message }}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div class="mt-2 flex justify-center p-3 text-white font-medium text-center">

            <div>
                <button @click="close"
                    class="border-2 border-red-400/60 bg-black/70 shadow-black shadow-2xl p-3 w-40 mr-28 rounded-lg duration-300 hover:border-red-400">
                    Close</button>
            </div>

            <div>
                <button @click="sendToServer(playerData.player_prompt_data.callBackEvent)"
                    class="border-2 border-green-400/60 bg-black/70 shadow-black shadow-2xl p-3 w-40 rounded-lg duration-300 hover:border-green-400">
                    Accept</button>
            </div>

        </div>
    </main>
</template>

<script>
import { mapGetters } from 'vuex';
import { sendToServer } from '@/helpers';

export default {
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    methods: {
        sendToServer,
        close() {
            window.mp.trigger("browser:resetRouter");
        }
    }
}
</script>