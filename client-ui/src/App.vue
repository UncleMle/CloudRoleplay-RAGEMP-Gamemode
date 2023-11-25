<template>
    <div id="app" class="overflow-y-scroll no-scrollbar">
        <router-view class="absolute" ref="routers">
        </router-view>
        <ChatBox v-if="guiState" />
        <PlayerHud v-if="guiState" />
    </div>
</template>

<script>
    import ChatBox from "./components/ui/ChatBox.vue";
    import PlayerHud from "./components/hud/PlayerHud.vue"
    import { mapGetters } from "vuex";

export default {
        name: 'App',
        components: {
            ChatBox,
            PlayerHud
        },
        computed: {
            ...mapGetters({
                guiState: 'getGuiStatus'
            })
        }
}

</script>
