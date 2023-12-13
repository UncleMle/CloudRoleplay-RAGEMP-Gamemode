import { CharacterModel, Tatto, TattoData, TattoShop } from '@/@types';
import BrowserSystem from '@/BrowserSystem/BrowserSystem';
import { _control_ids } from '@/Constants/Constants';
import validateKeyPress from '@/PlayerMethods/validateKeyPress';
import { Browsers } from '@/enums';
import getUserCharacterData from '@/PlayerMethods/getUserCharacterData';
import { CharacterData } from '@/@types';

import mpsmuggler_overlays from './mpsmuggler_overlays';
import mpvinewood_overlays from './mpvinewood_overlays';
import DeathSystem from '@/DeathSystem/DeathSystem';

class Tattoos {
	public static LocalPlayer: PlayerMp;
	public static _tattoStoreIdentifier: string = 'tattoStoreData';
	public static _tatPurchaseEvent: string = "server:purchaseTattoos";
	public static currentTattooLibView: string;
	public static tattoData: TattoData[] = [
		{ name: "mpsmuggler_overlays", data: mpsmuggler_overlays },
		{ name: "mpvinewood_overlays", data: mpvinewood_overlays }
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
			mp.gui.cursor.show(true, true);
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

	public static async setTattooData(overlay: any, parse: boolean = true, collection: string = 'mpvinewood_overlays') {
		Tattoos.LocalPlayer.clearDecorations();
		let charData: CharacterData | undefined = getUserCharacterData();
		if (!charData) return;

		Tattoos.setDbTats(Tattoos.LocalPlayer, charData.characterModel);

		let tatArr: string[] = overlay;

		if (parse) {
			tatArr = JSON.parse(overlay);
		}

		await mp.game.waitAsync(50);

		tatArr.forEach((data) => {
			let tattoo: string = `${data}${charData?.characterModel.sex ? '_M' : '_F'}`;

			Tattoos.LocalPlayer.setDecoration(mp.game.joaat(collection), mp.game.joaat(tattoo));
		});
	}

	public static setDbTats(entity: PlayerMp | PedMp, charModel: CharacterModel) {
		if(!entity || !charModel) return;
		entity.clearDecorations();

		charModel.player_tattos.forEach(data => {
			let tattoo: string = `${data.tattoo_collection}${charModel.sex ? '_M' : '_F'}`;
			entity.setDecoration(mp.game.joaat(data.tattoo_lib), mp.game.joaat(tattoo));
		})
	}

	public static purchaseTattoos(tattooData: string) {
		mp.events.callRemote(Tattoos._tatPurchaseEvent, Tattoos.currentTattooLibView, tattooData);
	}
}

export default Tattoos;
