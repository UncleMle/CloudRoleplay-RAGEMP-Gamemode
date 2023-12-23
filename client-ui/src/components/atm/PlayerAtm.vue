<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg border border-gray-900 duration-300 text-xl text-gray-200 font-medium">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-money-bill text-gray-400"></i> Atm Management</h1>
                            <CloseButton />

                            <button @click="browserView = 'home'" v-if="browserView != 'home'" class="absolute left-2 text-2xl duration-300 hover:text-red-400">
                                <i class="fa-solid fa-arrow-left"></i>
                            </button>

                            <div v-if="browserView == 'home'" class="mr-[10%] ml-[10%] text-center p-3 space-y-5">

                                <div>
                                    <button @click="browserView = 'withdraw'" class="border p-3 rounded-xl border-gray-600 bg-black/50 hover:text-green-400 duration-300 w-full">Withdraw</button>
                                </div>
                                <div>
                                    <button class="border p-3 rounded-xl border-gray-600 bg-black/50 hover:text-green-400 duration-300 w-full">Transfer</button>
                                </div>
                                <div>
                                    <button class="border p-3 rounded-xl border-gray-600 bg-black/50 hover:text-green-400 duration-300 w-full">Donate</button>
                                </div>
                                <div>
                                    <button @click="browserView = 'viewBal'" class="border p-3 rounded-xl border-gray-500 bg-black/50 hover:text-green-400 duration-300 w-full">View Balance</button>
                                </div>
                            </div>

                            <div v-if="browserView == 'viewBal'" class="text-center mt-4">
                                <p>Your current balance is <font class="bg-black/60 p-2 rounded-lg text-green-400">${{ playerData.atm_data.balance.toLocaleString("en-US") }}</font></p>
                            </div>

                            <div v-if="browserView == 'withdraw'" class="text-center mt-4">
                                <div>
                                    <p>Your current balance is <font class="bg-black/60 p-2 rounded-lg text-green-400">${{ playerData.atm_data.balance.toLocaleString("en-US") }}</font></p>
                                </div>

                                <div class="mt-6 mr-[15%] ml-[15%] space-y-5">
                                    <div class="p-3 rounded-lg bg-black/60">
                                        <i class="fa-solid fa-dollar-sign"></i>
                                            <input class="pr-3 pl-2 pb-3 pt-3 w-[90%] bg-transparent" placeholder="Enter an amount to withdraw"/>
                                    </div>
                                    <button class="w-full border p-3.5 rounded-lg border-gray-600 bg-black/50 duration-300 hover:text-green-400">
                                        <LoadingSpinner v-if="serverLoading" />
                                        <span v-else>Withdraw</span>
                                    </button>
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
import LoadingSpinner from '../ui/LoadingSpinner.vue';
import { mapGetters } from 'vuex';

export default {
    data() {
        return {
            browserView: "withdraw",
            withdrawCash: ""
        }
    },
    components: {
        CloseButton,
        LoadingSpinner
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
            serverLoading: 'getLoadingState'
        })
    },
    methods: {
        withdrawPlayerCash() {
            this.$store.state.uiStates.loadingState = true;
            window.mp.trigger("browser:sendString", "server:atmWithdrawCash", this.withdrawCash);
        }
    }
}
</script>