<template>
    <div id="app">
        <div class="absolute text-red-500 font-medium">
            {{ uiStates }} {{ serverData }} | Cloud RP V 1.2
        </div>
        <ChatBox class="absolute" v-if="guiState" />
        <PushNotification class="bg-red-200" ref="notification" />
        <VehicleSpeedo />
        <PlayerHud class="relative" />

        <router-view class="absolute" ref="routers">
        </router-view>
    </div>
</template>

<script>
import ChatBox from "./components/ui/ChatBox.vue";
import PushNotification from "./components/ui/PushNotification.vue";
import VehicleSpeedo from "./components/hud/VehicleSpeedo.vue";
import { mapGetters } from "vuex";

export default {
        name: 'App',
        components: {
            ChatBox,
            PushNotification,
            VehicleSpeedo,
        },
        computed: {
            ...mapGetters({
                guiState: 'getGuiStatus',
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