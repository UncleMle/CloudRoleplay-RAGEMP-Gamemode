import Vue from 'vue';
import Vuex from 'vuex';

/* eslint-disable */

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		uiStates: {
			characterSelection: false,
			chatEnabled: false
		}
	},
	getters: {
		getChatStatus: (state, getters) => {
			return state.uiStates.chatEnabled;
		},
		getCharacterSelectionStatus: (state, getters) => {
			return state.uiStates.characterSelection;
		}
	},
	mutations: {
		setChatStatus: (state, { toggle }) => {
			state.uiStates.chatEnabled = toggle;
			return;
		},
		setCharacterSelection: (state, { toggle }) => {
			state.uiStates.characterSelection = toggle;
			return;
		}
	}
});
export default store;