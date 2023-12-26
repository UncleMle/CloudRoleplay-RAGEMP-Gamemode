import { CharacterModel, TatFromUi, TattoData, TattoShop } from '@/@types';
import BrowserSystem from '@/BrowserSystem/BrowserSystem';
import { _control_ids } from '@/Constants/Constants';
import validateKeyPress from '@/PlayerMethods/validateKeyPress';
import { Browsers } from '@/enums';
import getUserCharacterData from '@/PlayerMethods/getUserCharacterData';
import { CharacterData } from '@/@types';

import mpsmuggler_overlays from './mpsmuggler_overlays';
import mpvinewood_overlays from './mpvinewood_overlays';
import mpbusiness_overlays from './mpbusiness_overlays';
import DeathSystem from '@/DeathSystem/DeathSystem';

class Tattoos {
	public static LocalPlayer: PlayerMp;
	public static _tattoStoreIdentifier: string = 'tattoStoreData';
	public static _tatPurchaseEvent: string = "server:purchaseTattoos";
	public static currentTattooLibView: string;
	public static tattoData: TattoData[] = [
		{ name: "mpsmuggler_overlays", data: mpsmuggler_overlays },
		{ name: "mpvinewood_overlays", data: mpvinewood_overlays },
		{ name: "mpbusiness_overlays", data: mpbusiness_overlays }
	]

	constructor() {
		Tattoos.LocalPlayer = mp.players.local;

		mp.events.add('tat:setTatto', Tattoos.setTattooData);
		mp.events.add('tat:purchase', Tattoos.purchaseTattoos);
		mp.events.add('tat:resync', () => Tattoos.setDbTats(Tattoos.LocalPlayer, getUserCharacterData()?.characterModel as CharacterModel));
		mp.events.add('render', Tattoos.handleRender);
		mp.keys.bind(_control_ids.Y, false, Tattoos.handleKeyPress);
	}

	public static handleRender() {
		if(Tattoos.LocalPlayer.browserRouter == Browsers.Tattoos) {
			DeathSystem.disableControls();
		}
	}

	public static async handleKeyPress() {
		if (!validateKeyPress(true)) return;
		let tattooShopData: TattoShop | undefined = Tattoos.LocalPlayer.getVariable(Tattoos._tattoStoreIdentifier);
		let charData: CharacterData | undefined = getUserCharacterData();

		if (tattooShopData && charData) {

			Tattoos.tattoData.forEach(data => {
				if(data.name == tattooShopData?.overlayDlc) {
					Tattoos.currentTattooLibView = tattooShopData?.overlayDlc;

					BrowserSystem._browserInstance.execute(`appSys.commit('playerMutationSetter', {
						_mutationKey: "tattoo_store_data",
						data: ${JSON.stringify(data.data)}
					})`);

					BrowserSystem._browserInstance.execute(`appSys.commit('playerMutationSetter', {
						_mutationKey: "player_current_tats",
						data: ${JSON.stringify(charData?.characterModel.player_tattos)}
					})`);

					BrowserSystem.pushRouter(Browsers.Tattoos);
				}
			});
		}
	}

	public static async setTattooData(overlay: any, parse: boolean = true, collection: string = Tattoos.currentTattooLibView) {
		Tattoos.LocalPlayer.clearDecorations();
		let charData: CharacterData | undefined = getUserCharacterData();
		if (!charData) return;

		Tattoos.setDbTats(Tattoos.LocalPlayer, charData.characterModel);

		let tatArr: TatFromUi[] = overlay;

		if (parse) {
			tatArr = JSON.parse(overlay);
		}

		await mp.game.waitAsync(50);

		tatArr.forEach((data) => {
			if(charData) {
				Tattoos.LocalPlayer.setDecoration(mp.game.joaat(collection), mp.game.joaat(charData.characterModel.sex ? data.male : data.female));
			}
		});
	}

	public static async setDbTats(entity: PlayerMp | PedMp, charModel: CharacterModel) {
		if(!entity) return;

		if((entity.type == "player" && !mp.players.atHandle(entity.handle)) || entity.type == "ped" && !mp.peds.atHandle(entity.handle)) return;

		entity.clearDecorations();

		charModel.player_tattos.forEach(data => {
			entity.setDecoration(mp.game.joaat(data.tattoo_lib), mp.game.joaat(data.tattoo_collection));
		});
	}

	public static purchaseTattoos(tattooData: string) {
		let charData: CharacterData | undefined = getUserCharacterData();
		if(!charData) return;

		let tats: string[] = [];

		JSON.parse(tattooData).forEach((data: TatFromUi) => {
			tats.push(charData?.characterModel.sex ? data.male : data.female);
		})

		mp.events.callRemote(Tattoos._tatPurchaseEvent, Tattoos.currentTattooLibView, JSON.stringify(tats));
	}
}

export default Tattoos;
