import { Atm, Bank } from "@/@types";
import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import { _control_ids } from "@/Constants/Constants";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";
import { Browsers } from "@/enums";

class BanksAtms {
    public static LocalPlayer: PlayerMp;
    public static readonly _atmDataIdentifier: string = "atmColshapeData";
    public static readonly _tellerColshapeDataIdentifier: string = "bankTellerColshapeData";
    public static readonly serverAtmEvent: string = "server:openAtm";
    public static readonly serverBankEvent: string = "server:openBank";

    constructor() {
        BanksAtms.LocalPlayer = mp.players.local;
        mp.keys.bind(_control_ids.Y, false, BanksAtms.handleKeyPress_Y);

        mp.events.add("render", BanksAtms.handleRender);

        mp.events.add("playerExitColshape", BanksAtms.handleColShapeLeave);
    }

    public static handleColShapeLeave(colShape: ColshapeMp) {
        if((colShape.getVariable(BanksAtms._atmDataIdentifier) || colShape.getVariable(BanksAtms._tellerColshapeDataIdentifier) ) && BanksAtms.LocalPlayer.browserRouter == Browsers.Atm) {
            BrowserSystem.handleReset();
        }
    }

    public static handleRender() {
        if(BanksAtms.LocalPlayer.browserRouter == Browsers.Atm) {
            mp.gui.cursor.show(true, true);
        }
    }

    public static handleKeyPress_Y() {
        if(validateKeyPress(true, true, true)) {
            let atmData: Atm = BanksAtms.LocalPlayer.getVariable(BanksAtms._atmDataIdentifier);
            let bankData: Bank = BanksAtms.LocalPlayer.getVariable(BanksAtms._tellerColshapeDataIdentifier);

            if(bankData) {
                mp.events.callRemote(BanksAtms.serverBankEvent);
                return;
            }

            if(atmData) {
                mp.events.callRemote(BanksAtms.serverAtmEvent);
            }
        }
    }
}

export default BanksAtms;