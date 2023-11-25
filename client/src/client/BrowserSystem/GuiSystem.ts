import { UserData, CharacterData, Gui, StreetData } from '../@types';
import getTimeUnix from '../PlayerMethods/getTimeUnix';
import getUserCharacterData from '../PlayerMethods/getUserCharacterData';
import getUserData from '../PlayerMethods/getUserData';
import BrowserSystem from './BrowserSystem';
import { MutationKeys } from 'enums';


class GuiSystem {
	public static LocalPlayer: PlayerMp;

	constructor() {
		GuiSystem.LocalPlayer = mp.players.local;

		mp.events.add("render", GuiSystem.fillGuiRenderValues);
	}

	public static fillGuiRenderValues() {
		let PlayerData: UserData | undefined = getUserData();
		let characterData: CharacterData | undefined = getUserCharacterData();

		if (!PlayerData || !characterData) return;

		const streetData = GuiSystem.getStreetName();

		const playerGuiObj: Gui = {
			playerId: PlayerData.playerId,
			direction: GuiSystem.getCompassDirection(),
			isFrozen: PlayerData.isFrozen,
			unix: getTimeUnix(),
			zoneName: streetData.zoneName,
			zoneNameTwo: streetData.zoneTwo
		}

		BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationSetter", {
			_mutationKey: "${MutationKeys.PlayerGui}",
			data: ${JSON.stringify(playerGuiObj)}
		})`);
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

export default GuiSystem;
