import BrowserSystem from '@/BrowserSystem/BrowserSystem';
import toggleChat from '@/PlayerMethods/ToggleChat';
import { _SWITCH_OUT_PLAYER_NATIVE, _SWITCH_IN_PLAYER_NATIVE, _IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE } from 'Constants/Constants';

class SwitchCamera {
	public static LocalPlayer: PlayerMp;

	constructor() {
		SwitchCamera.LocalPlayer = mp.players.local;

		mp.events.add("client:moveSkyCamera", SwitchCamera.moveCameraFromAir);
	}

	public static async moveCameraFromAir(moveTo: string, switchType: number) {
		mp.gui.cursor.show(false, false);
		mp.game.cam.doScreenFadeOut(0);
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

		await mp.game.waitAsync(2500);

		mp.game.cam.doScreenFadeIn(500);
	}

	public static async checkCamInAir() {
		if (mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE)) {

			mp.game.ui.displayRadar(false);
			SwitchCamera.toggleGui(false);
			toggleChat(false);

			await mp.game.waitAsync(40);
			SwitchCamera.checkCamInAir();
		} else {
			mp.game.ui.displayRadar(true);
			toggleChat(true);
			SwitchCamera.toggleGui(true);
		}
	}

	public static toggleGui(tog: boolean) {
		if(!BrowserSystem._browserInstance) return;
		BrowserSystem._browserInstance.execute(`appSys.commit("setGuiState", {
			toggle: ${tog}
		})`);
	}
}

export default SwitchCamera;
