import { VehicleData } from "@/@types";
import BrowserSystem from "@/BrowserSystem/BrowserSystem";
import getVehicleData from "@/PlayerMethods/getVehicleData";

export default class VehicleSpeedo {
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
            let vehicle = VehicleSpeedo.LocalPlayer.vehicle;
			let lightState = vehicle.getLightsState(1, 1);

            BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
                _stateKey: "vehicleSpeedoData",
                status: ${JSON.stringify({
                    vehicleSpeed: vehicle.getSpeed(),
                    vehicleRpm: vehicleData.engine_status ? VehicleSpeedo.LocalPlayer.vehicle.rpm : 0,
                    indicatorStatus: vehicleData.indicator_status,
                    lockStatus: vehicleData.vehicle_locked,
                    lightsStates: lightState,
                    fuelLevel: vehicleData.vehicle_fuel,
                    vehicleMileage: vehicleData.vehicle_distance,
                    metric: mp.game.gameplay.getProfileSetting(227),
                    numberPlate: vehicle.getNumberPlateText(),
                    displayName: VehicleSpeedo.getVehDispName(vehicle.model),
                    dbName: vehicleData.vehicle_name,
                    vehHealth: vehicle.getHealth(),
                    vehicleCruise: vehicleData.speed_limit
                })}
            })`);
        }
    }

    public static getVehDispName(model: number): string {
        let dispName: string = mp.game.ui.getLabelText(mp.game.vehicle.getDisplayNameFromVehicleModel(model));
        return dispName;
    }
}
