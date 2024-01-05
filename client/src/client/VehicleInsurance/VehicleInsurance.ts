import { InsuranceArea } from "@/@types";
import { _control_ids } from "@/Constants/Constants";
import DeathSystem from "@/DeathSystem/DeathSystem";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";
import { Browsers } from "@/enums";

export default class VehicleInsurance {
    public static LocalPlayer: PlayerMp;
    public static _insuranceDataIdentifier: string = "vehicleInsuranceData";
    public static _viewInsuranceVehiclesEvent: string = "server:viewInsuranceVehicles";

    constructor() {
        VehicleInsurance.LocalPlayer = mp.players.local;

        mp.events.add("render", VehicleInsurance.handleRender);
        mp.keys.bind(_control_ids.Y, true, VehicleInsurance.handleKeyPress_Y);
    }

    public static handleRender() {
        if(VehicleInsurance.LocalPlayer.browserRouter == Browsers.Insurance) {
            DeathSystem.disableControls();
        }
    }

    public static handleKeyPress_Y() {
        if(!validateKeyPress(true)) return;

        let insuranceData: InsuranceArea = VehicleInsurance.LocalPlayer.getVariable(VehicleInsurance._insuranceDataIdentifier);

        if(insuranceData) {
            mp.events.callRemote(VehicleInsurance._viewInsuranceVehiclesEvent);
        }
    }
}