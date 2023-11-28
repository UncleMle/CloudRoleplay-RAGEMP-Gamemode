<template>
    <div id="app">
        
        <router-view class="absolute" ref="routers">

        </router-view>



        <ChatBox v-if="guiState" />
        <PlayerHud v-if="guiState" />
        <PushNotification class="bg-red-200" ref="notification" />
    </div>
</template>

<script>
    import ChatBox from "./components/ui/ChatBox.vue";
    import PlayerHud from "./components/hud/PlayerHud.vue"
    import PushNotification from "./components/ui/PushNotification.vue";
    import { mapGetters } from "vuex";

export default {
        name: 'App',
        components: {
            ChatBox,
            PlayerHud,
            PushNotification
        },
        computed: {
            ...mapGetters({
                guiState: 'getGuiStatus'
            })
        },
        mounted() {
            global.gui.notify = this.$refs.notification;
        }
}

</script>

<style>
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