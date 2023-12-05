import { SpeedoData, VehicleData } from "@/@types";
import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import getVehicleData from "@/PlayerMethods/getVehicleData";

class VehicleSpeedo {
    public static LocalPlayer: PlayerMp;

    constructor() {
        VehicleSpeedo.LocalPlayer = mp.players.local;

        mp.events.add("playerEnterVehicle", VehicleSpeedo.handleEnter);
        mp.events.add("playerLeaveVehicle", VehicleSpeedo.handleLeave);
        mp.events.add("render", VehicleSpeedo.handleRender);
    }

    public static handleEnter(vehicle: VehicleMp, seat: number) {
        if(seat == -1 || seat == 0) {
            BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
                _stateKey: "speedoUi",
                status: true
            })`);
        }
    }

    public static handleLeave(vehicle: VehicleMp, seat: number) {
        BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
            _stateKey: "speedoUi",
            status: false
        })`);
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
                _stateKey: "vehicleSpeedoData",
                status: ${JSON.stringify(speedoData)}
            })`);
        }
    }
}

export default VehicleSpeedo;