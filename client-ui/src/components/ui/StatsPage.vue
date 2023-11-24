<template>
    <main>
        <div class="fixed inset-0 bg-zinc-900/10 z-10 backdrop-blur-sm w-full text-white">
            <div class="container flex items-center max-w-lg mx-auto mt-32">
                <div class="relative bg-[#0b0b0b]/80 w-full h-fit py-4 rounded-lg border border-gray-900 shadow-2xl shadow-black/25 p-4">
                    <h1 class="font-bold text-2xl border-b pb-2 border-gray-500"><i class="fa-solid fa-list"></i> Player Stats</h1>
                <button @click="resetRouter()" class="absolute top-1 right-4">
                    <i class="fa-solid fa-xmark duration-300 hover:text-red-500"></i>
                </button>

                <div class="font-medium text-medium">
                    <div class="relative w-full mt-4">
                        <span class="left-0 top-0 "><i class="fa-solid fa-user pr-2"></i>Name</span>
                        <span class="absolute right-0 top-0">{{ characterStats.character_name.replace("_", " ") }}</span>
                    </div>
                    <div class="relative w-full mt-4">
                        <span class="left-0 top-0 "><i class="fa-solid fa-id-card-clip pr-2"></i>Money Amount</span>
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
            </div>
        </div>
    </main>
</template>

<script>
    import { mapGetters } from 'vuex';

    export default {
        computed: {
            ...mapGetters({
                characterStats: "getPlayerStats",
                playerDataServer: "getPlayerDataServer"
            })
        },
        methods: {
            resetRouter() {
                if (window.mp) {
                    window.mp.trigger("browser:resetRouter");
                }
            }
        }
    }
</script>