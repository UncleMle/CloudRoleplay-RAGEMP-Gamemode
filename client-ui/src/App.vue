<template>
    <router-view />
    <chatBox/>
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

