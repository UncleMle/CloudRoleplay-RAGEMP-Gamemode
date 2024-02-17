<script setup lang="ts">
import { sendToClient } from '../mpHelpers';

const handleMounted = () => {
  sendToClient("client:addNotif", "test", true, true, "test");
};

</script>

<template>
  <div>
    MainView

    <button @click="handleMounted">
      Create Timer
    </button>
  </div>
</template>