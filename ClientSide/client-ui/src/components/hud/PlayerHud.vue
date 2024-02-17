<template>
    <div v-if="uiStates.guiEnabled && playerData.player_data_gui.direction" style="text-shadow: rgba(0, 0, 0, 0.563) 1px 0 10px;">
        <div class="absolute bottom-[25%] left-[2%]" v-if="playerData.player_data_gui.isFrozen">
            <font>
                <span class="font-bold text-3xl text-red-500">You have been frozen.</span>
            </font>
        </div>

        <div
            class="textResponsive absolute left-[1.6%] w-[14%] rounded-xl bottom-[19%] text-white font-medium h-[3.4%] p-1">
            <div class="ml-2">
                <span>
                    <i class="fa-solid fa-bottle-water text-xl text-blue-400"></i>
                    <font class="mr-2 ml-2 text-gray-200 text-md">{{ playerData.player_water.toFixed(0) }}%</font>
                </span>

                <span>
                    <i class="fa-solid fa-burger text-xl ml-3 text-orange-300"></i>
                    <font class="mr-2 ml-2 text-gray-200 text-md">{{ playerData.player_hunger.toFixed(0) }}%</font>
                </span>

                <span>
                    <i class="fa-solid fa-clock text-xl ml-3"></i>
                    <font class="mr-2 ml-2 text-md">{{ Math.floor(Date.now() / 1000) }}</font>
                </span>
            </div>
        </div>

        <div class="guiMain absolute left-[16.5%] w-[25%] bottom-[16%] rounded-xl text-white font-medium h-[3.4%] p-1">

            <div>
                <font>
                    <i class="fa-solid fa-compass text-4xl text-gray-400"></i>
                    <span class="text-4xl font-bold ml-2">{{ playerData.player_data_gui.direction }}</span>
                </font>
            </div>

            <div class="mt-4 rounded-xl">
                <i
                    class="bg-black/40 min-w-[1.5vw] text-center shadow-black shadow-2l border border-gray-700 p-2 fa-solid fa-user rounded-xl">
                </i>
                {{ playerData.player_data_gui.playerId }}
            </div>

            <div class="mt-2 rounded-xl w-full w-full">
                <i
                    class="bg-black/40 min-w-[1.5vw] text-center shadow-black shadow-2l border border-gray-700 p-2 fa-solid fa-location-dot rounded-xl">
                </i>
                {{ playerData.player_data_gui.zoneName }}

                <span v-if="playerData.player_data_gui.zoneNameTwo" class="text-yellow-400 text-lg">
                    - {{ playerData.player_data_gui.zoneNameTwo }}
                </span>
            </div>

            <div class="mt-2 rounded-xl">
                <i
                    class="bg-black/40 min-w-[1.5vw] text-center shadow-black shadow-2l border border-gray-700 p-2 fa-solid fa-computer rounded-xl">
                </i>
                {{ playerData.player_data_gui.fps }} FPS
            </div>


            <div class="mt-2">
                <font>
                    <span>
                        <i v-if="playerData.player_data_gui.voiceMuted"
                            class="fa-solid fa-microphone-slash text-red-400"></i>
                        <i v-if="!playerData.player_data_gui.voiceMuted" class="fa-solid fa-microphone text-green-400"></i>
                        <i class="fa-solid fa-walkie-talkie text-red-400 ml-2"></i>
                    </span>
                </font>
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

<style>
/* Instead of having to declare a custom media query with tailwind D; */
@media only screen and (max-width: 2000px) {
    .guiMain {
        font-size: 15px;
    }

    .textResponsive {
        font-size: 12px;
    }
}
</style>