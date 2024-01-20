export default class TrailerSync {
    public static trailers: Map<number, VehicleMp | null> = new Map();
    public static readonly _trailerSharedKey = "truckerVehicleTrailerData";

    constructor() {
        setInterval(() => {
            mp.vehicles.forEachInStreamRange(trailer => {
                if (trailer.getVariable(TrailerSync._trailerSharedKey)) {
                    trailer.setCanBeVisiblyDamaged(false);
                    trailer.setCanBreak(false);
                    trailer.setDeformationFixed();
                    trailer.setDirtLevel(0);
                    trailer.setDisablePetrolTankDamage(true);
                    trailer.setDisablePetrolTankFires(true);
                    trailer.setInvincible(true);

                    let targetVeh: VehicleMp | null | undefined = mp.vehicles.atRemoteId(trailer.getVariable(TrailerSync._trailerSharedKey));

                    if (targetVeh) {
                        targetVeh.attachToTrailer(trailer.handle, 1000);
                    }
                }
            });
        }, 1000);
    }
}