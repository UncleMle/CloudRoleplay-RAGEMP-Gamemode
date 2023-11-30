import { CreationCam } from "../@types";
import BrowserSystem from "../BrowserSystem/BrowserSystem";
import Camera from "../CameraSystem/Camera";
import toggleChat from "../PlayerMethods/ToggleChat";
import getCameraOffset from "../PlayerMethods/getCameraOffset";
import getUserCharacterData from "../PlayerMethods/getUserCharacterData";
import setGuiState from "../PlayerMethods/setGuiState";
import setUiStateChange from "../PlayerMethods/setUiStateChange";

const _storage_key: string = "AutoLoginToken";

class PlayerAuthentication {
	public static LoginCamera: Camera;
	public static creationCam: Camera;
	public static LocalPlayer: PlayerMp
	public static LocalStorage: StorageMp;
	public static characterCreationPosition: Vector3 = new mp.Vector3(-38.6, -590.5, 78.8);

	constructor() {
		PlayerAuthentication.LocalPlayer = mp.players.local;
		PlayerAuthentication.LocalStorage = mp.storage;

		mp.events.add("render", PlayerAuthentication.handleUnauthed);
		mp.events.add("playerReady", PlayerAuthentication.handleLoginStart);
		mp.events.add("client:loginStart", PlayerAuthentication.handleLoginStart);
		mp.events.add("client:loginEnd", PlayerAuthentication.endClientLogin);
		mp.events.add("client:setCharacterCreation", PlayerAuthentication.setCharacterCreation);
		mp.events.add("client:setBackToSelection", PlayerAuthentication.setBackToCharacterSelection);
		mp.events.add("client:loginCameraStart", PlayerAuthentication.handleCameraStart);
		mp.events.add("client:setAuthKey", PlayerAuthentication.setAuthenticationKey);

	}

	public static handleUnauthed() {
		if (!getUserCharacterData()) {
			PlayerAuthentication.LocalPlayer.freezePosition(true);
			toggleChat(false);
			setGuiState(false);
			mp.game.ui.displayRadar(false);
		}
	}

	public static setAuthenticationKey(newAuthKey: string) {
		PlayerAuthentication.LocalStorage.data[_storage_key] = newAuthKey;
	}

	public static setCharacterCreation() {
		PlayerAuthentication.endClientLogin();
		BrowserSystem.pushRouter("/charcreation");
		PlayerAuthentication.LocalPlayer.position = PlayerAuthentication.characterCreationPosition;

		let camValues: CreationCam = { angle: PlayerAuthentication.LocalPlayer.getRotation(2).z + 90, dist: 2.6, height: 0.2 };
		let pos: Vector3 = getCameraOffset(new mp.Vector3(PlayerAuthentication.LocalPlayer.position.x, PlayerAuthentication.LocalPlayer.position.y, PlayerAuthentication.LocalPlayer.position.z + camValues.height), camValues.angle, camValues.dist);

		PlayerAuthentication.creationCam = new Camera('selectCam', new mp.Vector3(pos.x, pos.y, pos.z), PlayerAuthentication.LocalPlayer.position);
	}

	public static setBackToCharacterSelection() {
		if (PlayerAuthentication.creationCam) {
			PlayerAuthentication.creationCam.delete();
		}

		PlayerAuthentication.freezeAndBlurClient();
		PlayerAuthentication.handleCameraStart();

	}

	public static handleLoginStart() {
		setUiStateChange("state_loginPage", true);
		PlayerAuthentication.handleCameraStart();
		mp.events.callRemote("server:handlePlayerJoining", PlayerAuthentication.LocalStorage.data[_storage_key]);
	}

	public static handleCameraStart() {
		PlayerAuthentication.LoginCamera = new Camera('loginCam', new mp.Vector3(-79.9, -1079.5, 310.2), new mp.Vector3(-74.8, -819.2, 326.2));
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
		mp.game.ui.displayRadar(true);
		PlayerAuthentication.LocalPlayer.setAlpha(255);
		mp.game.graphics.transitionFromBlurred(100);
		mp.gui.cursor.show(false, false);
		PlayerAuthentication.LocalPlayer.freezePosition(false);
		BrowserSystem._browserInstance.reload(true);
		BrowserSystem.pushRouter("/");
		if (PlayerAuthentication.LoginCamera) {
			PlayerAuthentication.LoginCamera.delete();
		}
		toggleChat(true);

	}
}

export default PlayerAuthentication;
