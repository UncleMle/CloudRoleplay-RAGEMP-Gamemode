import { VehicleData } from "@/@types";
import getVehicleData from "@/PlayerMethods/getVehicleData";

class VehicleDamage {
    public static LocalPlayer: PlayerMp;
    public static readonly saveDamageEvent: string = "server:saveVehicleDamage";
    public static _updateInterval: ReturnType<typeof setInterval> | undefined;

    constructor() {
        VehicleDamage.LocalPlayer = mp.players.local;

        mp.events.add("playerEnterVehicle", (veh: VehicleMp) => VehicleDamage.handleEnterOrLeave(veh, true));
        mp.events.add("playerLeaveVehicle", VehicleDamage.handleEnterOrLeave);
    }

    public static async handleEnterOrLeave(vehicle: VehicleMp, isEnterEvent: boolean = false) {
        if(!vehicle) return;
        let vehicleData: VehicleData | undefined = getVehicleData(vehicle);

        if(vehicleData) {
            vehicle.setHealth(vehicleData.vehicle_health);
        }

        isEnterEvent ? VehicleDamage.startInterval() : VehicleDamage.closeInterval();
    }

    public static startInterval() {
        VehicleDamage._updateInterval = setInterval(async () => {
            if(VehicleDamage.LocalPlayer.vehicle) {
                let vehicleData: VehicleData | undefined = getVehicleData(VehicleDamage.LocalPlayer.vehicle);

                if(vehicleData && vehicleData.vehicle_health != VehicleDamage.LocalPlayer.vehicle.getHealth()) {
                    mp.events.callRemote(VehicleDamage.saveDamageEvent);
                    await mp.game.waitAsync(500);
                }
            }
        }, 1000);
    }

    public static closeInterval() {
        if(VehicleDamage._updateInterval) {
            clearInterval(VehicleDamage._updateInterval);
            VehicleDamage._updateInterval = undefined;
        }
    }
}

export default VehicleDamage;