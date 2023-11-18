class PlayerWelcome {
	constructor() {
		mp.events.add('playerReady', (): void => {
			let playerName: string = mp.players.local.name;

			mp.gui.chat.push("Welcome to the Cloud RP " + playerName);
		});
	}
}

export default PlayerWelcome;
