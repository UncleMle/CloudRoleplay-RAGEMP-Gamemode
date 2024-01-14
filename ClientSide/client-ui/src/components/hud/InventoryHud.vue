<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center mx-auto mt-52">

                <div class="w-full">
                    <div class="flex justify-center w-full">
                        <div
                            class="rounded-xl text-white w-[50%] bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                            <div>
                                <div class="p-1 text-xl pb-4 font-medium">
                                    <h2>Inventory Items ({{ playerData.inventory_items.length }} KG)</h2>
                                </div>

                                <div class="grid grid-cols-6 w-full">
                                    <div v-for="i in 24" :key="i" class="border h-32 w-full">
                                        <div :id="'invenItem'+i" v-if="playerData.inventory_items[i - 1]" class="h-full w-full relative">

                                            <img :src="getItemImg(playerData.inventory_items[i - 1].name)" class="scale-[55%] absolute bottom-2" />

                                            <div class="absolute bottom-0 bg-black/70 w-full">
                                                <p class="text-center max-h-7 max-w-xs overflow-hidden text-ellipsis whitespace-nowrap font-medium text-gray-300">
                                                    {{ playerData.inventory_items[i - 1].displayName }}
                                                </p>
                                            </div>
                                        </div>
                                        <div v-else :id="'invenContainer'+i" class="bg-red-300 h-full">
                                            None
                                        </div>
                                    </div>
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
import dragular from 'dragula';
import { mapGetters } from 'vuex';

export default {
    /* eslint-disable */
    data() {
        return {
            contextMenuState: false,
            inventoryItems: [
            ],
            clothingItems: [
            ]
        }
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo'
        })
    },
    watch: {
        playerData() {
            this.inventoryItems = this.playerData.inventory_items;
        }
    },
    methods: {
        getItemImg(itemName) {
            try {
                const imageModule = require(`../../assets/img/inventory/${itemName}.png`);
                return imageModule;
            } catch (error) {
                return require("../../assets/img/cars/sentinel.png");
            }
        },
        handler(e) {
            console.log("Triggered");
        },
        startContextMenu(e) {
            console.log(e);
        }
    },
    created() {
        document.addEventListener("contextmenu", this.startContextMenu);
    },
    mounted() {

        for(let i = 0; i < 24; i++) {
            dragular([document.getElementById(`invenItem${i}`), document.getElementById(`invenContainer${i}`)]);
        }
    }
}
</script>