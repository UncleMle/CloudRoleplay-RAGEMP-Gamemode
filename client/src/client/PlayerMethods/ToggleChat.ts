const _chatMutationName: string = "setChatStatus";
const _chatMutationKey: string = "toggle";

const toggleChat = (toggle: boolean) => {
	if (mp.players.local.browserInstance) {
		let playerBrowser: BrowserMp = mp.players.local.browserInstance;

		playerBrowser.execute(`appSys.commit("${_chatMutationName}", {
			${_chatMutationKey}: ${toggle}
		})`);
		
	}
}

export default toggleChat;
