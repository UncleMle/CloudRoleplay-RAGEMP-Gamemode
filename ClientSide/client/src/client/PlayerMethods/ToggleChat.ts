const toggleChat = (toggle: boolean) => {
	if (mp.players.local.browserInstance) {
		let playerBrowser: BrowserMp = mp.players.local.browserInstance;

		playerBrowser.execute(`appSys.commit("setUiState", {
			_stateKey: "chatEnabled",
			status: ${toggle}
		})`);
	}
}

export default toggleChat;
