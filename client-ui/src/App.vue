<template>
  <main>
    <router-view />
    <ChatBox/>
  </main>
</template>

<script>
import ChatBox from './components/ui/ChatBox.vue';

export default {
  name: 'App',
  components: {
      ChatBox
  }
}
</script>

