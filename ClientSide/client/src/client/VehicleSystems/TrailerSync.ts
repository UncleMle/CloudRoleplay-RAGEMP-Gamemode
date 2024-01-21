export default class TrailerSync {
    public static trailers: Map<number, VehicleMp | null> = new Map();
    public static readonly _trailerSharedKey = "truckerVehicleTrailerData";

    constructor() {
        mp.events.add({
            "entityStreamIn": TrailerSync.handleStreamIn,
            "entityStreamOut": TrailerSync.handleStreamOut
        });

        mp.events.addDataHandler(TrailerSync._trailerSharedKey, TrailerSync.handleDataHandler);

        setInterval(() => {
            mp.vehicles.forEachInStreamRange(truck => {
                if (truck.getVariable(TrailerSync._trailerSharedKey)) {
                    TrailerSync.createTrailer(truck, truck.position);

                    let trailer: VehicleMp | null | undefined = TrailerSync.trailers.get(truck.remoteId);

                    if (trailer && mp.vehicles.atHandle(trailer.handle)) {
                        trailer.setCanBeVisiblyDamaged(false);
                        trailer.setCanBreak(false);
                        trailer.setDeformationFixed();
                        trailer.setDirtLevel(0);
                        trailer.setDisablePetrolTankDamage(true);
                        trailer.setDisablePetrolTankFires(true);
                        trailer.setInvincible(true);
                    }
                }
            });
        }, 1000);
    }

    public static async createTrailer(truck: VehicleMp, position: any) {
        let existingTrailer: VehicleMp | null | undefined = TrailerSync.trailers.get(truck.remoteId);

        if (existingTrailer) {
            await mp.game.waitAsync(50);

            if (mp.vehicles.atHandle(existingTrailer.handle)) {
                truck.attachToTrailer(existingTrailer.handle, 1000);
            }
            return;
        }

        let trailer: VehicleMp = mp.vehicles.new(mp.game.joaat(truck.getVariable(TrailerSync._trailerSharedKey)), position, {
            heading: truck.getHeading(),
            numberPlate: "TRAILER"
        });

        TrailerSync.trailers.set(truck.remoteId, trailer);

        if (trailer) {
            await mp.game.waitAsync(200);

            if (truck && mp.vehicles.at(truck.remoteId)) {
                truck.attachToTrailer(trailer.handle, 1000);
            }
        }
    }

    private static handleDataHandler(entity: EntityMp, trailer: string) {
        if(entity.type === "vehicle" && trailer !== undefined) {
            let existingTrailer: VehicleMp | null | undefined = TrailerSync.trailers.get(entity.remoteId);

            if(existingTrailer) {
                existingTrailer.destroy();
                TrailerSync.trailers.set(entity.remoteId, null);
            }

            TrailerSync.createTrailer(entity as VehicleMp, entity.position);
        }
    }

    private static async handleStreamIn(entity: EntityMp) {
        if (entity && entity.type == "vehicle" && entity.getVariable(TrailerSync._trailerSharedKey)) {
            await mp.game.waitAsync(1500);

            if (mp.vehicles.at(entity.remoteId)) {
                TrailerSync.createTrailer(entity as VehicleMp, entity.position);
            }
        }
    }

    private static handleStreamOut(entity: EntityMp) {
        if (entity && entity.type == "vehicle" && entity.getVariable(TrailerSync._trailerSharedKey)) {
            let trailer: VehicleMp | null | undefined = TrailerSync.trailers.get(entity.remoteId);

            if (trailer && mp.vehicles.atHandle(trailer.handle)) {
                trailer.destroy();
                TrailerSync.trailers.set(entity.remoteId, null);
            }
        }
    }
}