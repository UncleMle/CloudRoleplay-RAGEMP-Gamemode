<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center mx-auto mt-52">

                <div class="w-full grid grid-cols-2 mt-60">
                    <div class="flex justify-center w-full">
                        <div
                            class="rounded-xl text-white w-[65%] bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                            <div class="p-3">
                                <div class="p-1 text-xl pb-4 font-medium">
                                    <h2>Clothing</h2>
                                </div>

                                <div id="clothing" class="grid grid-cols-3">
                                    <div v-for="(element, i) in clothingItems" :key="i">
                                        <div class="flex justify-center text-center border mr-4 p-3 border-gray-500">
                                            <img :src="getItemImg(element.name)" class="scale-25 w-20" />
                                        </div>
                                        <div class="flex justify-center text-center text-gray-400 font-medium">
                                            {{ element.dispName }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="flex justify-center w-full">
                        <div
                            class="rounded-xl text-white w-[90%] bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                            <div class="p-3">
                                <div class="p-1 text-xl pb-4 font-medium">
                                    <h2>Inventory Items ({{ inventoryItems.length }} KG)</h2>
                                </div>

                                <div id="inventory" class="grid grid-cols-3">
                                    <div v-for="(element, i) in inventoryItems" :key="i">
                                        <div class="flex justify-center text-center border mr-4 p-3 border-gray-500">
                                            <img :src="getItemImg(element.name)" class="scale-25 w-20" />
                                        </div>
                                        <div class="flex justify-center text-center text-gray-400 font-medium">
                                            {{ element.dispName }}
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

export default {
    /* eslint-disable */
    data() {
        return {
            inventoryItems: [
                {
                    dispName: "Ak-47",
                    name: "assaultrifle",
                    id: 2,
                },
                {
                    dispName: "Pistol .50",
                    name: "pistol50",
                    id: 3
                }, {
                    dispName: "Pistol .50",
                    name: "pistol50",
                    id: 3
                }, {
                    dispName: "Pistol .50",
                    name: "pistol50",
                    id: 3
                }
            ],
            clothingItems: [
                {
                    dispName: "Pistol .50",
                    name: "pistol50",
                    id: 3
                }
            ]
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
        dragular([document.getElementById("clothing"), document.getElementById("inventory")]);

    }
}
</script>