import Vue from 'vue'
import App from './App.vue'
import router from './router'

import store from './stores/store'
import { mapMutations, mapActions } from 'vuex';

Vue.config.productionTip = false;

global.gui = { notify: null, chat: null, loading: null, progressbar: null, fuelscreen: null, phone: null, altmenu: null };

const app = new Vue({
  router,
  store,
  render: h => h(App),
  methods: {
		...mapMutations([
		]),

		...mapActions([
		]),
	},
}).$mount('#app')

global.chat = app.$chat
global.appSys = app.$store;
global.router = app.$router;

