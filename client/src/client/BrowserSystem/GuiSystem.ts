import { IS_RADAR_ENABLED, IS_RADAR_HIDDEN, SET_TEXT_OUTLINE } from '@/Constants/Constants';
import { UserData, CharacterData, StreetData, Minimap } from '../@types';
import getTimeUnix from '../PlayerMethods/getTimeUnix';
import getUserCharacterData from '../PlayerMethods/getUserCharacterData';
import getUserData from '../PlayerMethods/getUserData';

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

		let minimap: Minimap = GuiSystem.getMinimapAnchor();

		if(mp.game.invoke(IS_RADAR_ENABLED) && !mp.game.invoke(IS_RADAR_HIDDEN) && minimap.rightX) {
			if(PlayerData.isFrozen) {
				GuiSystem.drawText(`~r~[Frozen]~w~`, [minimap.rightX + 0.01, minimap.bottomY - 0.150], 4, [255, 255, 255, 255], 0.55);
			}
			if(!characterData.voiceChatState) {
				mp.game.graphics.requestStreamedTextureDict("mplobby", true);
				mp.game.graphics.drawSprite("mplobby", "mp_charcard_stats_icons9", minimap.rightX + 0.04, minimap.bottomY - 0.100, 0.018, 0.018, 0, 0, 255, 100, 180, false);
			}

			GuiSystem.drawText(GuiSystem.getCompassDirection(), [minimap.rightX + 0.01, minimap.bottomY - 0.125], 4, [255, 255, 255, 255], 0.80);
			GuiSystem.drawText(`${mp.players.local.remoteId} | ${getTimeUnix()} | FPS ${GuiSystem.LocalPlayer.fps}`, [minimap.rightX + 0.01, minimap.bottomY - 0.070], 4, [255, 255, 255, 255], 0.40);
			GuiSystem.drawText(`${streetData.zoneName} ${streetData.zoneTwo ? "/ " + streetData.zoneTwo : "" }`, [minimap.rightX + 0.01, minimap.bottomY - 0.045], 4, [255, 255, 255, 255], 0.40);
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

	public static drawText(text: string, drawXY: number[], font: number, color: number[], scale: number, alignRight = false) {
		mp.game.ui.setTextEntry("STRING");
		mp.game.ui.addTextComponentSubstringPlayerName(text);
		mp.game.ui.setTextFont(font);
		mp.game.ui.setTextScale(scale, scale);
		mp.game.ui.setTextColour(color[0], color[1], color[2], color[3]);
		mp.game.ui.setTextDropShadow();

		if (alignRight) {
			mp.game.ui.setTextRightJustify(true);
			mp.game.ui.setTextWrap(0, drawXY[0]);
		}

		mp.game.ui.drawText(drawXY[0], drawXY[1], 0);
	}


	public static getMinimapAnchor(): Minimap {
		let sfX: number = 1.0 / 20.0;
		let sfY: number = 1.0 / 20.0;
		let safeZone: number = mp.game.graphics.getSafeZoneSize();
		let aspectRatio: number = mp.game.graphics.getScreenAspectRatio(false);
		let resolution: GetScreenResolutionResult = mp.game.graphics.getScreenActiveResolution(0, 0);
		let scaleX: number = 1.0 / resolution.x;
		let scaleY: number = 1.0 / resolution.y;

		let minimap: Minimap = {
			width: scaleX * (resolution.x / (4 * aspectRatio)),
			height: scaleY * (resolution.y / 5.674),
			scaleX: scaleX,
			scaleY: scaleY,
			leftX: scaleX * (resolution.x * (sfX * (Math.abs(safeZone - 1.0) * 10))),
			bottomY: 1.0 - scaleY * (resolution.y * (sfY * (Math.abs(safeZone - 1.0) * 10))),
			rightX: null,
			topY: null
		};

		minimap.rightX = minimap.leftX + minimap.width;
		minimap.topY = minimap.bottomY - minimap.height;

		return minimap;
	}
}

export default GuiSystem;
