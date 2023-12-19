import { VehicleData } from "@/@types";
import getVehicleData from "@/PlayerMethods/getVehicleData";

class VehicleDamage {
    public static LocalPlayer: PlayerMp;
    public static readonly saveDamageEvent: string = "server:saveVehicleDamage";

    constructor() {
        mp.events.add("playerEnterVehicle", VehicleDamage.handleEnterOrLeave);
        mp.events.add("playerLeaveVehicle", VehicleDamage.handleEnterOrLeave);
    }

    public static async handleEnterOrLeave(vehicle: VehicleMp) {
        if(!vehicle) return;
        let vehicleData: VehicleData | undefined = getVehicleData(vehicle);

        mp.gui.chat.push(vehicleData?.vehicle_health + " __ " + vehicle.getHealth());

        if(vehicleData && vehicleData.vehicle_health != vehicle.getHealth()) {
            mp.events.callRemote(VehicleDamage.saveDamageEvent);

            await mp.game.waitAsync(350);
            VehicleDamage.updateVehicleHealth(vehicle);
        }
    }

    public static updateVehicleHealth(vehicle: VehicleMp) {
        if(vehicle && mp.vehicles.at(vehicle.remoteId)) {
            let vehicleData: VehicleData | undefined = getVehicleData(vehicle);

            if(vehicleData) {
                vehicle.setHealth(vehicleData.vehicle_health);
            }
        }
    }
}

export default VehicleDamage;