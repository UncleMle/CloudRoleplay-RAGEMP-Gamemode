<template>
    <div id="app">
        <ChatBox class="absolute" ref="chatsys" />

        <Transition name="fade">

            <div ref="guisystems" v-if="uiStates.guiEnabled">
                <VehicleSpeedo />
                <PlayerHud />
                <InventoryHud v-if="uiStates.inventory" />
                <PlayerPhone class="absolute" />
                <DispatchMenu v-if="uiStates.dispatchMenuState" />
            </div>
        </Transition>

        <RefuelMeter class="absolute" v-if="uiStates.refuelUi" />
        <PushNotification class="bg-red-200" ref="notification" />

        <Transition name="fade">
            <router-view class="absolute" ref="routers">
            </router-view>
        </Transition>
    </div>
</template>

<script>
import ChatBox from "./components/ui/ChatBox.vue";
import InventoryHud from "./components/hud/InventoryHud.vue";
import PushNotification from "./components/ui/PushNotification.vue";
import PlayerHud from "./components/hud/PlayerHud.vue";
import VehicleSpeedo from "./components/hud/VehicleSpeedo.vue";
import RefuelMeter from "./components/ui/RefuelMeter.vue";
import PlayerPhone from './components/phone/PlayerPhone.vue';
import DispatchMenu from "./components/factionSystem/DispatchMenu.vue";
import { mapGetters } from "vuex";

export default {
    name: 'App',
    components: {
        ChatBox,
        PushNotification,
        VehicleSpeedo,
        PlayerHud,
        InventoryHud,
        RefuelMeter,
        PlayerPhone,
        DispatchMenu
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
            uiStates: 'getUiStates',
            serverData: 'getPlayerCharacters'
        })
    },
    mounted() {
        global.gui.chat = this.$refs.chatsys;
        global.gui.notify = this.$refs.notification;
    }
}

</script>

<style>
@tailwind base;
@tailwind components;
@tailwind utilities;

.pmrp {
    background: rgba(0, 0, 0, 0.6)
}

.pmrperror {
    background: rgba(255, 0, 0, 0.6);
}

.slide-fade-enter-active {
    transition: opacity 0.55s;
}

.slide-fade-enter,
.slide-fade-leave-active {
    opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
    transition: opacity .3s;
}

.fade-enter,
.fade-leave-to {
    opacity: 0;
}
</style>