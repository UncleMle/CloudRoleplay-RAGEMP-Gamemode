import Vue from 'vue';
import Vuex from 'vuex';

/* eslint-disable */

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		playerInfo: {
			player_stats: {},
			player_data_server: {}
		},
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
		},
		getPlayerStats: (state) => {
			return state.playerInfo.player_stats;
		},
		getPlayerDataServer: (state) => {
			return state.playerInfo.player_data_server;
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
		},
		playerMutationSetter: (state, { _mutationKey, data }) => {
			state.playerInfo[_mutationKey] = data;
		}
	}
});
export default store;