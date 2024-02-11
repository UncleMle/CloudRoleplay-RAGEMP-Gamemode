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
			vehicle_mod_data: [],
			vehicle_mod_data_old: {},
			vehicle_mod_indexes: [],
			player_bandata: {},
			player_characters: [],
			player_account_info: {},
			player_bus_job_routes: [],
			report_data: [],
			clothing_data: [],
			clothing_data_old: [],
			otp_ui: false,
			player_water: 0,
			player_hunger: 0,
			parked_vehicles: [],
			vehicle_dealer_data: {},
			tattoo_store_data: [],
			player_current_tats: [],
			vehicle_performance_data: [],
			vehicle_refuel_data: {},
			insurance_vehicle_data: [],
			uninsured_vehicle_data: [],
			atm_data: {},
			phone_data_player_vehicles: [],
			inventory_items: [],
			is_in_player_dealer: false,
			trucker_jobs: [],
			postal_jobs: [],
			gruppe_six_jobs: [],
			dmv_courses: [],
			faction_uniforms: [],
			barber_data: {},
			dcc_data: {},
			faction_dispatch_calls: [],
			player_prompt_data: {},
			in_mask_store: false
		},
		uiStates: {
			characterSelection: false,
			authenticationState: "",
			chatEnabled: true,
			guiEnabled: false,
			vehicleRadar: false,
			serverLoading: false,
			speedoUi: false,
			refuelUi: false,
			vehicleSpeedoData: {},
			vehicleRadarData: {},
			vehRadarLastTracked: false,
			dispatchMenuState: false,
			renderKeys: {},
			phoneState: false,
			inventory: false
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
		},
		getUiStates: (state) => {
			return state.uiStates;
		},
		getPlayerInfo: (state) => {
			return state.playerInfo;
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
		},
		setUiState: (state, { _stateKey, status }) => {
			state.uiStates[_stateKey] = status;
		}
	}
});
export default store;