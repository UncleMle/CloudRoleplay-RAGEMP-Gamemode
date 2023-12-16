
import AppVue from '@/App.vue';
<template>
    <main class="relative duration-500">

        <div id="phone" :class="topPhoneStyle"
            class="fixed bottom-0 right-[27%] shadow-2xl shadow-black bg-black text-white font-medium w-[11%] rounded-t-[1.7vw] h-10 border-t-2 border-r-2 border-l-2 border-slate-400 bg-[url('https://i.imgur.com/X5e1fYI.png')] bg-cover bg-no-repeat">
            <div class="w-full h-full border-r-[4px] border-t-[4px] border-l-[4px] rounded-t-[1.7vw] border-black "
                :class="phoneOpen ? 'border-b-[4px] rounded-b-[1.7vw]' : ''">

                <button @click="openPhone" class="w-full content-normal flex justify-center h-5">
                    <div class="bg-black w-[30%] mt-1 rounded-xl relative h-full">
                        <!-- <div class="absolute right-4 h-3 top-0.5 bg-gray-600 w-3 rounded-full">
                        </div>
                        <div class="absolute left-4 h-3 top-0.5 bg-gray-800 w-3 rounded-full">
                        </div> -->
                    </div>
                    <font class="absolute left-6 top-2 text-sm">
                        11:00
                    </font>
                    <font class="absolute right-6 top-2 text-sm">
                        100%
                    </font>
                </button>

                <div class="w-full mt-6">
                    <div class="grid grid-cols-3 gap-4 mr-2 ml-2">
                        <div v-for="app in availableApps" :key="app.name">
                            <button class="relative text-center">
                                <div class=" rounded-2xl bg-cover bg-no-repeat text-center bg-black/70">
                                    <img :src="app.img" class="scale-100 rounded-2xl"/>
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

    </main>
</template>

<script>
export default {
    data() {
        return {
            topPhoneStyle: "h-[35%] rounded-[1.7vw] border-b-2 mb-2",
            phoneOpen: true,
            textShadow: "text-shadow: rgba(0, 0, 0, 0.563) 1px 0 10px;",
            availableApps: [
                { name: "My Cars", img: "https://i.imgur.com/d9Upqff.png" },
                { name: "Rob App", img: "https://i.imgur.com/XqotRh0.png" },
            ]
        }
    },
    methods: {
        openPhone() {
            let targetStyle = "h-[35%] rounded-[1.7vw] border-b-2 mb-2";
            this.topPhoneStyle === targetStyle ? this.topPhoneStyle = "" : this.topPhoneStyle = targetStyle;
            this.phoneOpen = !this.phoneOpen;
        }
    }
}
</script>