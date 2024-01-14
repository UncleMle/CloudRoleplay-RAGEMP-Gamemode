<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg border border-gray-900 ">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i class="fa-solid fa-list text-gray-400"></i> Player Stats</h1>
                            <CloseButton />

                            <div class="font-medium text-medium p-4">
                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-user pr-2"></i>Name</span>
                                    <span class="absolute right-0 top-0">{{ characterStats.character_name.replace("_", " ") }}</span>
                                </div>
                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-id-card-clip pr-2"></i>Player ID</span>
                                    <span class="absolute right-0 top-0">{{ playerDataServer.id }}</span>
                                </div>
                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-money-bill pr-2"></i>Money Amount</span>
                                    <span class="absolute right-0 top-0 text-green-400">${{ characterStats.money_amount.toLocaleString("en-US") }}</span>
                                </div>
                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-money-bill pr-2"></i>Cash Amount</span>
                                    <span class="absolute right-0 top-0 text-green-400">${{ characterStats.cash_amount.toLocaleString("en-US") }}</span>
                                </div>
                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-star pr-2"></i>Experience</span>
                                    <span class="absolute right-0 top-0">{{ characterStats.player_exp.toLocaleString("en-US") }}</span>
                                </div>
                                <div class="relative w-full mt-4">
                                    <span class="left-0 top-0 "><i class="fa-solid fa-clock pr-2"></i>Play Time</span>
                                    <span class="absolute right-0 top-0">{{ (characterStats.play_time_seconds / 60).toFixed(0) }} minutes</span>
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

    export default {
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