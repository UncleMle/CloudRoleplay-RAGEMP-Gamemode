import { _SWITCH_OUT_PLAYER_NATIVE, _SWITCH_IN_PLAYER_NATIVE, _IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE } from 'Constants/Constants';

class SwitchCamera {
	public static LocalPlayer: PlayerMp;


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
				mp.game.invoke(_SWITCH_IN_PLAYER_NATIVE, SwitchCamera.LocalPlayer.handle);
				break;
			default:
				break;
		}
	}
}

export default SwitchCamera;
