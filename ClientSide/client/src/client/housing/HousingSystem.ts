import { House, Interior } from '@/@types';
import GuiSystem from '@/BrowserSystem/GuiSystem';
import { _control_ids } from '@/Constants/Constants';
import NotificationSystem from '@/NotificationSystem/NotificationSystem';
import getUserCharacterData from '@/PlayerMethods/getUserCharacterData';
import validateKeyPress from '@/PlayerMethods/validateKeyPress';
import { CharacterData } from '@/@types';

export default class HousingSystem {
	public static _housingDataIdentifier: string = 'houseData';
	public static _interiorDataIdentifier: string = 'houseInteriorData';
	public static _houseLoadEvent: string = 'server:loadHouseForPlayer';
	public static _houseExitEvent: string = 'server:exitHouseForPlayer';
	public static _houseLockToggleEvent: string = 'server:toggleHouseLock';
	public static LocalPlayer: PlayerMp;

	constructor() {
		HousingSystem.LocalPlayer = mp.players.local;

		mp.events.add("housing:createObject", HousingSystem.createAnObject);

		mp.keys.bind(_control_ids.Y, false, HousingSystem.handleKeyPress_Y);
		mp.keys.bind(_control_ids.K, false, HousingSystem.handleKeyPress_K);
	}

	public static async handleKeyPress_K() {
		let houseData: House | null = HousingSystem.LocalPlayer.getVariable(HousingSystem._housingDataIdentifier);
		let characterData: CharacterData | undefined = getUserCharacterData();
		let interiorData: Interior | null = HousingSystem.LocalPlayer.getVariable(HousingSystem._interiorDataIdentifier);

		if (!characterData) return;

		if ((houseData && houseData.house_owner_id == characterData.character_id) || interiorData) {
			mp.events.callRemote(HousingSystem._houseLockToggleEvent);
		}
	}

	public static async handleKeyPress_Y() {
		if (!validateKeyPress(true)) return;
		let houseData: House | null = HousingSystem.LocalPlayer.getVariable(HousingSystem._housingDataIdentifier);
		let interiorData: Interior | null = HousingSystem.LocalPlayer.getVariable(HousingSystem._interiorDataIdentifier);

		if (interiorData && !houseData) {
			mp.events.callRemote(HousingSystem._houseExitEvent);
			await HousingSystem.playSwitch('~o~You exited this house.');
		}

		if (houseData && houseData.isLocked) {
			NotificationSystem.createNotification('~r~This house is locked', false);
			return;
		}

		if (houseData) {
			mp.events.callRemote(HousingSystem._houseLoadEvent);
			await HousingSystem.playSwitch('~o~You entered this house');
		}
	}

	public static async playSwitch(notif: string) {
		GuiSystem.toggleHudComplete(false);
		mp.game.cam.doScreenFadeOut(100);

		await mp.game.waitAsync(1500);
		mp.game.cam.doScreenFadeIn(500);
		GuiSystem.toggleHudComplete(true);
		NotificationSystem.createNotification(notif, false);
	}

	public static createAnObject(model: string) {
		let pos: Vector3 = HousingSystem.LocalPlayer.position;

		let obj: ObjectMp = mp.objects.new(model, pos, {
			rotation: new mp.Vector3(0, 0, 0),
			alpha: 255,
			dimension: 0
		});
	}
}
