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

                                <div id="inventory" class="grid grid-cols-4 mr-20 ml-20 pb-6">
                                    <div v-for="i in 24" :key="i" class="border border-gray-500">
                                        <div id="item" v-if="playerData.inventory_items[i - 1]"
                                            class="max-h-20 max-w-20 text-center font-medium text-gray-300">
                                            <div>
                                                <img :src="getItemImg(playerData.inventory_items[i - 1].name)"
                                                    class="w-full h-20 scale-[65%] text-center" />
                                                <p class="bg-black/40">{{ playerData.inventory_items[i - 1].displayName }}
                                                </p>
                                            </div>
                                        </div>
                                        <div id="dontdrag" v-else class="p-3 w-12 h-28">
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
        startContextMenu(e) {
            console.log(e);
        }
    },
    created() {
        document.addEventListener("contextmenu", this.startContextMenu);
    },
    mounted() {

        dragular([document.getElementById("inventory"), document.getElementById("dontdrag")], {
            moves: function (el, container, handle) {
                if (handle.id == "dontdrag") {
                    console.log("Cant drag");
                } else {
                    return true;
                }
            },
            accepts: function () {
                console.log("has been accepted.");
                return true;
            },
        }).on("drag", () => {
            console.log("being dragged");
        });
    }
}
</script>