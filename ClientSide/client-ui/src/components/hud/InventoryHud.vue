<template>
    <main>

        <div class="inv-whole">
            <div class="p-1 text-xl pb-4 font-medium">
                <h2>Inventory Items ({{ playerData.inventory_items.length }} KG)</h2>
            </div>

            <div class="inventory" id="inventory-main">

                <div class="cell item" cellid="2">item</div>
                <div class="cell" cellid="2"></div>
                <div class="cell" cellid="2"></div>
                <div class="cell" cellid="2"></div>
                <div class="cell" cellid="2"></div>
                <div class="cell" cellid="2"></div>
                <div class="cell" cellid="2"></div>
                <div class="cell" cellid="2"></div>
                <div class="cell" cellid="2"></div>
                <div class="cell" cellid="2"></div>
                <div class="cell" cellid="2"></div>
                <div class="cell" cellid="2"></div>
                <div class="cell" cellid="2"></div>
                <div class="cell" cellid="2"></div>
                <div class="cell" cellid="2"></div>
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
        dragular([document.getElementById("inventory-main"), document.getElementById("item")], {
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

<style></style>