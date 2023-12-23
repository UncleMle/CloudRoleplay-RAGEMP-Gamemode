<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg border border-gray-900 ">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-money-bill text-gray-400"></i> Atm Management</h1>
                            <CloseButton />

                            {{ playerData }}

                            <div v-if="browserView == 'home'" class="mr-[10%] ml-[10%] text-center p-3 space-y-5 text-xl text-gray-200 font-medium">

                                <div class="border p-3 rounded-xl border-gray-500 bg-black/50 hover:text-green-400 duration-300">
                                    <button>Withdraw</button>
                                </div>
                                <div class="border p-3 rounded-xl border-gray-500 bg-black/50 hover:text-green-400 duration-300">
                                    <button>Transfer</button>
                                </div>
                                <div class="border p-3 rounded-xl border-gray-500 bg-black/50 hover:text-green-400 duration-300">
                                    <button>Donate</button>
                                </div>
                                <div class="border p-3 rounded-xl border-gray-500 bg-black/50 hover:text-green-400 duration-300">
                                    <button>View Balance</button>
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
import CloseButton from '../ui/CloseButton.vue';
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            browserView: "home"
        }
    },
    components: {
        CloseButton
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    }
}
</script>