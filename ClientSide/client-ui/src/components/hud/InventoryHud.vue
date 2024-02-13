<template>
    <main class="absolute bg-black/50 w-full h-full">

        <div class="absolute mt-[19%] ml-[10%]">

            <div class="grid grid-cols-4 w-full">

                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>
                <div :class="cellStyle"></div>


            </div>
        </div>

        <div class="flex justify-center mt-[20%]">

            <div class="grid grid-cols-7 full" id="player-inventory">

                <div class="baseCell" :class="cellStyle">
                    <p class="subtext">Pistol .50</p>
                </div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>
                <div class="cell" :class="cellStyle"></div>


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
            cellStyle: "border w-[90px] h-[90px] border-gray-400",
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
        dragular([document.getElementById("player-inventory"), document.getElementsByClassName("baseCell")], {
            moves: (el) => {
                return el.className !== "cell";
            }
        })
            .on('drag', (el) => {

                if (el.className == "cell") return true;

                console.log(el.cellid + " cellid");

                el.className = el.className.replace('ex-moved', '');

                return false;
            }).on('drop', (el) => {
                el.className += ' ex-moved';

                return false;
            }).on('over', (el, container) => {


                container.className += ' ex-over';
                return false
            }).on('out', (el, container) => {
                container.className = container.className.replace('ex-over', '');
                return false;

            });
    }
}
</script>

<style>
.baseCell {
    background-image: url("../../assets/img/inventory/pistol50.png");
    background-size: 50px 50px;
    background-repeat: no-repeat;
    background-position: center 10px;
    text-align: center;
    position: relative;
}

.subtext {
    position: absolute;
    background-color: rgba(0, 0, 0, 0.451);
    bottom: 0;
    color: white;
    min-width: 89px;
    font-weight: 500;
}
</style>