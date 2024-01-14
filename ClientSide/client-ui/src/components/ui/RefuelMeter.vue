<template>
    <main class="flex items-center mt-[20%] w-full">

        <div class="mb-52 ml-10 bg-black/60 w-[16%] p-3 font-medium text-white text-2xl rounded-xl">
            <div class="bg-black/80 rounded-lg text-5xl pl-4 relative">
                <font id="digitext" class="pr-2 text-gray-400">{{ playerData.vehicle_refuel_data.fuel_literage.toFixed(2) }}</font><font class="absolute text-2xl pr-4 right-0 top-2">Litres L</font>
            </div>
            <div class="bg-black/80 mt-4 text-5xl pl-4 relative rounded-lg">
                <font id="digitext" class="pr-2 text-gray-400">{{ playerData.vehicle_refuel_data.price }}</font><font class="text-2xl pr-4 absolute right-0 top-2">This Sale $</font>
            </div>

        </div>

    </main>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            fuelLiterage: 12490,
            fuelPrice: 290
        }
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
        })
    }

}
</script>


