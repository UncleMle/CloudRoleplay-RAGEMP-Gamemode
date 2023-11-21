import Camera from "../CameraSystem/Camera";
import toggleChat from "../PlayerMethods/ToggleChat";

class PlayerAuthentication {
	public static LoginCamera: Camera;


	constructor() {
		PlayerAuthentication.LoginCamera = new Camera('loginCam', new mp.Vector3(-79.9, -1079.5, 310.2), new mp.Vector3(-74.8, -819.2, 326.2));

		mp.events.add("playerReady", PlayerAuthentication.handlePlayerReady);
		mp.events.add("client:loginStart", PlayerAuthentication.handleLoginStart);
		mp.events.add("client:loginEnd", PlayerAuthentication.endClientLogin);
	}

	public static handleLoginStart() {
		mp.events.call("browser:pushRouter", "login");
	    PlayerAuthentication.LoginCamera.startMoving(7100.0);
		PlayerAuthentication.LoginCamera.setActive();
		PlayerAuthentication.freezeAndBlurClient();
	}

	public static handlePlayerReady() {
		mp.events.call("client:loginStart");
	}

	public static freezeAndBlurClient() {
		mp.game.ui.displayRadar(false);
		mp.gui.cursor.show(true, true);
		mp.players.local.position = new mp.Vector3(-811.6, 174.9, 76.8);
		mp.players.local.freezePosition(true);
		mp.players.local.setAlpha(0);
		mp.game.cam.renderScriptCams(true, false, 0, true, false);
		mp.game.graphics.transitionToBlurred(100);
		mp.players.local.freezePosition(true);
	}

	public static endClientLogin() {
		mp.events.call("browser:pushRouter", "/");
		mp.game.ui.displayRadar(true);
		mp.players.local.setAlpha(255);
		mp.game.graphics.transitionFromBlurred(100);
		mp.players.local.freezePosition(false);
		PlayerAuthentication.LoginCamera.delete();
		toggleChat(true);
	}
}

export default PlayerAuthentication;
