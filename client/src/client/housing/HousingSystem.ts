import { House, Interior } from "@/@types";
import { _control_ids } from "@/Constants/Constants";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";

class HousingSystem {
    public static _housingDataIdentifier: string = "houseData";
    public static _interiorDataIdentifier: string = "houseInteriorData";
    public static _houseLoadEvent: string = "server:loadHouseForPlayer";
    public static _houseExitEvent: string = "server:exitHouseForPlayer";
    public static LocalPlayer: PlayerMp;

    constructor() {
        HousingSystem.LocalPlayer = mp.players.local;

        mp.keys.bind(_control_ids.Y, false, HousingSystem.handleKeyPress);
    }

    public static handleKeyPress() {
        if(!validateKeyPress(true)) return;
        let houseData: House | undefined = HousingSystem.LocalPlayer.getVariable(HousingSystem._housingDataIdentifier);
        let interiorData: Interior | undefined = HousingSystem.LocalPlayer.getVariable(HousingSystem._interiorDataIdentifier);

        if(interiorData) {
            mp.events.callRemote(HousingSystem._houseExitEvent);
            return;
        }

        if(houseData) {
            mp.events.callRemote(HousingSystem._houseLoadEvent);
        }
    }

}

export default HousingSystem;