export default class VehicleTyreSync {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static vehicleTyreState: boolean[] = [
        false, false, false, false, false, false, false
    ];
    public static vehicleTyreStateOld: boolean[] = [
        false, false, false, false, false, false, false
    ];
    public static readonly vehicleWheelIds: number[] = [
        0, 1, 4, 5
    ];
    public static readonly _vehicleTyreServerEvent: string = "server:vehicleSystems:syncTyres";

    constructor() {
        mp.events.add("playerEnterVehicle", VehicleTyreSync.updateOldState);

        setInterval(() => {
            VehicleTyreSync.handleSync();
        }, 500);
    }

    private static updateOldState(vehicle: VehicleMp) {
        for (let i = 0; i < VehicleTyreSync.vehicleWheelIds.length; i++) {
            VehicleTyreSync.vehicleTyreStateOld[i] = vehicle.isTyreBurst(VehicleTyreSync.vehicleWheelIds[i], false);
        }

        mp.gui.chat.push("Tyre Sync " + JSON.stringify(VehicleTyreSync.vehicleTyreStateOld));
    }

    private static async handleSync() {
        if (!VehicleTyreSync.LocalPlayer.vehicle) return;

        let veh: VehicleMp = VehicleTyreSync.LocalPlayer.vehicle;

        for (let i = 0; i < VehicleTyreSync.vehicleWheelIds.length; i++) {
            VehicleTyreSync.vehicleTyreState[i] = veh.isTyreBurst(VehicleTyreSync.vehicleWheelIds[i], false);
        }

        let dif: boolean = false;

        for (let i = 0; i < VehicleTyreSync.vehicleWheelIds.length; i++) {
            if (VehicleTyreSync.vehicleTyreState[i] !== VehicleTyreSync.vehicleTyreStateOld[i]) dif = true;
        }

        if (dif) {
            mp.gui.chat.push("Dif set");
            VehicleTyreSync.vehicleTyreStateOld = VehicleTyreSync.vehicleTyreState;

            mp.events.callRemote(VehicleTyreSync._vehicleTyreServerEvent, JSON.stringify(VehicleTyreSync.vehicleTyreState));
        }
    }
}