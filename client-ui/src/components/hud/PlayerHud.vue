<template>
    <div v-if="getGuiLength() > 0" class="w-full select-none">
        <div class="absolute p-2 top-[48vw] left-[16vw] text-xl font-medium text-white">
            <h1 style="text-shadow: 1px 1px 2px black;"><span class="text-gray-400 text-4xl pr-2">|</span><span class="text-3xl">{{ playerGuiData.direction }}</span><span class="pl-2 text-gray-400 text-4xl">|</span></h1>

            <div class="mt-2">
                <h1 style="text-shadow: 1px 1px 2px black;">ID {{ playerGuiData.playerId }} | {{ playerGuiData.unix }}</h1>
                <h1 style="text-shadow: 1px 1px 2px black;">{{ playerGuiData.zoneName }}</h1>
                <h1 style="text-shadow: 1px 1px 2px black;">{{ playerGuiData.zoneNameTwo }}</h1>
            </div>

            <h1 v-if="playerGuiData.isFrozen" style="text-shadow: 1px 1px 2px black;" class="text-red-500"><i class="fa-solid fa-shield pr-2"></i>You are Frozen.</h1>
        </div>
    </div>
</template>

<script>
    import { mapGetters } from "vuex";

    export default {
        computed: {
            ...mapGetters({
                playerGuiData: "getGuiData"
            })
        },
        methods: {
            getGuiLength() {
                return Object.keys(this.playerGuiData).length;
            }
        }
    }

</script>

