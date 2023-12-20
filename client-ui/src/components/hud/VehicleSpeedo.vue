<template>
    <div v-if="uiStates.speedoUi" class="text-white font-medium">
        <div v-if="uiStates.vehicleRadar" class="absolute left-[1%] bottom-[32.5%]">
            <div class="rounded-xl w-[18rem] bg-black/40">
                <div class="text-xl border-b-2 border-gray-500 p-2">
                    <i class="fa-solid fa-satellite-dish text-gray-400"></i> Police Radar <font class="text-sm text-gray-400">{{Object.entries(uiStates.vehicleRadarData).length > 0 && uiStates.vehRadarLastTracked ? "- Last locked on" :"" }}</font>
                </div>

                <div class="p-3">
                    <div>
                        <h1>Speed</h1>
                        <div class="mt-2 text-center p-2 bg-black/50 rounded-lg">
                            <font>
                                {{ uiStates.vehicleRadarData.speed != null ? (uiStates.vehicleRadarData.speed * 3.6).toFixed(0) : "..." }} {{ uiStates.vehicleRadarData.speed != null ? 'KM/H' : '' }}
                            </font>
                        </div>
                    </div>
                    <div class="mt-2">
                        <h1>Number plate</h1>
                        <div class="mt-2 text-center p-2 bg-black/50 rounded-lg">
                            <font>
                                {{ uiStates.vehicleRadarData.numberplate ? uiStates.vehicleRadarData.numberplate : '...' }}
                            </font>
                        </div>
                    </div>
                    <div v-if="uiStates.vehicleRadarData.vehicleName && uiStates.vehicleRadarData.vehicleName != 'NULL'" class="mt-2">
                        <h1>Vehicle Name</h1>
                        <div class="mt-2 text-center p-2 bg-black/50 rounded-lg">
                            <font>
                                {{ uiStates.vehicleRadarData.vehicleName }}
                            </font>
                        </div>
                    </div>
                </div>

            </div>
        </div>

        <div class="absolute right-[3%] bottom-[13.5%]">
            <div class="rounded-xl w-[20rem] bg-black/40">
                <div class="p-4">
                    <div class="w-full flex justify-center text-4xl p-3"
                        style="text-shadow: rgba(255, 0, 0, 1) 5px 0 10px;">
                        <h2 style="text-shadow: rgb(0, 0, 0) 3px 0 16px;">
                            <i>{{ uiStates.vehicleSpeedoData.metric == 0 ? (uiStates.vehicleSpeedoData.vehicleSpeed *
                                3.6).toFixed(0) : (uiStates.vehicleSpeedoData.vehicleSpeed * 2.236936).toFixed(0) }}</i>
                            <span class="text-gray-400 text-xl"> {{ uiStates.vehicleSpeedoData.metric == 0 ? "KM/H" :
                                "MPH" }}</span>
                        </h2>
                    </div>

                    <div v-if="uiStates.vehicleSpeedoData.vehicleRpm != 0 && uiStates.vehicleSpeedoData.fuelLevel > 0"
                        class="w-full flex justify-center bg-black/50 mt-2 rounded-xl h-2">
                        <div :class="rpmColour" class="flex justify-start duration-300 rounded-lg"
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


                <div
                    class="bg-black/50 rounded-b-xl flex justify-center h-[3vw] mt-2 items-center border-t-2 shadow-2xl shadow-black/50 border-gray-600 overflow-hidden">
                    <div class="rounded-lg text-gray-300" v-for="num in getMileageArr()" :key="num.key">
                        <font id="odometer" class="border-1 p-2.5 bg-black/70 border border-gray-900/50"
                            :class="num.key == getMileageArr().length - 1 ? 'rounded-r-lg' : num.key == 0 ? 'rounded-l-lg' : ''">
                            {{ num.num }}</font>
                    </div>
                    <div class="ml-4 text-gray-300 font-normal">
                        <p>{{ uiStates.vehicleSpeedoData.metric == 0 ? "KM" : "Miles" }}</p>
                    </div>
                </div>
            </div>

        </div>

        <div class="bg-black/50 absolute right-[3%] w-[20rem] bottom-[1%] text-white font-medium h-26 rounded-xl">
            <div class="w-full text-center items-center h-full relative p-3">

                <div class="bg-black/50 rounded-lg">
                    <div :class="uiStates.vehicleSpeedoData.fuelLevel.toFixed(0) < 20 ? uiStates.vehicleSpeedoData.fuelLevel.toFixed(0) < 10 ? 'bg-red-400' : 'bg-orange-400' : 'bg-green-500'"
                        class="rounded-lg h-2" :style="{ 'width': uiStates.vehicleSpeedoData.fuelLevel.toFixed(0) + '%' }">
                    </div>
                </div>
                <i class="fa-solid fa-gas-pump mt-3 text-red-400"></i> {{
                    uiStates.vehicleSpeedoData.fuelLevel.toFixed(0) }}
                {{ uiStates.vehicleSpeedoData.metric == 0 ? "Litres" : "Gallons" }}

                <div class="bg-black/50 rounded-lg">
                    <div class="bg-gray-300 rounded-lg h-2 mt-2 "
                        :style="{ 'width': (uiStates.vehicleSpeedoData.vehHealth / 10).toFixed(0) + '%' }">
                    </div>
                </div>
                <i class="fa-solid fa-gears text-gray-400 mt-3 "></i> {{ (uiStates.vehicleSpeedoData.vehHealth /
                    10).toFixed(0) }}%
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
        }
    },
    computed: {
        ...mapGetters({
            uiStates: 'getUiStates'
        }),
        rpmColour() {
            let vehRpm = (this.uiStates.vehicleSpeedoData.vehicleRpm * 100).toFixed(0)
            if (vehRpm > 85) {
                return "bg-red-600";
            }
            if (vehRpm > 70) {
                return "bg-red-500";
            }
            if (vehRpm > 60) {
                return "bg-red-300";
            }
            if (vehRpm > 30) {
                return "bg-orange-300";
            }
            return "bg-green-400"
        },
    },
    methods: {
        getMileageArr() {
            let arr = (this.uiStates.vehicleSpeedoData.vehicleMileage / (this.uiStates.vehicleSpeedoData.metric == 0 ? 1000 : 1609)).toFixed(0).split("");
            let fillAmount = arr.length > 6 ? arr.length - 6 : 6 - arr.length;

            let addToArr = Array(fillAmount).fill(0);
            addToArr.forEach(x => {
                arr.unshift(x);
            });

            let arrayWithIndex = [];
            arr.forEach((val, idx) => {
                arrayWithIndex.push({
                    num: val,
                    key: idx
                })
            });

            return arrayWithIndex;
        }
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