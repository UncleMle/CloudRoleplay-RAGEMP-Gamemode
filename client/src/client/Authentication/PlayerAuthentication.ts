import Camera from "../CameraSystem/Camera";

class PlayerAuthentication {
	public LoginCamera: Camera;


	constructor() {
		this.LoginCamera = new Camera('loginCam', new mp.Vector3(-79.9, -1079.5, 310.2), new mp.Vector3(-74.8, -819.2, 326.2));

		mp.events.add({
			"playerReady": () => {
				mp.events.call("client:loginStart");
			},
			"client:loginStart": () => {
				mp.events.call("browser:pushRouter", "login");
				this.LoginCamera.startMoving(7100.0);
				this.LoginCamera.setActive();

				this.freezeAndBlurClient();

			},
			"client:loginEnd": () => {
				mp.events.call("browser:pushRouter", "/");
			}
		})
	}

	freezeAndBlurClient() {
		mp.game.ui.displayRadar(false);
		mp.gui.cursor.show(true, true);
		mp.players.local.position = new mp.Vector3(-811.6, 174.9, 76.8);
		mp.players.local.freezePosition(true);
		mp.players.local.setAlpha(0);
		mp.game.cam.renderScriptCams(true, false, 0, true, false);
		mp.game.graphics.transitionToBlurred(100);
		mp.players.local.freezePosition(true);
		mp.players.local.setAlpha(0);
	}
}

export default PlayerAuthentication;
