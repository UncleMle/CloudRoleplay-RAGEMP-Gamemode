import getVehicleData from "@/PlayerMethods/getVehicleData";
import { StallTypes } from "@/enums";

export default class VehicleStall {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static oldVehicleDmg: number;
    public static readonly damageCheck_seconds: number = 1;
    public static readonly beginStallEvent: string = "server:stallVehicle";
    public static readonly isStalledKey: string = "vehicleIsStalledDataKey";
    public static checkInterval: ReturnType<typeof setInterval> | undefined;

    constructor() {
        mp.events.add({
            "playerEnterVehicle": VehicleStall.handlePlayerEnterVeh,
            "playerLeaveVehicle": VehicleStall.handlePlayerLeaveVeh,
            "render": VehicleStall.handleRender
        });
    }

    private static handleRender() {
        if (VehicleStall.LocalPlayer.vehicle && VehicleStall.LocalPlayer.vehicle.getVariable(VehicleStall.isStalledKey)) {
            VehicleStall.LocalPlayer.vehicle.setUndriveable(true);

            mp.game.graphics.drawText("~r~Vehicle is stalled.", [0.5, 0.72], {
                font: 4,
                color: [255, 255, 255, 255],
                scale: [0.45, 0.45],
                outline: false
            });
        }
    }

    private static handlePlayerLeaveVeh(vehicle: VehicleMp) {
        if (vehicle && mp.vehicles.at(vehicle.remoteId) && VehicleStall.checkInterval) {
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
        if (seat && vehicle && mp.vehicles.at(vehicle.remoteId)) {
            VehicleStall.oldVehicleDmg = vehicle.getHealth();
            VehicleStall.startCheck();
        }
    }

    private static handleDamageCheck() {
        if (VehicleStall.LocalPlayer.vehicle && getVehicleData(VehicleStall.LocalPlayer.vehicle)) {
            let difference: number = Math.round(VehicleStall.oldVehicleDmg / 10) - Math.round(VehicleStall.LocalPlayer.vehicle.getHealth() / 10);

            if (difference > 8) {
                VehicleStall.beginStall(StallTypes.Medium);
                return;
            }

            if (difference > 2) {
                VehicleStall.beginStall(StallTypes.Small);
                return;
            }

            VehicleStall.oldVehicleDmg = VehicleStall.LocalPlayer.vehicle.getHealth();
        }
    }

    private static beginStall(type: StallTypes) {
        if (VehicleStall.LocalPlayer.vehicle) {
            mp.events.callRemote(VehicleStall.beginStallEvent, type);
            VehicleStall.oldVehicleDmg = VehicleStall.LocalPlayer.vehicle.getHealth();
        }
    }
}