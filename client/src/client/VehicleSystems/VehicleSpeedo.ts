import { SpeedoData, VehicleData } from "@/@types";
import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import getVehicleData from "@/PlayerMethods/getVehicleData";

class VehicleSpeedo {
    public static LocalPlayer: PlayerMp;

    constructor() {
        VehicleSpeedo.LocalPlayer = mp.players.local;

        mp.events.add("render", VehicleSpeedo.handleRender);
    }

    public static handleRender() {
        if(VehicleSpeedo.LocalPlayer.vehicle && BrowserSystem._browserInstance) {
            let vehicleData: VehicleData | undefined = getVehicleData(VehicleSpeedo.LocalPlayer.vehicle);

            if(!vehicleData) return;

            let speedoData: SpeedoData = {
                vehicleSpeed: (VehicleSpeedo.LocalPlayer.vehicle.getSpeed() * 3.6).toFixed(0),
                vehicleRpm: vehicleData.engine_status ? VehicleSpeedo.LocalPlayer.vehicle.rpm : 0,
            }

            BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
                _stateKey: "speedoUi",
                status: true
            })`);

            BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
                _stateKey: "vehicleSpeedoData",
                status: ${JSON.stringify(speedoData)}
            })`);
        } else {
            BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
                _stateKey: "speedoUi",
                status: false
            })`);
        }
    }
}

export default VehicleSpeedo;