import { House } from "@/@types";
import { _control_ids } from "@/Constants/Constants";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";

class HousingSystem {
    public static _housingDataIdentifier: string = "houseData";
    public static _houseLoadEvent: string = "server:loadHouseForPlayer";
    public static LocalPlayer: PlayerMp;

    constructor() {
        HousingSystem.LocalPlayer = mp.players.local;

        mp.keys.bind(_control_ids.Y, false, HousingSystem.handleKeyPress);
    }

    public static handleKeyPress() {
        if(!validateKeyPress(true)) return;
        let houseData: House = HousingSystem.LocalPlayer.getVariable(HousingSystem._housingDataIdentifier);

        if(houseData) {
            mp.events.callRemote(HousingSystem._houseLoadEvent);
        }
    }

}

export default HousingSystem;