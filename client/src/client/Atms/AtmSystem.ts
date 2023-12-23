import { Atm } from "@/@types";
import { _control_ids } from "@/Constants/Constants";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";

class AtmSystem {
    public static LocalPlayer: PlayerMp;
    public static readonly _atmDataIdentifier: string = "atmColshapeData";
    public static readonly serverAtmEvent: string = "server:openAtm";

    constructor() {
        AtmSystem.LocalPlayer = mp.players.local;

        mp.keys.bind(_control_ids.Y, false, AtmSystem.handleKeyPress_Y);
    }

    public static handleKeyPress_Y() {
        if(validateKeyPress(true, true, true)) {
            let atmData: Atm = AtmSystem.LocalPlayer.getVariable(AtmSystem._atmDataIdentifier);

            if(atmData) {
                mp.events.callRemote(AtmSystem._atmDataIdentifier);
            }
        }
    }
}

export default AtmSystem;