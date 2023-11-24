<template>
    <div id="app" class="overflow-y-scroll no-scrollbar">
        <router-view class="absolute" ref="routers">
        </router-view>
        <ChatBox />
    </div>
</template>

<script>
    import ChatBox from "./components/ui/ChatBox.vue";

export default {
        name: 'App',
        components: {
            ChatBox
        }
}

</script>
