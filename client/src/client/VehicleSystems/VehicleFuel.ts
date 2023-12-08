import { VehicleData } from "@/@types";
import getVehicleData from "@/PlayerMethods/getVehicleData";

class VehicleFuel {
    public static LocalPlayer: PlayerMp;
    public static _updateInterval: ReturnType<typeof setInterval> | undefined;
    public static interval_seconds: number = 5;
    public static updateEvent: string = "server:updateVehicleFuel";

    constructor() {
        VehicleFuel.LocalPlayer = mp.players.local;

        mp.events.add("playerEnterVehicle", VehicleFuel.handleEnter);
        mp.events.add("playerLeaveVehicle", VehicleFuel.handleExit);
        mp.events.add("render", VehicleFuel.handleRender);
    }

    public static handleRender() {
        if(VehicleFuel.LocalPlayer.vehicle && VehicleFuel.LocalPlayer.vehicle.getPedInSeat(-1) == VehicleFuel.LocalPlayer.handle) {
            let vehicleData: VehicleData | undefined = getVehicleData(VehicleFuel.LocalPlayer.vehicle);
            if(!vehicleData) return;

            if(vehicleData.vehicle_fuel <= 0) {
                VehicleFuel.LocalPlayer.vehicle.setUndriveable(true);
                VehicleFuel.renderNoFuelText();
            }
        }
    }

    public static renderNoFuelText() {
        mp.game.graphics.drawText("~r~This vehicle has ran out of fuel.", [0.5, 0.86], {
            font: 4,
            color: [255, 255, 255, 175],
            scale: [0.55, 0.55],
            outline: false
        });
    }

    public static handleEnter(vehicle: VehicleMp, seat: number) {
        if(seat == -1) {
            VehicleFuel.closeSaveInterval();

            VehicleFuel._updateInterval = setInterval(() => {
                if(!vehicle) {
                    VehicleFuel.closeSaveInterval();
                    return;
                }

                let vehicleSpeed: number = VehicleFuel.LocalPlayer.vehicle.getSpeed() * 3.6;
                let vehicleData: VehicleData | undefined = getVehicleData(VehicleFuel.LocalPlayer.vehicle);

                if(vehicleSpeed > 0 && vehicleData?.engine_status) {
                    mp.events.callRemote(VehicleFuel.updateEvent, vehicleSpeed);
                }
            }, VehicleFuel.interval_seconds * 1000);
        }
    }

    public static handleExit() {
        VehicleFuel.closeSaveInterval();
    }

    public static closeSaveInterval() {
        if(VehicleFuel._updateInterval) {
            clearInterval(VehicleFuel._updateInterval);
            VehicleFuel._updateInterval = undefined;
        }
    }
}

export default VehicleFuel;