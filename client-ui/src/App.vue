<template>
  <div id="app">
    <router-view ref="routers">
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
