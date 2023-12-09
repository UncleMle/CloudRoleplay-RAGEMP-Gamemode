<template>
    <div style="text-shadow: rgba(0, 0, 0, 0.563) 1px 0 10px;">
        <div class="absolute left-[1.6%] w-[14%] rounded-xl bottom-[19%] text-white font-medium h-[3.4%] p-1">
            <div class="ml-2">
                <span>
                    <i class="fa-solid fa-bottle-water text-xl text-blue-400"></i>
                    <font class="mr-2 ml-2 text-gray-200 text-md">{{ playerData.player_water.toFixed(0) }}%</font>
                </span>

                <span>
                    <i class="fa-solid fa-burger text-xl ml-3 text-orange-300"></i>
                    <font class="mr-2 ml-2 text-gray-200 text-md">{{ playerData.player_hunger.toFixed(0) }}%</font>
                </span>
            </div>
        </div>

        <div class="absolute left-[16.5%] w-[20%] rounded-xl bottom-[14%] text-white font-medium text-xl h-[3.4%] p-1">
            <div class="absolute" v-if="playerData.player_data_gui.isFrozen">
                <font>
                    <span class="font-bold text-3xl text-red-500">You have been frozen.</span>
                </font>
            </div>

            <div>
                <font>
                    <i class="fa-solid fa-compass text-4xl text-gray-400"></i>
                    <span class="text-4xl font-bold ml-2">{{ playerData.player_data_gui.direction }}</span>
                </font>
            </div>
            <div class="mt-4">
                <font>
                    <span>{{ playerData.player_data_gui.playerId }} | {{ playerData.player_data_gui.unix }} | FPS {{
                        playerData.player_data_gui.fps }}</span>
                </font>
            </div>
            <div>
                <font>
                    <span>{{ playerData.player_data_gui.zoneName }} {{ playerData.player_data_gui.zoneNameTwo ? "/ " +
                        playerData.player_data_gui.zoneNameTwo : "" }}</span>
                </font>
            </div>
            <div>
                <font>
                    <span>
                        <i v-if="playerData.player_data_gui.voiceMuted" class="fa-solid fa-microphone-slash text-red-400"></i>
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
            uiStates: 'getPlayerInfo'
        })
    }
}
</script>