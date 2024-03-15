<template>
  <div class="notifications">
  </div>
</template>

<script>
import Vue from "vue";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";
Vue.use(Toast, {
  transition: "Vue-Toastification__bounce",
  maxToasts: 5,
  newestOnTop: true,
});

export default {
  methods: {
    showNotification(text, progbar, dragbl, timeout, iconpic) {
      text = text.replace(/~r~/g, "<font color=red>");
      text = text.replace(/~g~/g, "<font color=green>");
      text = text.replace(/~b~/g, "<font color=blue>");
      text = text.replace(/~w~/g, "<font color=white>");
      text = text.replace(/~y~/g, "<font color=yellow>");
      text = text.replace(/~n~/g, "</br>");
      this.$toast(text, {
        toastClassName: ["crp"],
        position: "top-center",
        timeout: timeout,
        icon: iconpic,
        content: text
      });


      window.mp.trigger("browser:playerFrontendSound", "5_SEC_WARNING", "HUD_MINI_GAME_SOUNDSET");
    },
    clearAll() {
      this.$toast.clear()
    },
    sendError(msg, time) {
      this.$toast.error(msg, {
        toastClassName: ["crperror"],
        position: "bottom-center",
        timeout: time,
      });
    },
    success(msg, time) {
      this.$toast.success(msg, {
        position: "bottom-center",
        timeout: time,
        icon: "fa-solid fa-square-check"
      });
    },
  }
}
</script>

<style>
.Vue-Toastification__progress-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  height: 5px;
  z-index: 10000;
  background-image: linear-gradient(to right, rgb(33, 33, 33), rgb(75, 75, 75));
  transform-origin: left;
  animation: scale-x-frames linear 1 forwards;
}
</style>