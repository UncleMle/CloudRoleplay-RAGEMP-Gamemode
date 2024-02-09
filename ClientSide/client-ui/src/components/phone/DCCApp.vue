<template>
    <main class="w-full h-[90%]">
        <div class="flex justify-center">
            <img src="https://i.imgur.com/RwsGPWK.png" width="150">

        </div>

        <div class="text-center text-xl">
            <span>Downtown Cab Co.</span>
            <br>
            <span class="text-xs">There are currently {x} drivers on shift.</span>
        </div>


    </main>
</template>

<script>
import { sendToServer } from '@/helpers';
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    created() {
        sendToServer("server:dcc:phone:initApp");
    }
}
</script>