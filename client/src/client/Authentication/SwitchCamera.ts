import { _SWITCH_OUT_PLAYER_NATIVE, _SWITCH_IN_PLAYER_NATIVE, _IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE } from 'Constants/Constants';
import setGuiState from 'PlayerMethods/setGuiState'
import toggleChat from 'PlayerMethods/ToggleChat'

class SwitchCamera {
	public static LocalPlayer: PlayerMp;
	public static WelcomeEvent: string = "server:welcomePlayerOnSpawn";

	constructor() {
		SwitchCamera.LocalPlayer = mp.players.local;

		mp.events.add("client:moveSkyCamera", SwitchCamera.moveCameraFromAir);
	}

	public static moveCameraFromAir(moveTo: string, switchType: number) {
		switch (moveTo) {
			case 'up':
				mp.game.invoke(_SWITCH_OUT_PLAYER_NATIVE, SwitchCamera.LocalPlayer.handle, 0, switchType);
				break;
			case 'down':
				SwitchCamera.checkCamInAir();
				mp.game.invoke(_SWITCH_IN_PLAYER_NATIVE, SwitchCamera.LocalPlayer.handle);
				break;
			default:
				break;
		}
	}

	public static checkCamInAir() {
		if (mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE)) {

			mp.game.ui.displayRadar(false);
			setGuiState(false);
			toggleChat(false);

			setTimeout(() => {
				SwitchCamera.checkCamInAir();
			}, 40);

		} else {
			mp.game.ui.displayRadar(true);
			setGuiState(true);
			toggleChat(true);

			mp.events.callRemote(SwitchCamera.WelcomeEvent);
		}
	}
}

export default SwitchCamera;
