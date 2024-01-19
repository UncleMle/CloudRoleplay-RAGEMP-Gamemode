export default class TrailerSync {
    public static trailers: Map<number, VehicleMp | null> = new Map();
    public static readonly _trailerSharedKey = "truckerVehicleTrailerData";

    constructor() {
        mp.events.add({
            "entityStreamIn": TrailerSync.handleStreamIn,
            "entityStreamOut": TrailerSync.handleStreamOut
        })
    }

    public static async attachTrailerByVehicle(truck: VehicleMp, trailer: VehicleMp): Promise<void> {
        let reAttachInterval = setInterval(() => {
            if (mp.vehicles.exists(truck)) {
                if (truck.getVariable(TrailerSync._trailerSharedKey) != null) {
                    TrailerSync.createTrailer(truck, truck.position);
                    if (mp.vehicles.exists(trailer)) {
                        trailer.setCanBeVisiblyDamaged(false);
                        trailer.setCanBreak(false);
                        trailer.setDeformationFixed();
                        trailer.setDirtLevel(0);
                        trailer.setDisablePetrolTankDamage(true);
                        trailer.setDisablePetrolTankFires(true);
                        trailer.setInvincible(true);
                    } else {
                        if (reAttachInterval) clearInterval(reAttachInterval);
                    }
                }
            } else {
                if (reAttachInterval) clearInterval(reAttachInterval);
            }
        }, 1000);
    }

    public static createTrailer(truck: VehicleMp, position: any) {
        if (TrailerSync.trailers.get(truck.remoteId) != null) {
            setTimeout(() => {
                truck.attachToTrailer(TrailerSync.trailers.get(truck.remoteId)?.handle, 1000);
            }, 50);
            return;
        }

        let trailer = mp.vehicles.new(mp.game.joaat(truck.getVariable(TrailerSync._trailerSharedKey)), position, {
            heading: truck.getHeading(),
            numberPlate: "TRAILER"
        });

        TrailerSync.trailers.set(truck.remoteId, trailer);

        if (trailer != null) {
            setTimeout(() => {
                truck.attachToTrailer(trailer.handle, 1000);
                TrailerSync.attachTrailerByVehicle(truck, trailer);
            }, 200);
        }
    }

    private static handleStreamIn(entity: EntityMp) {
        if (entity && entity.type == "vehicle" && mp.vehicles.exists(entity as VehicleMp)) {
            if (entity.getVariable(TrailerSync._trailerSharedKey) != null) {
                TrailerSync.createTrailer(entity as VehicleMp, entity.position);
            }
        }
    }

    private static handleStreamOut(entity: EntityMp) {
        if (entity && entity.type == "vehicle" && mp.vehicles.exists(entity as VehicleMp)) {
            if (entity.getVariable(TrailerSync._trailerSharedKey) != null) {
                if (TrailerSync.trailers.get(entity.remoteId) != null) {
                    TrailerSync.trailers.get(entity.remoteId)?.destroy();
                    TrailerSync.trailers.set(entity.remoteId, null);
                }
            }
        }
    }
}