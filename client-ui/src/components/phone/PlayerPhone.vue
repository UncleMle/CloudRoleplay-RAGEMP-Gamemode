<template>
    <main class="relative duration-500">

        <div id="phone" :class="topPhoneStyle"
            class="fixed bottom-0 right-[28%] shadow-2xl shadow-black bg-black text-white font-medium w-[11%] rounded-t-[1.7vw] h-10 border-t-4 border-r-4 border-l-4 border-slate-400 bg-[url('https://i.imgur.com/X5e1fYI.png')] bg-cover bg-no-repeat">
            <div class="w-full h-full border-r-[7px] border-t-[7px] border-l-[7px] rounded-t-[1.7vw] border-black "
                :class="this.phoneOpen ? 'border-b-[7px] rounded-b-[1.7vw]' : ''">

                <button @click="openPhone" class="w-full content-normal flex justify-center h-12">
                    <div class="bg-black w-[40%] mt-1 rounded-xl relative h-6">
                        <div class="absolute right-4 h-4 bg-gray-700 w-4 top-1 rounded-full">
                        </div>
                        <div class="absolute left-4 h-4 bg-gray-800 w-4 top-1 rounded-full">
                        </div>
                    </div>
                </button>

                <div class="w-full">
                    <div class="grid grid-cols-3 gap-4 mr-2 ml-2">
                        <div v-for="app in availableApps" :key="app.name">
                            <button class="relative text-center">
                                <div class="h-20 w-20 rounded-2xl bg-cover bg-no-repeat text-center bg-red-400 border border-black/40">
                                    <img src="https://i.imgur.com/d9Upqff.png" class="scale-75"/>
                                </div>
                                <font :style="textShadow" class="text-gray-200">
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
            topPhoneStyle: "h-[35%] rounded-[1.7vw] border-b-4 mb-2",
            phoneOpen: true,
            textShadow: "text-shadow: rgba(0, 0, 0, 0.563) 1px 0 10px;",
            availableApps: [
                { name: "My Cars", img: "https://i.imgur.com/d9Upqff.png')]" },
            ]
        }
    },
    methods: {
        openPhone() {
            let targetStyle = "h-[35%] rounded-[1.7vw] border-b-4 mb-2";
            this.topPhoneStyle === targetStyle ? this.topPhoneStyle = "" : this.topPhoneStyle = targetStyle;
            this.phoneOpen = !this.phoneOpen;
        }
    }
}
</script>