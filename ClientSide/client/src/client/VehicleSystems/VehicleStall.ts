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
            VehicleStall.oldVehicleDmg = vehicle.getBodyHealth();
            VehicleStall.startCheck();
        }
    }

    private static handleDamageCheck() {
        if (VehicleStall.LocalPlayer.vehicle && getVehicleData(VehicleStall.LocalPlayer.vehicle)) {
            if ((VehicleStall.oldVehicleDmg - VehicleStall.LocalPlayer.vehicle.getBodyHealth()) > 9) {
                mp.events.callRemote(VehicleStall.beginStallEvent, StallTypes.Medium);
                VehicleStall.oldVehicleDmg = VehicleStall.LocalPlayer.vehicle.getBodyHealth();
                return;
            }

            if ((VehicleStall.oldVehicleDmg - VehicleStall.LocalPlayer.vehicle.getBodyHealth()) > 4) {
                mp.events.callRemote(VehicleStall.beginStallEvent, StallTypes.Small);
                VehicleStall.oldVehicleDmg = VehicleStall.LocalPlayer.vehicle.getBodyHealth();
                return;
            }

            VehicleStall.oldVehicleDmg = VehicleStall.LocalPlayer.vehicle.getBodyHealth();
        }
    }
}