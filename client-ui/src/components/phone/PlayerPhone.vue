
<template>
    <main class="relative duration-500">

        <div id="phone duration-300" :class="(phoneOpen ? 'bottom-[2%]' : 'bottom-[-26.9rem]') + ' ' + phoneBg"
            class="fixed right-[22%] shadow-2xl h-[30rem] shadow-black bg-black text-white font-medium w-[16rem] rounded-t-[1.7vw]  rounded-b-[1.7vw] border-t-2 border-r-2  border-b-2 border-l-2 border-slate-400 bg-cover bg-no-repeat">
            <div
                class="w-full h-full border-r-[4px] border-t-[4px] border-b-[4px] border-l-[4px] rounded-t-[1.7vw] rounded-b-[1.7vw] border-black ">
                <button @click="openPhone" class="w-full content-normal flex justify-center h-5">
                    <div class="bg-black w-[30%] mt-1 rounded-xl relative h-full">
                        <p class="absolute left-2 top-[5px] rounded-full bg-gray-400/40 w-[0.5vw] h-[0.5vw]"></p>
                        <p
                            class="absolute right-2 top-[5px] rounded-full bg-gray-400/40 w-[0.5vw] h-[0.5vw] border-[3px] border-gray-400/70">
                        </p>
                    </div>
                    <font :style="textShadow" class="absolute left-[10%] top-2 text-sm">
                        11:00
                    </font>
                    <font :style="textShadow" class="absolute right-[10%] top-2 text-sm">
                        <i class="fa-solid fa-signal pr-2"></i>
                        <i class="fa-solid fa-battery-three-quarters"></i>
                    </font>
                </button>

                <div v-if="currentApp != ''">
                    <div v-if="currentApp == 'My Cars'" class="flex w-full">
                        <MyCarsApp />
                    </div>
                </div>

                <div v-else>
                    <div class="w-full mt-6">
                        <div class="grid grid-cols-3 gap-4 mr-2 ml-2">
                            <div v-for="app in availableApps" :key="app.name">
                                <button @click="currentApp = app.name, phoneBg = app.bg" class="relative text-center">
                                    <div class=" rounded-2xl bg-cover bg-no-repeat text-center">
                                        <img :src="app.img" class="scale-100 rounded-2xl" />
                                    </div>
                                    <font :style="textShadow" class="text-gray-200 text-xs">
                                        {{ app.name }}
                                    </font>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div v-if="currentApp == ''" class="absolute bottom-1 w-full">
                <div class="flex justify-center text-center w-full p-4 rounded-2xl">
                    <div class="grid grid-cols-3 w-full p-3 rounded-2xl backdrop-blur-2xl">
                        <button class="rounded-xl bg-[url('https://i.imgur.com/UEbUqV3.png')] bg-contain bg-no-repeat h-[3rem] w-[3rem]">
                        </button>
                        <button class="rounded-xl bg-[url('https://i.imgur.com/R6rAT5m.png')] bg-contain bg-no-repeat h-[3rem] w-[3rem]">
                        </button>
                        <button class="rounded-xl bg-[url('https://i.imgur.com/LiDybTZ.png')] bg-contain bg-no-repeat h-[3rem] w-[3rem]">
                        </button>
                    </div>
                </div>
            </div>

            <button v-if="currentApp != ''" @click="homeButton"
                class="absolute bottom-1 w-full duration-500 hover:bottom-5 p-2">
                <div class="flex justify-center ml-7 mr-7 h-1 bg-gray-200 rounded-lg">
                </div>
            </button>
        </div>

    </main>
</template>

<script>
import { mapGetters } from 'vuex';
import MyCarsApp from './MyCarsApp.vue';

export default {
    data() {
        return {
            appBaseStyle: "rounded-t-[1.7vw] " + this.phoneOpen ? 'rounded-b-[1.7vw]' : '',
            currentApp: "My Cars",
            basePhoneBg: "bg-[url('https://i.imgur.com/C8nWb8y.jpg')]",
            phoneBg: "bg-[#0b0b0b]",
            topPhoneStyle: "bottom-16",
            phoneOpen: true,
            spaceOrTabPressed: false,
            textShadow: "text-shadow: rgba(0, 0, 0, 0.563) 1px 0 10px;",
            availableApps: [
                { name: "My Cars", img: "https://i.imgur.com/iXN6nMI.png", bg: "bg-[#0b0b0b]" },
                { name: "Rob App", img: "https://i.imgur.com/XqotRh0.png" },
            ]
        }
    },
    computed: {
        ...mapGetters({
            uiStates: 'getUiStates'
        })
    },
    components: {
        MyCarsApp
    },
    methods: {
        openPhone() {
            if (this.spaceOrTabPressed) return;

            let targetStyle = "bottom-16";
            this.topPhoneStyle === targetStyle ? this.topPhoneStyle = "" : this.topPhoneStyle = targetStyle;
            this.phoneOpen = !this.phoneOpen;
        },
        homeButton() {
            if(!this.spaceOrTabPressed) {
                this.phoneBg = this.basePhoneBg;
                this.currentApp = "";
            }
        },
        keyUpListener(e) {
            this.spaceOrTabPressed = e.keyCode == 32 || e.keyCode == 9;
        }
    },
    created() {
        document.addEventListener("keyup", this.keyUpListener);
    }
}
</script>
