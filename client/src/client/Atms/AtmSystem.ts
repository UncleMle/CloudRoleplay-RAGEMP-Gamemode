import { Atm } from "@/@types";
import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import { _control_ids } from "@/Constants/Constants";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";
import { Browsers } from "@/enums";

class AtmSystem {
    public static LocalPlayer: PlayerMp;
    public static readonly _atmDataIdentifier: string = "atmColshapeData";
    public static readonly serverAtmEvent: string = "server:openAtm";

    constructor() {
        AtmSystem.LocalPlayer = mp.players.local;

        mp.keys.bind(_control_ids.Y, false, AtmSystem.handleKeyPress_Y);
        mp.events.add("render", AtmSystem.handleRender);
        mp.events.add("playerExitColshape", AtmSystem.handleColShapeLeave);
    }

    public static handleColShapeLeave(colShape: ColshapeMp) {
        if(colShape.getVariable(AtmSystem._atmDataIdentifier) && AtmSystem.LocalPlayer.browserRouter == Browsers.Atm) {
            BrowserSystem.handleReset();
        }
    }

    public static handleRender() {
        if(AtmSystem.LocalPlayer.browserRouter == Browsers.Atm) {
            mp.gui.cursor.show(true, true);
        }
    }

    public static handleKeyPress_Y() {
        if(validateKeyPress(true, true, true)) {
            let atmData: Atm = AtmSystem.LocalPlayer.getVariable(AtmSystem._atmDataIdentifier);

            if(atmData) {
                mp.events.callRemote(AtmSystem.serverAtmEvent);
            }
        }
    }
}

export default AtmSystem;