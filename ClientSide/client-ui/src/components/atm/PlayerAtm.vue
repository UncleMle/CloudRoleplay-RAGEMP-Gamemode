<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full colourBackground border-t-4 border-b-4 border-purple-400/50 shadow-2xl shadow-black border-gray-400/40 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg duration-300 text-xl text-gray-200 font-medium">
                            <h1 class="font-bold text-2xl pb-2 pl-4"><i v-if="!playerData.atm_data.isBank"
                                    class="fa-solid fa-money-bill text-gray-300"></i>
                                <i v-else class="fa-solid fa-building-columns text-gray-400"></i>
                                {{ playerData.atm_data.isBank ? "Bank" : "Atm" }} Management
                            </h1>

                            <div class="border-b-4 mr-4 ml-4 border-gray-400/50">

                            </div>
                            <CloseButton />

                            <button @click="browserView = 'home'" v-if="browserView != 'home'"
                                class="absolute left-2 text-2xl duration-300 hover:text-purple-400">
                                <i class="fa-solid fa-arrow-left"></i>
                            </button>


                            <div v-if="browserView == 'home'" class="mr-[10%] ml-[10%] text-center p-3 space-y-5">

                                <div>
                                    <button @click="browserView = 'withdraw'"
                                        class="p-3 rounded-xl hover:text-purple-400 duration-300 w-full border-2 bg-black/20 border-purple-400/50">Withdraw</button>
                                </div>
                                <div v-if="playerData.atm_data.isBank">
                                    <button @click="browserView = 'salary'"
                                        class="p-3 rounded-xl hover:text-purple-400 duration-300 w-full border-2 bg-black/20 border-purple-400/50">Retrieve
                                        Salary</button>
                                </div>
                                <div v-if="playerData.atm_data.isBank">
                                    <button @click="browserView = 'transfer'"
                                        class="p-3 rounded-xl hover:text-purple-400 duration-300 w-full border-2 bg-black/20 border-purple-400/50">Transfer</button>
                                </div>
                                <div v-if="playerData.atm_data.isBank">
                                    <button @click="browserView = 'deposit'"
                                        class="p-3 rounded-xl hover:text-purple-400 duration-300 w-full border-2 bg-black/20 border-purple-400/50">Deposit</button>
                                </div>
                                <div>
                                    <button @click="browserView = 'viewBal'"
                                        class="p-3 rounded-xl hover:text-purple-400 duration-300 w-full border-2 bg-black/20 border-purple-400/50">View
                                        Balance</button>
                                </div>
                            </div>

                            <div v-if="browserView == 'viewBal'" class="text-center mt-4">
                                <p>Your current balance is <font class="p-2 rounded-lg text-green-400">${{
                                    playerData.atm_data.balanceMoney.toLocaleString("en-US") }}</font>
                                </p>
                                <p class="mt-6">Your current balance in cash is <font
                                        class=" p-2 rounded-lg text-green-400">${{
                                            playerData.atm_data.balanceCash.toLocaleString("en-US") }}</font>
                                </p>
                                <p class="mt-6">Your current salary is <font class=" p-2 rounded-lg text-green-400">${{
                                    playerData.atm_data.balanceSalary.toLocaleString("en-US") }}</font>
                                </p>
                            </div>

                            <div v-if="browserView == 'withdraw'" class="text-center mt-4">
                                <div>
                                    <p>Your current balance is <font class=" p-2 rounded-lg text-green-400">${{
                                        playerData.atm_data.balanceMoney.toLocaleString("en-US") }}</font>
                                    </p>
                                </div>

                                <div class="mt-6 mr-[15%] ml-[15%] space-y-5">
                                    <div class="p-3 rounded-lg bg-black/60">
                                        <i class="fa-solid fa-dollar-sign"></i>
                                        <input type="number" min="0" max="200000" v-model="withdrawCash"
                                            class="pr-3 pl-2 pb-3 pt-3 w-[90%] bg-transparent"
                                            placeholder="Enter an amount to withdraw" />
                                    </div>
                                    <button @click="withdrawPlayerCash" :disabled="serverLoading"
                                        class="w-full border-2 p-3.5 rounded-lg border-purple-400/50 duration-300 hover:text-purple-400">
                                        <LoadingSpinner v-if="serverLoading" />
                                        <span v-else>Withdraw</span>
                                    </button>
                                </div>
                            </div>

                            <div v-if="browserView == 'transfer'" class="text-center mt-4">
                                <div>
                                    <p>Your current balance is <font class="p-2 rounded-lg text-green-400">${{
                                        playerData.atm_data.balanceMoney.toLocaleString("en-US") }}</font>
                                    </p>
                                </div>

                                <div class="mt-6 mr-[15%] ml-[15%] space-y-5">
                                    <div class="p-3 rounded-lg bg-black/60">
                                        <i class="fa-solid fa-id-card-clip"></i>
                                        <input v-model="transferCashName" class="pr-3 pl-2 pb-3 pt-3 w-[90%] bg-transparent"
                                            placeholder="Enter the users full name" />
                                    </div>
                                    <div class="p-3 rounded-lg bg-black/60">
                                        <i class="fa-solid fa-dollar-sign"></i>
                                        <input type="number" min="0" max="200000" v-model="transferCashAmount"
                                            class="pr-3 pl-2 pb-3 pt-3 w-[90%] bg-transparent"
                                            placeholder="Enter an amount to withdraw" />
                                    </div>
                                    <button @click="transferCash" :disabled="serverLoading"
                                        class="w-full border-2 p-3.5 rounded-lg border-purple-400/50 duration-300 hover:text-purple-400">
                                        <LoadingSpinner v-if="serverLoading" />
                                        <span v-else>Transfer</span>
                                    </button>
                                </div>
                            </div>

                            <div v-if="browserView == 'deposit'" class="text-center mt-4">
                                <div>
                                    <p>Your current cash balance is <font class=" p-2 rounded-lg text-green-400">${{
                                        playerData.atm_data.balanceCash.toLocaleString("en-US") }}</font>
                                    </p>
                                </div>

                                <div class="mt-6 mr-[15%] ml-[15%] space-y-5">
                                    <div class="p-3 rounded-lg bg-black/60">
                                        <i class="fa-solid fa-dollar-sign"></i>
                                        <input type="number" min="0" max="200000" v-model="depositAmount"
                                            class="pr-3 pl-2 pb-3 pt-3 w-[90%] bg-transparent"
                                            placeholder="Enter an amount to deposit" />
                                    </div>
                                    <button @click="depositPlayerCash" :disabled="serverLoading"
                                        class="w-full border-2 p-3.5 rounded-lg border-purple-400/50 duration-300 hover:text-purple-400">
                                        <LoadingSpinner v-if="serverLoading" />
                                        <span v-else>Deposit</span>
                                    </button>
                                </div>
                            </div>

                            <div v-if="browserView == 'salary'" class="text-center mt-4">
                                <div>
                                    <p>Your current salary balance is <font class="p-2 rounded-lg text-green-400">${{
                                        playerData.atm_data.balanceSalary.toLocaleString("en-US") }}</font>
                                    </p>
                                </div>

                                <div class="mt-6 mr-[15%] ml-[15%] space-y-5">
                                    <button @click="retrieveSalary"
                                        :disabled="serverLoading || playerData.atm_data.balanceSalary == 0"
                                        class="w-full border-2 p-3.5 rounded-lg border-purple-400/50 duration-300"
                                        :class="playerData.atm_data.balanceSalary == 0 ? 'hover:text-red-400' : 'hover:text-purple-400'">
                                        <LoadingSpinner v-if="serverLoading" />
                                        <span v-else>Retrieve</span>
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
import { sendToServer } from '@/helpers';

export default {
    data() {
        return {
            browserView: "home",
            withdrawCash: "",
            transferCashName: "",
            transferCashAmount: "",
            depositAmount: "",
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
            if (this.withdrawCash.length === 0) return;

            this.$store.state.uiStates.serverLoading = true;

            sendToServer("server:atmWithdrawCash", this.withdrawCash);
        },
        depositPlayerCash() {
            if (this.depositAmount.length === 0) return;

            this.$store.state.uiStates.serverLoading = true;

            sendToServer("server:bankDepositCash", this.depositAmount);
        },
        transferCash() {
            if (this.transferCashAmount.length === 0) return;

            this.$store.state.uiStates.serverLoading = true;

            sendToServer("server:bankTransferSomeone", JSON.stringify({
                recieverName: this.transferCashName,
                transferAmount: this.transferCashAmount
            }));
        },
        retrieveSalary() {
            this.$store.state.uiStates.serverLoading = true;

            sendToServer("server:bank:retrieveSalary");
        }
    }
}
</script>