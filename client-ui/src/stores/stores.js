import Vuex from 'vuex';

/* eslint-disable */


const store = new Vuex.Store({
	state: {
		playerInfo: {
			characters: [],
			notifications: [],
			creds: [],
			chatEnabled: false
		}
	},
	getters: {
		getChatStatus: (state, getters) => {
			return state.playerInfo.chatEnabled;
		}
	},
	mutations: {
		setChatStatus: (state, {toggle}) => {
			state.playerInfo.chatEnabled = toggle;
			return;
		}
	}
});

export default store;