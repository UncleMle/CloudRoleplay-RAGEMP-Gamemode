<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center mx-auto mt-52">

                <div class="w-full">
                    <div class="flex justify-center w-full">
                        <div
                            class="rounded-xl text-white w-[50%] bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                            <div class="p-3">
                                <div class="p-1 text-xl pb-4 font-medium">
                                    <h2>Inventory Items ({{ inventoryItems.length }} KG) {{playerData.inventory_items}}</h2>
                                </div>

                                <div id="inventory" class="grid grid-cols-6">
                                    <div v-for="i in 24" :key="i" class="p-0.5">
                                        <div v-if="inventoryItems[i]" class="w-32 h-fit text-center border border-gray-500 font-medium text-gray-300">
                                            <div>
                                                <img :src="getItemImg(inventoryItems[i].name)" class="scale-75"/>
                                                <p class="bg-black/20 w-full">{{ inventoryItems[i].dispName }}</p>
                                            </div>
                                        </div>
                                        <div v-else class="w-32 h-32 border p-3">
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
    methods: {
        getItemImg(itemName) {
            try {
                const imageModule = require(`../../assets/img/inventory/${itemName}.png`);
                return imageModule;
            } catch (error) {
                return require("../../assets/img/cars/sentinel.png");
            }
        },
        startContextMenu(e) {
            console.log(e);
        }
    },
    created() {
        document.addEventListener("contextmenu", this.startContextMenu);
    },
    mounted() {
        dragular([document.getElementById("clothing"), document.getElementById("inventory")]);

    }
}
</script>