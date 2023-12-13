<template>
    <main class="relative">
        <div class="absolute right-[3%] ">
            <div class="container flex items-center w-[18vw] mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="relative w-full h-fit py-4 rounded-lg border border-gray-900 ">
                            <h1 class="font-bold text-2xl border-b-2 pb-2 border-gray-500 pl-4"><i
                                    class="fa-solid fa-shirt text-gray-400"></i> Tattoo Store</h1>
                            <CloseButton :callback="close" />

                            <ui class="flex justify-center mt-2 space-x-10 border-b-2 pb-2 border-gray-500">
                                <button v-if="armRight.length > 0" @click="browsingType = 'armRight'" class="hover:text-white">
                                    <span class="text-gray-300 hover:text-white duration-300">Right Arm</span>
                                </button>

                                <button v-if="armLeft.length > 0" @click="browsingType = 'armLeft'" class="hover:text-green-500 duration-300">
                                    <span class="text-gray-300 hover:text-white duration-300">Left Arm</span>
                                </button>

                                <button v-if="torso.length > 0" @click="browsingType = 'torso'" class="hover:text-green-500 duration-300">
                                    <span class="text-gray-300 hover:text-white duration-300">Torso</span>
                                </button>

                                <button v-if="head.length > 0" @click="browsingType = 'head'" class="hover:text-green-500 duration-300">
                                    <span class="text-gray-300 hover:text-white duration-300">Head</span>
                                </button>
                            </ui>

                            <div class="p-6 max-h-[20vw] overflow-x-hidden overflow-scroll">
                                <div v-if="browsingType == 'armRight'">
                                    <div v-for="item in armRight" :key="armRight.indexOf(item)">
                                        <div
                                            :class="armRight.indexOf(item) == 0 ? 'border-b border-t border-gray-600' : 'border-b border-gray-600'">
                                            <label for="steps-range"
                                                class="block mt-2 mb-2 text-lg font-medium text-center text-white ">{{
                                                    item.LocalizedName }}</label>
                                            <div class="flex justify-center space-x-16 mt-4 pb-2">
                                                <button :disabled="checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale)"
                                                    v-if="!checkIfSelectedContains(item.HashNameMale, item.HashNameFemale)"
                                                    @click="addTat(item.HashNameMale, item.HashNameFemale)"
                                                    :class="checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale) ? 'text-gray-400 border-gray-500' : 'border-green-400/40'"
                                                    class="border p-1 w-44 rounded-xl font-medium">
                                                    <i v-if="!checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale)"
                                                        class="fa-solid fa-check-to-slot text-green-400"></i>
                                                    {{ checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale) ? "You already have this " :
                                                        "Apply" }}</button>
                                                <button @click="removeTat(item.HashNameMale, item.HashNameFemale)" v-else
                                                    class="border p-1 w-32 border-red-400/20 rounded-xl">
                                                    <i class="fa-solid fa-rotate-left text-red-400"></i> Reset</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                                <div v-if="browsingType == 'armLeft'">
                                    <div v-for="item in armLeft" :key="armLeft.indexOf(item)">
                                        <div
                                            :class="armLeft.indexOf(item) == 0 ? 'border-b border-t border-gray-600' : 'border-b border-gray-600'">
                                            <label for="steps-range"
                                                class="block mt-2 mb-2 text-lg font-medium text-center text-white ">{{
                                                    item.LocalizedName }}</label>
                                            <div class="flex justify-center space-x-16 mt-4 pb-2">
                                                <button :disabled="checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale)"
                                                    v-if="!checkIfSelectedContains(item.HashNameMale, item.HashNameFemale)"
                                                    @click="addTat(item.HashNameMale, item.HashNameFemale)"
                                                    :class="checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale) ? 'text-gray-400 border-gray-500' : 'border-green-400/40'"
                                                    class="border p-1 w-44 rounded-xl font-medium">
                                                    <i v-if="!checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale)"
                                                        class="fa-solid fa-check-to-slot text-green-400"></i>
                                                    {{ checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale) ? "You already have this " :
                                                        "Apply" }}</button>
                                                <button @click="removeTat(item.HashNameMale, item.HashNameFemale)" v-else
                                                    class="border p-1 w-32 border-red-400/20 rounded-xl">
                                                    <i class="fa-solid fa-rotate-left text-red-400"></i> Reset</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="browsingType == 'torso'">
                                    <div v-for="item in torso" :key="torso.indexOf(item)">
                                        <div
                                            :class="torso.indexOf(item) == 0 ? 'border-b border-t border-gray-600' : 'border-b border-gray-600'">
                                            <label for="steps-range"
                                                class="block mt-2 mb-2 text-lg font-medium text-center text-white ">{{
                                                    item.LocalizedName }}</label>
                                            <div class="flex justify-center space-x-16 mt-4 pb-2">
                                                <button :disabled="checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale)"
                                                    v-if="!checkIfSelectedContains(item.HashNameMale, item.HashNameFemale)"
                                                    @click="addTat(item.HashNameMale, item.HashNameFemale)"
                                                    :class="checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale) ? 'text-gray-400 border-gray-500' : 'border-green-400/40'"
                                                    class="border p-1 w-44 rounded-xl font-medium">
                                                    <i v-if="!checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale)"
                                                        class="fa-solid fa-check-to-slot text-green-400"></i>
                                                    {{ checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale) ? "You already have this " :
                                                        "Apply" }}</button>
                                                <button @click="removeTat(item.HashNameMale, item.HashNameFemale)" v-else
                                                    class="border p-1 w-32 border-red-400/20 rounded-xl">
                                                    <i class="fa-solid fa-rotate-left text-red-400"></i> Reset</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div v-if="browsingType == 'head'">
                                    <div v-for="item in head" :key="head.indexOf(item)">
                                        <div
                                            :class="head.indexOf(item) == 0 ? 'border-b border-t border-gray-600' : 'border-b border-gray-600'">
                                            <label for="steps-range"
                                                class="block mt-2 mb-2 text-lg font-medium text-center text-white ">{{
                                                    item.LocalizedName }}</label>
                                            <div class="flex justify-center space-x-16 mt-4 pb-2">
                                                <button :disabled="checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale)"
                                                    v-if="!checkIfSelectedContains(item.HashNameMale, item.HashNameFemale)"
                                                    @click="addTat(item.HashNameMale, item.HashNameFemale)"
                                                    :class="checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale) ? 'text-gray-400 border-gray-500' : 'border-green-400/40'"
                                                    class="border p-1 w-44 rounded-xl font-medium">
                                                    <i v-if="!checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale)"
                                                        class="fa-solid fa-check-to-slot text-green-400"></i>
                                                    {{ checkIfAlreadyHave(item.HashNameMale, item.HashNameFemale) ? "You already have this " :
                                                        "Apply" }}</button>
                                                <button @click="removeTat(item.HashNameMale, item.HashNameFemale)" v-else
                                                    class="border p-1 w-32 border-red-400/20 rounded-xl">
                                                    <i class="fa-solid fa-rotate-left text-red-400"></i> Reset</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                            </div>

                        </div>
                    </div>
                </div>
            </div>
            <div class="text-center mt-5 text-white font-medium bg-black/50 p-3 rounded-lg">
                <label for="steps-range" class="block mb-2 text-sm font-medium  text-white">Rotation ({{ rotation
                }})</label>
                <input id="steps-range" v-model="rotation" type="range" min="0" max="360"
                    class="w-full h-4  rounded-lg appearance-none cursor-pointer bg-gray-500 accent-gray-300 accent-shadow-lg accent-shadow-black">
            </div>

            <div class="text-center mt-5 text-white font-medium">
                <button @click="purchaseTat" v-if="!loadingState" :disabled="loadingState"
                    class="bg-black/60 w-full p-3 rounded-xl duration-300 hover:text-green-400"><i
                        class="fa-solid fa-cart-shopping"></i> Purchase Tattoos</button>
                <LoadingSpinner class="bg-black/60 w-full p-3 rounded-xl" v-if="loadingState" />
            </div>
        </div>
    </main>
