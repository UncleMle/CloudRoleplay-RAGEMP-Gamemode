import BrowserSystem from 'BrowserSystem/BrowserSystem';


const setUiStateChange = (stateName: string, toggle: boolean) => {
	if (BrowserSystem._browserInstance) {
		let LocalPlayer: PlayerMp = mp.players.local;

		if (LocalPlayer.browserCurrentState == stateName && toggle) {
			return;	
		}

		if (toggle) {
			LocalPlayer.browserCurrentState = stateName;
		}

		BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
			_uiState: "${stateName}",
			toggle: ${toggle}
		})`);
	}
}

export default setUiStateChange;
