import GuiSystem from "@/BrowserSystem/GuiSystem";
import { CreationCam } from "../@types";
import BrowserSystem from "../BrowserSystem/BrowserSystem";
import Camera from "../CameraSystem/Camera";
import { _IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE } from "../Constants/Constants";
import getCameraOffset from "../PlayerMethods/getCameraOffset";
import getUserCharacterData from "../PlayerMethods/getUserCharacterData";

const _storage_key: string = "AutoLoginToken";

export default class PlayerAuthentication {
	public static LoginCamera: Camera;
	public static creationCam: Camera;
	public static selectionCam: CameraMp;
	public static LocalPlayer: PlayerMp
	public static LocalStorage: StorageMp;
	public static _cameraSwitchInterval: number = 500;
	public static _switchCamCmd: string = "swcm";
	public static readonly _logoutIdentifier = "playerIsLoggingOut";
	public static _currentCam: number = 0;
	public static cameraPositions: Vector3[] = [
		new mp.Vector3(-79.9, -1079.5, 310.2),
		new mp.Vector3(407.3, 6009.5, 940.0),
		new mp.Vector3(678.2, 928.0, 458.3),
		new mp.Vector3(1893.8, 3309.4, 323.1)
	];
	public static cameraPointAtPositions: Vector3[] = [
		new mp.Vector3(-74.8, -819.2, 326.2),
		new mp.Vector3(501.7, 5603.7, 767.9),
		new mp.Vector3(728.1, 1213.9, 328.8),
		new mp.Vector3(1869.9, 3711.3, 120.5)
	];

	constructor() {
		PlayerAuthentication.LocalPlayer = mp.players.local;
		PlayerAuthentication.LocalStorage = mp.storage;

		mp.events.add({
			render: PlayerAuthentication.handleUnauthed,
			playerReady: PlayerAuthentication.handleLoginStart,
			consoleCommand: PlayerAuthentication.consoleCommand,
			"client:loginEnd": PlayerAuthentication.endClientLogin,
			"client:setCharacterCreation": PlayerAuthentication.setCharacterCreation,
			"client:setBackToSelection": PlayerAuthentication.setBackToCharacterSelection,
			"client:loginCameraStart": PlayerAuthentication.handleCameraStart,
			"client:setAuthKey": PlayerAuthentication.setAuthenticationKey
		});

		mp.events.addDataHandler(PlayerAuthentication._logoutIdentifier, PlayerAuthentication.handleLogoutHandler);
	}

	public static handleLogoutHandler(entity: PlayerMp, val: boolean) {
		if (entity.type == "player" && val) {
			entity.freezePosition(true);
		} else {
			entity.freezePosition(false);
		}
	}

	public static handleUnauthed() {
		if (!getUserCharacterData()) {
			PlayerAuthentication.LocalPlayer.freezePosition(true);
			//toggleChat(false);
			//setGuiState(false);
			mp.game.ui.displayRadar(false);
		}
	}

	public static consoleCommand(command: string) {
		if (command == PlayerAuthentication._switchCamCmd && !getUserCharacterData()) {
			PlayerAuthentication.LoginCamera?.delete();

			PlayerAuthentication._currentCam >= PlayerAuthentication.cameraPositions.length - 1 ? PlayerAuthentication._currentCam = 0 : PlayerAuthentication._currentCam++;

			PlayerAuthentication.LoginCamera = new Camera('loginCam', PlayerAuthentication.cameraPositions[PlayerAuthentication._currentCam], PlayerAuthentication.cameraPointAtPositions[PlayerAuthentication._currentCam]);

			PlayerAuthentication.LoginCamera.startMoving(7100.0);
			PlayerAuthentication.LoginCamera.setActive();
			PlayerAuthentication.freezeAndBlurClient();
		}
	}

	public static setAuthenticationKey(newAuthKey: string) {
		PlayerAuthentication.LocalStorage.data[_storage_key] = newAuthKey;
	}

	public static setCharacterCreation() {
		PlayerAuthentication.endClientLogin();
		BrowserSystem.pushRouter("/charcreation");

		let camValues: CreationCam = { angle: PlayerAuthentication.LocalPlayer.getRotation(2).z + 90, dist: 2.6, height: 0.2 };
		let pos: Vector3 = getCameraOffset(new mp.Vector3(PlayerAuthentication.LocalPlayer.position.x, PlayerAuthentication.LocalPlayer.position.y, PlayerAuthentication.LocalPlayer.position.z + camValues.height), camValues.angle, camValues.dist);

		PlayerAuthentication.creationCam = new Camera('selectCam', new mp.Vector3(pos.x, pos.y, pos.z), PlayerAuthentication.LocalPlayer.position);
	}

	public static setBackToCharacterSelection() {
		PlayerAuthentication.LoginCamera?.delete();

		PlayerAuthentication.freezeAndBlurClient();
		PlayerAuthentication.handleCameraStart();
	}

	public static handleLoginStart() {
		PlayerAuthentication.handleCameraStart();
		mp.events.callRemote("server:handlePlayerJoining", PlayerAuthentication.LocalStorage.data[_storage_key]);
	}

	public static handleCameraStart() {
		GuiSystem.toggleHudComplete(false);

		PlayerAuthentication.LoginCamera?.delete();

		let randomSelect: number = Math.floor(Math.random() * PlayerAuthentication.cameraPositions.length);
		PlayerAuthentication.LoginCamera = new Camera('loginCam', PlayerAuthentication.cameraPositions[randomSelect], PlayerAuthentication.cameraPointAtPositions[randomSelect]);

		PlayerAuthentication.LoginCamera.startMoving(7100.0);
		PlayerAuthentication.LoginCamera.setActive();
		PlayerAuthentication.freezeAndBlurClient();
	}

	public static freezeAndBlurClient() {
		mp.game.ui.displayRadar(false);
		mp.gui.cursor.show(true, true);
		PlayerAuthentication.LocalPlayer.freezePosition(true);
		PlayerAuthentication.LocalPlayer.setAlpha(0);
		mp.game.cam.renderScriptCams(true, false, 0, true, false);
		mp.game.graphics.transitionToBlurred(100);
		PlayerAuthentication.LocalPlayer.freezePosition(true);
	}

	public static endClientLogin() {
		PlayerAuthentication.LocalPlayer.freezePosition(false);
		PlayerAuthentication.LocalPlayer.setAlpha(255);
		mp.game.graphics.transitionFromBlurred(100);
		mp.gui.cursor.show(false, false);
		BrowserSystem.pushRouter("/");

		PlayerAuthentication.LoginCamera?.delete();

		PlayerAuthentication.LocalPlayer.freezePosition(false);
	}

}
