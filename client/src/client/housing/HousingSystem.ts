import { House, Interior } from "@/@types";
import GuiSystem from "@/BrowserSystem/GuiSystem";
import { _control_ids } from "@/Constants/Constants";
import NotificationSystem from "@/NotificationSystem/NotificationSystem";
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

    public static async handleKeyPress() {
        if(!validateKeyPress(true)) return;
        let houseData: House | undefined = HousingSystem.LocalPlayer.getVariable(HousingSystem._housingDataIdentifier);
        let interiorData: Interior | undefined = HousingSystem.LocalPlayer.getVariable(HousingSystem._interiorDataIdentifier);

        if(interiorData && !houseData) {
            mp.events.callRemote(HousingSystem._houseExitEvent);
            await HousingSystem.playSwitch("~o~You exited this house.");
        }

        if(houseData) {
            mp.events.callRemote(HousingSystem._houseLoadEvent);
            await HousingSystem.playSwitch("~o~You entered this house");
        }
    }

    public static async playSwitch(notif: string) {
        NotificationSystem.createNotification(notif, false)
        GuiSystem.toggleHudComplete(true);
        mp.game.cam.doScreenFadeOut(100);

        await mp.game.waitAsync(1500);
        mp.game.cam.doScreenFadeIn(500);
        GuiSystem.toggleHudComplete(false);
    }

}

export default HousingSystem;