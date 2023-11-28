<template>
    <main>
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
                                <span class="left-0 top-0 "><i class="fa-regular fa-calendar-days pr-2"></i>Created At</span>
                                <span class="absolute right-0 top-0">{{ characterStats.CreatedDate }}</span>
                            </div>
                            <div class="relative w-full mt-4">
                                <span class="left-0 top-0 "><i class="fa-regular fa-calendar-days pr-2"></i>Updated At</span>
                                <span class="absolute right-0 top-0">{{ characterStats.UpdatedDate }}</span>
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