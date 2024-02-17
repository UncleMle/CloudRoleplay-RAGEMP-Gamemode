import { IS_RADAR_ENABLED, IS_RADAR_HIDDEN, _IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE, _control_ids } from '@/Constants/Constants';
import { UserData, CharacterData, StreetData, Hunger, Gui } from '../@types';
import getUserCharacterData from '../PlayerMethods/getUserCharacterData';
import getUserData from '../PlayerMethods/getUserData';
import BrowserSystem from './BrowserSystem';
import { getWaterAndHungerData } from '@/PlayerMethods/getWaterAndHungerData';
import NotificationSystem from '@/NotificationSystem/NotificationSystem';
import ScaleForm from '@/Scaleform/ScaleformMessages';
import toggleChat from '@/PlayerMethods/ToggleChat';
import validateKeyPress from '@/PlayerMethods/validateKeyPress';

export default class GuiSystem {
	public static LocalPlayer: PlayerMp;
	public static hudToggle: boolean = true;

	constructor() {
		GuiSystem.LocalPlayer = mp.players.local;

		//mp.events.add("render", GuiSystem.fillGuiRenderValues);
		mp.events.add("gui:toggleHudComplete", GuiSystem.toggleHudComplete);
		mp.keys.bind(_control_ids.F10, false, () => GuiSystem.toggleHud);
	}

	public static toggleHud() {
		if (!validateKeyPress() || !getUserCharacterData()) return;

		GuiSystem.hudToggle = !GuiSystem.hudToggle;

		GuiSystem.toggleHudComplete(GuiSystem.hudToggle, false, true);
	}

	public static toggleHudComplete(toggle: boolean, notif: boolean = false, checkForScaleFormAndSwitch: boolean = true) {
		if (checkForScaleFormAndSwitch && (mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE) || ScaleForm.isActive())) return;

		let browser: BrowserMp = BrowserSystem._browserInstance;
		GuiSystem.hudToggle = toggle;

		if (browser) {
			mp.game.ui.displayRadar(toggle);
			GuiSystem.LocalPlayer.guiState = toggle;
			toggleChat(toggle);

			browser.execute(`appSys.commit('setUiState', {
				_stateKey: "guiEnabled",
				status: ${toggle}
			})`);

			if (notif) {
				NotificationSystem.createNotification(`You turned your HUD ${toggle ? "on" : "off"}`);
			}
		}
	}

	public static fillGuiRenderValues() {
		if(!getUserCharacterData()) return;

		if (ScaleForm.isActive()) {
			GuiSystem.toggleHudComplete(false, false, false);
			return;
		}

		let PlayerData: UserData | undefined = getUserData();
		let characterData: CharacterData | undefined = getUserCharacterData();

		if (!PlayerData || !characterData) return;

		const streetData = GuiSystem.getStreetName();

		let guiData: Gui = {
			direction: GuiSystem.getCompassDirection(),
			isFrozen: PlayerData.isFrozen,
			playerId: GuiSystem.LocalPlayer.remoteId,
			zoneName: streetData.zoneName,
			zoneNameTwo: streetData.zoneTwo,
			fps: GuiSystem.LocalPlayer.fps,
			voiceMuted: mp.voiceChat.muted
		}

		if (mp.game.invoke(IS_RADAR_ENABLED) && !mp.game.invoke(IS_RADAR_HIDDEN)) {

			let hungerAndThirst: Hunger | undefined = getWaterAndHungerData(GuiSystem.LocalPlayer);

			if (hungerAndThirst) {
				BrowserSystem.handleObjectToBrowser("player_water", hungerAndThirst.water);
				BrowserSystem.handleObjectToBrowser("player_hunger", hungerAndThirst.hunger);
				BrowserSystem.handleObjectToBrowser("player_data_gui", guiData);
			}
		}
	}

	public static getStreetName(): StreetData {
		let position: Vector3 = GuiSystem.LocalPlayer.position;

		let getStreet: GetStreetNameAtCoordResult = mp.game.pathfind.getStreetNameAtCoord(position.x, position.y, position.z);
		let zoneName: string = mp.game.ui.getLabelText(mp.game.zone.getNameOfZone(position.x, position.y, position.z)).replace("'", "");
		let zoneTwo: string = mp.game.ui.getStreetNameFromHashKey(getStreet.streetName) ? mp.game.ui.getStreetNameFromHashKey(getStreet.streetName) : "";

		return { getStreet, zoneName, zoneTwo };
	}

	public static getCompassDirection(): string {
		let direction: string = "";

		let heading = mp.players.local.getHeading();

		if (GuiSystem.LocalPlayer.heading != 0) {
			if (heading < 45 || heading > 315) {
				direction = "N";
			}
			if (heading > 45 && heading < 135) {
				direction = "W";
			}
			if (heading > 135 && heading < 225) {
				direction = "S";
			}
			if (heading > 225 && heading < 315) {
				direction = "E";
			}
		}

		return direction;
	}

}
