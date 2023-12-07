<template>
    <div v-if="uiStates.speedoUi">
        <div class="absolute right-28 bottom-20 text-white font-medium">
            <div class="bg-black/60 rounded-3xl shadow-2xl shadow-black/50 w-[20rem]">
                <div class="p-4">
                    <div class="w-full flex justify-center text-4xl p-3">
                        <h2 style="text-shadow: rgb(0, 0, 0) 3px 0 16px;">
                            <i>{{ uiStates.vehicleSpeedoData.vehicleSpeed }}</i> <span
                                class="text-gray-400 text-xl">KM/H</span>
                        </h2>
                    </div>

                    <div v-if="uiStates.vehicleSpeedoData.vehicleRpm != 0 && uiStates.vehicleSpeedoData.fuelLevel > 0" class="w-full flex justify-center bg-black/50 mt-2 rounded-xl h-2">
                        <div :class="rpmColour" class="flex justify-start duration-300"
                            :style="{ 'width': uiStates.vehicleSpeedoData.vehicleRpm * 100 + '%' }">
                        </div>
                    </div>

                    <div class="h-10">
                        <div :class="uiStates.vehicleSpeedoData.indicatorStatus == 0 ? 'animate-ping text-orange-400' : ''"
                            class="absolute right-4">
                            <i class="fa-solid fa-caret-right text-4xl"></i>
                        </div>

                        <div :class="uiStates.vehicleSpeedoData.lockStatus ? 'text-red-400' : ''"
                            class="absolute left-12 mt-1">
                            <i class="fa-solid fa-lock text-2xl"></i>
                        </div>

                        <div :class="uiStates.vehicleSpeedoData.lightsStates.lightsOn || uiStates.vehicleSpeedoData.lightsStates.highbeamsOn ? 'text-green-300' : ''"
                            class="absolute right-12 mt-1">
                            <i class="fa-solid fa-lightbulb text-2xl"></i>
                        </div>

                        <div :class="uiStates.vehicleSpeedoData.indicatorStatus == 1 ? 'animate-ping text-orange-400' : ''"
                            class="absolute left-5">
                            <i class="fa-solid fa-caret-left text-4xl"></i>
                        </div>
                    </div>
                </div>


                <div class="flex justify-center h-[3vw] mt-2 items-center border-t-2 border-gray-400" id="digitext">
                    <div id="digitext" v-for="num in mileage" :key="mileage.indexOf(num)">
                        <font class="border p-2 bg-black/70 border-gray-500">{{ num }}</font>
                    </div>
                </div>
            </div>

        </div>

        <div class="bg-black/60 absolute right-28 w-[20rem] bottom-[22rem] text-white font-medium h-26 rounded-xl">
            <div class="w-full text-center items-center h-full relative p-3">
                <div :class="uiStates.vehicleSpeedoData.fuelLevel.toFixed(0) < 20 ? uiStates.vehicleSpeedoData.fuelLevel.toFixed(0) < 10 ? 'bg-red-400' : 'bg-orange-400' : 'bg-green-500'" class="rounded-lg h-2" :style="{'width': uiStates.vehicleSpeedoData.fuelLevel.toFixed(0) + '%'}">
                </div>
                <i class="fa-solid fa-gas-pump mt-3 "></i> {{uiStates.vehicleSpeedoData.fuelLevel.toFixed(0)}}%

                <div class="bg-gray-300 rounded-lg h-2 mt-2">
                </div>
                <i class="fa-solid fa-gears text-gray-400 mt-3 "></i> 100%
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            styleOne: "text-pink-500",
            mileage: [0, 0, 0, 0, 0, 4]
        }
    },
    computed: {
        ...mapGetters({
            uiStates: 'getUiStates'
        }),
        rpmColour() {
            let vehSpeed = this.uiStates.vehicleSpeedoData.vehicleSpeed;
            if (vehSpeed > 85) {
                return "bg-red-600";
            }
            if (vehSpeed > 70) {
                return "bg-red-500";
            }
            if (vehSpeed > 60) {
                return "bg-red-300";
            }
            if (vehSpeed > 30) {
                return "bg-orange-300";
            }
            return "bg-green-400"
        },
    }
}
</script>

<style>
@font-face {
    font-family: "DS-DIGI";
    src: url('../../assets/fonts/DS-DIGI.TTF');
}

#digitext {
    font-family: "DS-DIGI";
}
</style>