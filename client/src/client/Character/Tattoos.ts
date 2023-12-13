import { TattoShop } from "@/@types";
import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import { _control_ids } from "@/Constants/Constants";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";
import { Browsers } from "@/enums";
import vinewoodTats from './mpvinewood_overlays.json';
import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";
import { CharacterData } from "@/@types";

class Tattoos {
    public static LocalPlayer: PlayerMp;
    public static _tattoStoreIdentifier: string = "tattoStoreData";

    constructor() {
        Tattoos.LocalPlayer = mp.players.local;

        mp.events.add("tat:setTatto", Tattoos.setTattooData);
        mp.keys.bind(_control_ids.Y, false, Tattoos.handleKeyPress);
    }

    public static handleKeyPress() {
        if(!validateKeyPress(true)) return;
        let tattooShopData: TattoShop | undefined = Tattoos.LocalPlayer.getVariable(Tattoos._tattoStoreIdentifier);

        if(tattooShopData) {
            BrowserSystem._browserInstance.execute(`appSys.commit('playerMutationSetter', {
                _mutationKey: "tattoo_store_data",
                data: ${JSON.stringify(vinewoodTats)}
            })`);

            BrowserSystem.pushRouter(Browsers.Tattoos);
        }
    }

    public static setTattooData(overlay: string[], collection: string = "mpvinewood_overlays") {
        Tattoos.LocalPlayer.clearDecorations();

        overlay.forEach(data => {
            let charData: CharacterData | undefined = getUserCharacterData();
            if(!charData) return;

            Tattoos.LocalPlayer.setDecoration(mp.game.joaat(collection), mp.game.joaat(data+charData.characterModel.sex ? "_M" : "_F"));
        })
    }
}

export default Tattoos;