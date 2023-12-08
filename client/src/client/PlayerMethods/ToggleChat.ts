const toggleChat = (toggle: boolean) => {
	if (mp.players.local.browserInstance) {
		let playerBrowser: BrowserMp = mp.players.local.browserInstance;

		playerBrowser.execute(`appSys.commit("setUiState", {
			chatEnabled: ${toggle}
		})`);
	}
}

export default toggleChat;