</template>

<script>
import { mapGetters } from 'vuex';
import LoadingSpinner from '../ui/LoadingSpinner.vue';
import CloseButton from '../ui/CloseButton.vue';

export default {
    components: {
        LoadingSpinner,
        CloseButton
    },
    data() {
        return {
            torso: [],
            armRight: [],
            armLeft: [],
            head: [],
            selectedTats: [],
            browsingType: "armRight",
            rotation: 180
        }
    },
    watch: {
        selectedTats() {
            console.log(JSON.stringify(this.selectedTats) + " TRIGGERED");
            window.mp.trigger("tat:setTatto", JSON.stringify(this.selectedTats));
        },
        rotation() {
            window.mp.trigger("clothes:setRot", this.rotation);
        }
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
            loadingState: 'getLoadingState',
        })
    },
    methods: {
        checkIfSelectedContains(tatNameM, tatNameF) {
            let found = false;

            this.selectedTats.forEach(data => {
                if (data.male != "" && data.male == tatNameM || data.female == tatNameF && data.female != "") {
                    found = true;
                }
            })

            return found;
        },
        addTat(mName, fName) {
            this.selectedTats.push(
                { male: mName, female: fName }
            );
        },
        close() {
            window.mp.trigger("tat:resync");
        },
        removeTat(tatNameM, tatNameF) {
            let idx;

            this.selectedTats.forEach((data, i) => {
                if (data.male != "" && data.male == tatNameM || data.female == tatNameF && data.female != "") {
                    idx = i;
                }
            });

            this.selectedTats.splice(idx, 1);
        },
        purchaseTat() {
            this.$store.state.uiStates.serverLoading = true;
            window.mp.trigger("tat:purchase", JSON.stringify(this.selectedTats));
            window.mp.trigger("browser:resetRouter");
        },
        checkIfAlreadyHave(spawnNameM, spawnNameF) {
            let found;

            this.playerData.player_current_tats.forEach(data => {
                if (data.tattoo_collection == spawnNameF || data.tattoo_collection == spawnNameM) {
                    found = true;
                }
            })

            return found;
        }
    },
    mounted() {
        let tattoData = this.playerData.tattoo_store_data;
        if (!tattoData) return;

        tattoData.forEach(data => {
            if (data.Zone == "ZONE_TORSO") {
                this.torso.push(data);
            }

            if (data.Zone == "ZONE_LEFT_ARM") {
                this.armLeft.push(data);
            }

            if (data.Zone == "ZONE_RIGHT_ARM") {
                this.armRight.push(data);
            }

            if (data.Zone == "ZONE_HEAD") {
                this.head.push(data);
            }
        });

    }
}
</script>