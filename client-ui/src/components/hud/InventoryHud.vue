<template>
    <main>
        <div class="fixed inset-0 w-full text-white text-lg">
            <div class="container flex items-center max-w-3xl mx-auto mt-52">
                <div class="flex justify-center w-full">
                    <div
                        class="rounded-xl text-white w-full bg-black/70 shadow-2xl shadow-black border-gray-500 select-none">

                        <div class="p-7">

                            <div id="dragparent" class="grid grid-cols-6 gap-4 w-full">
                                <div id="test" class="border border-gray-500 rounded-lg" v-for="element in 12"
                                    :key="element.id">
                                    <div v-if="inventoryItems[element - 1]">
                                        <div class="flex justify-center text-center">
                                            <img :src="getItemImg(inventoryItems[element - 1].name)" class="scale-75" />
                                        </div>
                                        <div class="flex justify-center text-center text-gray-400 font-medium">
                                            {{ inventoryItems[element - 1].dispName }}
                                        </div>
                                    </div>
                                    <div v-else id="dontdrag" class="w-32 h-32">
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
        }
    },
    mounted() {
        dragular([document.querySelector("#dragparent")], {
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