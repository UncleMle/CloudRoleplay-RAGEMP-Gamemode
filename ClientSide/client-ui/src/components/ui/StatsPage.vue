<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="colourBackground rounded-xl text-white w-[25vw] colourBackground border-b-4 border-t-4 border-purple-400/50 shadow-2xl shadow-black border-gray-400/40 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg">
                            <h1 class="font-bold text-2xl pb-2 pl-4"><i class="fa-solid fa-list text-gray-400"></i> Player
                                Stats</h1>
                            <CloseButton />

                            <div class="border-b-4 mr-4 ml-4 border-gray-400/50">

                            </div>

                            <div class="font-medium text-medium p-4">
                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-user pr-2"></i>Name</span>
                                    <span class="absolute right-0 top-0">{{ characterStats.character_name?.replace("_", " ")
                                    }}</span>
                                </div>
                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-money-bill pr-2"></i>Money
                                        Amount</span>
                                    <span class="absolute right-0 top-0 text-green-400">${{
                                        characterStats.money_amount?.toLocaleString("en-US") }}</span>
                                </div>
                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-money-bill pr-2"></i>Cash
                                        Amount</span>
                                    <span class="absolute right-0 top-0 text-green-400">${{
                                        characterStats.cash_amount?.toLocaleString("en-US") }}</span>
                                </div>
                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-money-bill pr-2"></i>Salary
                                        Amount</span>
                                    <span class="absolute right-0 top-0 text-green-400">${{
                                        characterStats.salary_amount?.toLocaleString("en-US") }}</span>
                                </div>
                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-star pr-2"></i>Experience</span>
                                    <span class="absolute right-0 top-0">{{
                                        characterStats.player_exp?.toLocaleString("en-US") }}</span>
                                </div>
                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-clock pr-2"></i>Play Time</span>
                                    <span class="absolute right-0 top-0">{{ (characterStats.play_time_seconds /
                                        60).toFixed(0) }} minutes</span>
                                </div>

                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-layer-group pr-2"></i>Faction
                                        Count</span>
                                    <span v-if="characterStats.character_faction_data" class="absolute right-0 top-0">{{
                                        JSON.parse(characterStats.character_faction_data).length }}</span>
                                    <span v-else class="absolute right-0 top-0">0</span>
                                </div>

                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-briefcase pr-2"></i>Freelance Job
                                        Status</span>
                                    <span class="absolute right-0 top-0">
                                        <span class="text-gray-300" v-if="!characterStats.freelance_job_data">
                                            Unemployed
                                        </span>
                                        <span v-else>
                                            {{ JSON.parse(characterStats.freelance_job_data).jobName }}
                                        </span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </main>
</template>

<script>
import { mapGetters } from 'vuex';
import CloseButton from './CloseButton.vue';
import { licenses } from '@/helpers';

export default {
    data() {
        return {
            licenses: licenses
        }
    },
    components: {
        CloseButton
    },
    computed: {
        ...mapGetters({
            characterStats: "getPlayerStats",
            playerDataServer: "getPlayerDataServer"
        })
    }
}
</script>