import getVehicleData from "@/PlayerMethods/getVehicleData";

export default class VehicleStall {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static oldVehicleDmg: number;
    public static readonly damageCheck_seconds: number = 5;
    public static checkInterval: ReturnType<typeof setInterval> | undefined;

    constructor() {
        mp.events.add({
            "playerEnterVehicle": VehicleStall.handlePlayerEnterVeh,
            "playerLeaveVehicle": VehicleStall.handlePlayerLeaveVeh
        });

        VehicleStall.handleDamageCheck();
    }

    private static handlePlayerLeaveVeh(vehicle: VehicleMp) {
        if (mp.vehicles.at(vehicle.remoteId) && VehicleStall.checkInterval) {
            VehicleStall.clearCheck();
        }
    }

    private static clearCheck() {
        if (VehicleStall.checkInterval) {
            clearInterval(VehicleStall.checkInterval);
            VehicleStall.checkInterval = undefined;
        }
    }

    private static startCheck() {
        VehicleStall.clearCheck();

        VehicleStall.checkInterval = setInterval(() => {
            VehicleStall.handleDamageCheck();
        }, VehicleStall.damageCheck_seconds * 1000);
    }

    private static handlePlayerEnterVeh(vehicle: VehicleMp, seat: number) {
        if (seat && mp.vehicles.at(vehicle.remoteId)) {
            VehicleStall.oldVehicleDmg = vehicle.getBodyHealth();
            VehicleStall.startCheck();
        }
    }

    private static handleDamageCheck() {
        if (VehicleStall.LocalPlayer.vehicle && getVehicleData(VehicleStall.LocalPlayer.vehicle)) {

            if ((VehicleStall.LocalPlayer.vehicle.getBodyHealth() - VehicleStall.oldVehicleDmg) > 5) {
                mp.gui.chat.push("Stalled");
            }

            if ((VehicleStall.LocalPlayer.vehicle.getBodyHealth() - VehicleStall.oldVehicleDmg) > 5) {
                mp.gui.chat.push("Stalled 2");
            }

            VehicleStall.oldVehicleDmg = VehicleStall.LocalPlayer.vehicle.getBodyHealth();
        }
    }
}