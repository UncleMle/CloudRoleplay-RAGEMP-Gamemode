import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import DeathSystem from "@/DeathSystem/DeathSystem";
import { Browsers } from "@/enums";

class VehicleCustoms {
    public static LocalPlayer: PlayerMp;
    public static _colshapeDataIdentifier: string = "customsAreaColshapeData";

    constructor() {
        VehicleCustoms.LocalPlayer = mp.players.local;

        mp.events.add("playerExitColshape", VehicleCustoms.handleColEnter);
        mp.events.add("render", VehicleCustoms.handleRender);
    }

    public static handleRender() {
        if(VehicleCustoms.LocalPlayer.browserRouter == Browsers.ModsView) {
            DeathSystem.disableControls();
        }
    }

    public static handleColEnter(colshape: ColshapeMp) {
        if(colshape.getVariable(VehicleCustoms._colshapeDataIdentifier) && VehicleCustoms.LocalPlayer.browserRouter == Browsers.ModsView) {
            BrowserSystem.pushRouter("/");
        }
    }
}

export default VehicleCustoms;