<template>
    <div v-if="uiStates.speedoUi" class="mt-[28vw] ml-[80vw] text-white font-medium ">
        <div class="w-full flex justify-center text-4xl">
            <h2 style="text-shadow: rgb(0, 0, 0) 3px 0 16px;">
                <i>{{ uiStates.vehicleSpeedoData.vehicleSpeed }}</i> <span class="text-gray-400 text-xl">KM/H</span>
            </h2>
        </div>

        <div class="w-full flex justify-center bg-black/50 mt-2 rounded-xl h-2">
            <div :class="rpmColour" class="flex justify-start duration-300" :style="{'width': uiStates.vehicleSpeedoData.vehicleRpm * 100 + '%'}">

            </div>
        </div>

        <div class="flex w-[12vw] h-[3vw] mt-2 rounded-xl bg-black/50 items-center shadow-black/30 shadow-xl">
            <p class="text-center w-full font-semibold text-2xl">
                <i class="fa-solid fa-gears text-gray-400"></i>
                100<span>%</span></p>
        </div>
        <div class="flex w-[12vw] h-[3vw] mt-4 rounded-xl bg-black/50 items-center shadow-black/30 shadow-xl">
            <p class="text-center w-full font-semibold text-2xl">
                <i class="fa-solid fa-gas-pump text-red-400"></i>
                100<span>%</span></p>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    computed: {
        ...mapGetters({
            uiStates: 'getUiStates'
        }),
        rpmColour() {
            let vehSpeed = this.uiStates.vehicleSpeedoData.vehicleSpeed;
            if(vehSpeed > 85) {
                return "bg-red-600";
            }
            if(vehSpeed > 70) {
                return "bg-red-500";
            }
            if(vehSpeed > 60) {
                return "bg-red-300";
            }
            if(vehSpeed > 30) {
                return "bg-orange-300";
            }
            return "bg-green-400"
        }
    }
}
</script>