class VehicleFuel {
    public static LocalPlayer: PlayerMp;
    public static _updateInterval: ReturnType<typeof setInterval> | undefined;
    public static interval_seconds: number = 5;
    public static updateEvent: string = "server:updateVehicleFuel";

    constructor() {
        VehicleFuel.LocalPlayer = mp.players.local;

        mp.events.add("playerEnterVehicle", VehicleFuel.handleEnter);
        mp.events.add("playerLeaveVehicle", VehicleFuel.handleExit);
    }

    public static handleEnter(vehicle: VehicleMp, seat: number) {
        if(seat == -1) {
            VehicleFuel.closeSaveInterval();

            VehicleFuel._updateInterval = setInterval(() => {
                let vehicleSpeed: number = VehicleFuel.LocalPlayer.vehicle.getSpeed() * 3.6;

                if(vehicleSpeed > 0) {

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