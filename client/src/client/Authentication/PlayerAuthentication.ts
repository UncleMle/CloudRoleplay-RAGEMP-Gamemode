class PlayerAuthentication {
	constructor() {
		mp.events.add("playerReady", () => {

			mp.gui.chat.push("Using player authentication class " + mp.players.local.name + " handle: " + mp.players.local.handle);

		})

		mp.events.add("client:sendAuthInfo", (username: string, password: string) => {
			mp.events.callRemote("server:recieveAuthInfo", username, password);
		})
	}
}

export default PlayerAuthentication;
