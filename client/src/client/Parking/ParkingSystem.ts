import { _control_ids } from "@/Constants/Constants";
import DeathSystem from "@/DeathSystem/DeathSystem";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";
import { Browsers } from "@/enums";

class ParkingSystem {
    public static LocalPlayer: PlayerMp;
    public static _parkingLotIdentifier: string = "parkingLotData";
    public static _retrievalIdentifier: string = "retreivalParkingData";
    public static viewParkedVehiclesEvent: string = "server:viewParkedVehicles";

    constructor() {
        ParkingSystem.LocalPlayer = mp.players.local;

        mp.events.add("render", ParkingSystem.handleRender);
        mp.keys.bind(_control_ids.Y, false, ParkingSystem.handleKeyPressed);
    }

    public static handleRender() {
        if(ParkingSystem.LocalPlayer.browserRouter == Browsers.Parking && ParkingSystem.LocalPlayer.getVariable(ParkingSystem._retrievalIdentifier)) {
            DeathSystem.disableControls();
        }
    }

    public static handleKeyPressed() {
        if(!validateKeyPress(true)) return;
        let retrieveCol = ParkingSystem.LocalPlayer.getVariable(ParkingSystem._retrievalIdentifier)

        if(retrieveCol) {
            mp.events.callRemote(ParkingSystem.viewParkedVehiclesEvent);
        }
    }
}

export default ParkingSystem;