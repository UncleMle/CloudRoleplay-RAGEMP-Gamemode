export default class VehicleTyreSync {
    public static LocalPlayer: PlayerMp = mp.players.local;
    public static readonly _vehicleTyreServerEvent: string = "server:vehicleSystems:syncTyres";
    public static readonly _tyreStateKey: string = "server:vehicleSystem:tyreSync";

    constructor() {
        mp.events.add({
            "render": VehicleTyreSync.handleRender,
            "entityStreamIn": VehicleTyreSync.handleStreamIn
        });

        mp.events.addDataHandler(VehicleTyreSync._tyreStateKey, VehicleTyreSync.handleDataHandler);
    }

    private static handleDataHandler(vehicle: VehicleMp, data: boolean[]) {
        if (vehicle.type !== "vehicle" || data === undefined) return;

        VehicleTyreSync.applySync(vehicle, data);
    }

    private static handleStreamIn(vehicle: EntityMp) {
        if (vehicle.type !== "vehicle" || !vehicle.getVariable(VehicleTyreSync._tyreStateKey)) return;

        VehicleTyreSync.applySync(vehicle);
    }

    private static applySync(vehicle: EntityMp, newData: boolean[] = []) {
        if (!vehicle.getVariable(VehicleTyreSync._tyreStateKey)) return;

        let tyreStates: boolean[] = vehicle.getVariable(VehicleTyreSync._tyreStateKey);

        if (newData.length > 0) tyreStates = newData;

        for (let i = 0; i < 6; i++) {
            if (tyreStates[i]) (vehicle as VehicleMp).setTyreBurst(i, true, 1000);
        }
    }

    private static async handleRender() {
        if (!VehicleTyreSync.LocalPlayer.vehicle) return;

        let veh: VehicleMp = VehicleTyreSync.LocalPlayer.vehicle;

        let tyres: boolean[] = [];

        for (let i = 0; i < 6; i++) {
            tyres.push(veh.isTyreBurst(i, false));
        }

        let currentTyres: boolean[] = veh.getVariable(VehicleTyreSync._tyreStateKey) ? veh.getVariable(VehicleTyreSync._tyreStateKey) : [];

        let isDif: boolean = JSON.stringify(tyres) !== JSON.stringify(currentTyres);

        if (isDif) {
            mp.events.callRemote(VehicleTyreSync._vehicleTyreServerEvent, JSON.stringify(tyres));
            await mp.game.waitAsync(500);
        }
    }

}