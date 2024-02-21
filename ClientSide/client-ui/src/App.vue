<template>
    <div id="app">
        <ChatBox class="absolute" ref="chatsys" />

        <Transition name="fade" v-if="uiStates.guiEnabled">
            <div ref="guisystems" v-if="uiStates.guiEnabled">
                <VehicleSpeedo />
                <PlayerHud />
                <InventoryHud class="absolute" v-if="uiStates.inventory" />
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

.crp {
    background: rgba(0, 0, 0, 0.6)
}

.crperror {
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

.vignette {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    box-shadow: 0 0 200px rgba(0, 0, 0, 0.9) inset;
}

.colourBackground {
    background: linear-gradient(130deg, rgba(1, 1, 1, 0.6), rgba(1, 1, 1, 0.84), rgba(1, 1, 1, 0.6));
    background-size: 200% 200%;

    -webkit-animation: Animation 4s ease infinite;
    -moz-animation: Animation 5s ease infinite;
    animation: Animation 5s ease infinite;
}

@-webkit-keyframes Animation {
    0% {
        background-position: 10% 0%
    }

    50% {
        background-position: 91% 100%
    }

    100% {
        background-position: 10% 0%
    }
}

@-moz-keyframes Animation {
    0% {
        background-position: 10% 0%
    }

    50% {
        background-position: 91% 100%
    }

    100% {
        background-position: 10% 0%
    }
}

@keyframes Animation {
    0% {
        background-position: 10% 0%
    }

    50% {
        background-position: 91% 100%
    }

    100% {
        background-position: 10% 0%
    }
}</style>