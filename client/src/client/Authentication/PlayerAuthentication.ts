class playerAuthentication {
	constructor() {
		mp.events.add("playerReady", () => {

			mp.gui.chat.push("Using player authentication class " + mp.players.local.name + " handle: " + mp.players.local.handle);

		})
	}
}

export default playerAuthentication;
