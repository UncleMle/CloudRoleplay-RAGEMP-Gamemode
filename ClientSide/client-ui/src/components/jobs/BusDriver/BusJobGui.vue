<template>
    <div v-if="uiStates.busDriverUi" class="absolute left-[1%] bottom-[28.5%]">
        <div class="rounded-xl w-[20rem] bg-black/40">
            <div class="text-xl border-b-2 border-gray-500 p-2">
                <i class="fa-solid fa-satellite-dish text-gray-400"></i> Bus Driver
            </div>

            <div class="p-3">
                <div>
                    <h1>Speed</h1>
                    <div class="mt-2 text-center p-2 bg-black/50 rounded-lg">
                        <font>
                        </font>
                    </div>
                </div>
                <div class="mt-2">
                    <h1>Number plate</h1>
                    <div class="mt-2 text-center p-2 bg-black/50 rounded-lg">
                        <font>
                        </font>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
export default {
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
            uiStates: 'getUiStates'
        })
    }
}
</script>