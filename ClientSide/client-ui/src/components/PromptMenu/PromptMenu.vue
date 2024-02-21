<template>
    <main class="absolute w-full top-[10%]">
        <div class="flex justify-center">
            <div class="container flex items-center max-w-[25vw] mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full colourBackground shadow-2xl border-t-4 border-b-4 shadow-black border-purple-500/50 select-none font-medium">

                        <div class="relative w-full py-4 rounded-lg ">
                            <h1 class="font-bold text-2xl pb-2 pl-4"><i
                                    :class="playerData.player_prompt_data.icon + ' text-gray-400'"></i> {{
                                        playerData.player_prompt_data.title }}
                            </h1>

                            <div class="border-2 ml-4 mr-4 border-gray-400/50"> 

                            </div>

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
                    class="border-b-4 border-red-400/60 colourBackground shadow-black shadow-2xl p-3 w-40 mr-28 rounded-lg duration-300 hover:border-red-400 hover:scale-105">
                    Close</button>
            </div>

            <div>
                <button @click="server(playerData.player_prompt_data.callBackEvent)"
                    class="border-b-4 border-green-400/60 colourBackground shadow-black shadow-2xl p-3 w-40 rounded-lg duration-300 hover:border-green-400 hover:scale-105">
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
            playerData: 'getPlayerInfo',
        })
    },
    methods: {
        close() {
            this.$store.state.uiStates.serverLoading = false;

            if (this.playerData.player_prompt_data.callBackRoute) {
                window.mp.trigger("browser:pushRouter", this.playerData.player_prompt_data.callBackRoute);
                return;
            }

            window.mp.trigger("browser:resetRouter");
        },
        server(callBack) {
            if (!this.playerData.player_prompt_data.callBackRoute) this.close();

            if (typeof this.playerData.player_prompt_data.callBackObject === "object") {
                this.playerData.player_prompt_data.callBackObject = JSON.stringify(this.playerData.player_prompt_data.callBackObject);
            }

            sendToServer(callBack, this.playerData.player_prompt_data.callBackObject);
        }
    }
}
</script>