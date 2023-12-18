<template>
    <main class="w-full flex justify-center mt-4">
        <div class="w-full overflow-y-scroll h-[74%]" v-if="playerData.phone_data_player_vehicles.length">
            <div v-for="(item, i) in playerData.phone_data_player_vehicles" :key="i">
                <div class="relative border border-gray-500 rounded-lg p-3 mt-3 mr-1 ml-1">
                    <img :src="getCarImagePath(item.vehicle_name)" class="w-20 h-10 rounded-lg"/>
                    <font class="absolute right-3 top-2">{{ item.vehicle_name }}</font>
                </div>
            </div>
        </div>
        <LoadingSpinner v-else />
    </main>
</template>

<script>
import { mapGetters } from 'vuex';
import LoadingSpinner from '../ui/LoadingSpinner.vue';
import getCarImagePath from '@/helpers';

export default {
    data() {
        return {
            fetchVehiclesEvent: "server:myCarsApp::fetchVehicles"
        }
    },
    components: {
        LoadingSpinner
    },
    methods: {
        getCarImagePath
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    created() {
        window.mp.trigger("browser:sendString", this.fetchVehiclesEvent);
    }
}

</script>