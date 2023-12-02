import Vue from 'vue';
import Vuex from 'vuex';

/* eslint-disable */

Vue.use(Vuex);

const store = new Vuex.Store({
	state: {
		playerInfo: {
			player_stats: {},
			player_data_server: {},
			player_data_gui: {},
			player_bandata: {},
			player_characters: [],
			otp_ui: false
		},
		uiStates: {
			characterSelection: false,
			chatEnabled: false,
			guiEnabled: true,
			serverLoading: false
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
		},
		getGuiData: (state) => {
			return state.playerInfo.player_data_gui;
		},
		getGuiStatus: (state) => {
			return state.uiStates.guiEnabled;
		},
		getBanData: (state) => {
			return state.playerInfo.player_bandata;
		},
		getPlayerCharacters: (state) => {
			return state.playerInfo.player_characters;
		},
		getOtpState: (state) => {
			return state.playerInfo.otp_ui;
		},
		getLoadingState: (state) => {
			return state.uiStates.serverLoading;
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
		setUserOtp: (state, { toggle }) => {
			state.playerInfo.otp_ui = toggle;
			return;
		},
		playerMutationSetter: (state, { _mutationKey, data }) => {
			//console.log(_mutationKey, data);
			state.playerInfo[_mutationKey] = data;
		},
		playerMutationPusher: (state, { _mutationKey, data }) => {
			state.playerInfo[_mutationKey].push(data);
		},
		resetPlayerMutationPusher: (state, { _mutationKey }) => {
			state.playerInfo[_mutationKey] = [];
		},
		setGuiState: (state, { toggle }) => {
			state.uiStates.guiEnabled = toggle;
		},
		setLoadingState: (state, { toggle }) => {
			state.uiStates.serverLoading = toggle;
		}
	}
});
export default store;