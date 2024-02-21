<template>
    <main class="w-full h-[90%]">
        <div class="flex justify-center">
            <img src="https://i.imgur.com/RwsGPWK.png" width="150">

        </div>

        <div class="text-center text-xl">
            <span>Downtown Cab Co.</span>
            <br>
            <span class="text-xs">There is currently {{ playerData.dcc_data.onDutyMembers }} {{
                playerData.dcc_data.onDutyMembers == 1 ? "driver" : "drivers" }} on shift.</span>
        </div>

        <div class="flex justify-center h-14 mt-4 border ml-2 mr-2 p-2 rounded-lg border-gray-400/40"
            v-for="(item, idx) in playerData.dcc_data.services" :key="idx">

            <div class="relative w-full">

                <span class="absolute top-0">{{ item }}</span>
            </div>

            <button @click="requestService(item)"
                class="border-b pr-2 pl-2 text-sm border-green-400 duration-300 hover:text-green-400 hover:border-green-600 hover:bg-green-400/20">
                Request
            </button>

        </div>

    </main>
</template>

<script>
import { sendToServer } from '@/helpers';
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            rentals: null
        }
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    created() {
        sendToServer("server:dcc:phone:initApp");
    },
    methods: {
        requestService(name) {
            sendToServer("server:dcc:requestService", name);
        },
        getDataaa() {
        }
    }
}
</script>