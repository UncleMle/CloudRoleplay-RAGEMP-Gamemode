import Camera from "../CameraSystem/Camera";
import toggleChat from "../PlayerMethods/ToggleChat";
import getUserCharacterData from "../PlayerMethods/getUserCharacterData";
import BrowserSystem from "../BrowserSystem/BrowserSystem";

class PlayerAuthentication {
	public static LoginCamera: Camera;
	public static LocalPlayer: PlayerMp


	constructor() {
		PlayerAuthentication.LoginCamera = new Camera('loginCam', new mp.Vector3(-79.9, -1079.5, 310.2), new mp.Vector3(-74.8, -819.2, 326.2));
		PlayerAuthentication.LocalPlayer = mp.players.local;

		mp.events.add("render", PlayerAuthentication.handleUnauthed);
		mp.events.add("playerReady", PlayerAuthentication.handleLoginStart);
		mp.events.add("client:loginStart", PlayerAuthentication.handleLoginStart);
		mp.events.add("client:loginEnd", PlayerAuthentication.endClientLogin);
	}

	public static handleUnauthed() {
		if (!getUserCharacterData()) {
			PlayerAuthentication.LocalPlayer.freezePosition(true);
		}
	}

	public static handleLoginStart() {
		BrowserSystem.handleBrowserPush("login");
		PlayerAuthentication.LoginCamera.startMoving(7100.0);
		PlayerAuthentication.LoginCamera.setActive();
		PlayerAuthentication.freezeAndBlurClient();
	}

	public static freezeAndBlurClient() {
		mp.game.ui.displayRadar(false);
		mp.gui.cursor.show(true, true);
		PlayerAuthentication.LocalPlayer.position = new mp.Vector3(-811.6, 174.9, 76.8);
		PlayerAuthentication.LocalPlayer.freezePosition(true);
		PlayerAuthentication.LocalPlayer.setAlpha(0);
		mp.game.cam.renderScriptCams(true, false, 0, true, false);
		mp.game.graphics.transitionToBlurred(100);
		PlayerAuthentication.LocalPlayer.freezePosition(true);
	}

	public static endClientLogin() {
		mp.console.logInfo("" + JSON.stringify(getUserCharacterData()));

		mp.events.call("browser:pushRouter", "/");
		mp.game.ui.displayRadar(true);
		PlayerAuthentication.LocalPlayer.setAlpha(255);
		mp.game.graphics.transitionFromBlurred(100);
		mp.gui.cursor.show(false, false);
		PlayerAuthentication.LocalPlayer.freezePosition(false);
		toggleChat(true);


		if (PlayerAuthentication.LoginCamera) {
			PlayerAuthentication.LoginCamera.delete();
		}
	}
}

export default PlayerAuthentication;
