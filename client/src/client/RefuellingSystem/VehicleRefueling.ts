import { RefuelStation } from "@/@types";
import { _control_ids } from "@/Constants/Constants";
import NotificationSystem from "@/NotificationSystem/NotificationSystem";

class VehicleRefueling {
    public static LocalPlayer: PlayerMp;
    public static _refuelPumpIdenfitier: string = "refuelingPumpData";
    public static _refuelServerEvent: string = "server:beginRefuelOfVehicle";
    public static refuelInterval: ReturnType<typeof setInterval> | undefined;
    public static _refuelInterval_seconds: number = 3;

    constructor() {
        VehicleRefueling.LocalPlayer = mp.players.local;

        mp.keys.bind(_control_ids.Y, false, VehicleRefueling.handleKeyPress_Y);
    }

    private static handleKeyPress_Y() {
        let refuelStationData: RefuelStation | undefined = VehicleRefueling.LocalPlayer.getVariable(this._refuelPumpIdenfitier);

        if(refuelStationData) {
            this.endRefuelling(false);

            NotificationSystem.createNotification("~w~Hold down the ~y~Y~w~ key to continue refuelling your vehicle.", false);

            this.refuelInterval = setInterval(() => {
                if(mp.keys.isDown(_control_ids.Y)) {
                    mp.events.callRemote(VehicleRefueling._refuelServerEvent);
                } else {
                    this.endRefuelling();
                }
            }, this._refuelInterval_seconds * 1000);
        }
    }

    private static endRefuelling(sendNotif: boolean = true) {
        if(this.refuelInterval) {
            if(sendNotif) {
                NotificationSystem.createNotification("~r~You have stopped refuelling your vehicle.");
            }

            clearInterval(this.refuelInterval);
            this.refuelInterval = undefined;
        }
    }
}

export default VehicleRefueling;