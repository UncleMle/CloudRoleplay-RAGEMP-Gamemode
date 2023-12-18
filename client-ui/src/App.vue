<template>
    <div id="app">
        <ChatBox class="absolute" />
        <InventoryHud v-if="false"/>
        <PlayerPhone class="absolute" v-if="uiStates.guiEnabled" />
        <RefuelMeter class="absolute" v-if="uiStates.refuelUi" />
        <PushNotification class="bg-red-200" ref="notification" />
        <VehicleSpeedo v-if="uiStates.guiEnabled" />
        <PlayerHud v-if="uiStates.guiEnabled" />
        <router-view class="absolute" ref="routers">
        </router-view>
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
        PlayerPhone
    },
    computed: {
        ...mapGetters({
            playerData: 'getPlayerInfo',
            uiStates: 'getUiStates',
            serverData: 'getPlayerCharacters'
        })
    },
    mounted() {
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
    transition: all 0.4s ease-out;
}

.slide-fade-leave-active {
    transition: all 0.4s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
    transform: translateY(10020px);
    opacity: 0;
}
</style>