import { VehicleData } from "@/@types";
import { _SHARED_VEHICLE_DATA } from "@/Constants/Constants";
import getVehicleData from "@/PlayerMethods/getVehicleData";

class CruiseControl {
    public static localPlayer: PlayerMp;

    constructor() {
        CruiseControl.localPlayer = mp.players.local;

        mp.events.add("playerEnterVehicle", CruiseControl.handleVehicleEnter);
        mp.events.addDataHandler(_SHARED_VEHICLE_DATA, CruiseControl.handleDataHandler);
    }

    public static handleDataHandler(entity: VehicleMp, data: VehicleData) {
        if(entity.type != "vehicle" || !data) return;

        if(CruiseControl.localPlayer.vehicle && CruiseControl.localPlayer.vehicle.handle === entity.handle && CruiseControl.localPlayer.vehicle.getPedInSeat(-1) === CruiseControl.localPlayer.handle) {
            entity.setMaxSpeed(data.speed_limit);
        }
    }

    public static handleVehicleEnter(vehicle: VehicleMp, seat: number) {
        let vehicleData: VehicleData | undefined = getVehicleData(vehicle);

        if(vehicleData && vehicleData.speed_limit !== -1 && seat === -1) {
            vehicle.setMaxSpeed(vehicleData.speed_limit);
        }
    }
}

export default CruiseControl;