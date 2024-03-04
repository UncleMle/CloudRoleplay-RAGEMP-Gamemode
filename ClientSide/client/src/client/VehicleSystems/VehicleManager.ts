export default class VehicleManager {
    public static spawnedVehicles: VehicleMp[] = []; 

    public static createVehicle(spawnName: string, spawn: Vector3, c1: number, c2: number, invincible: boolean = false, plate: string = "N/A", dim: number = 0): VehicleMp {
        let veh: VehicleMp = mp.vehicles.new(spawnName, spawn, {
            alpha: 255,
            color: [[c1, c1, c1], [c2, c2, c2]],
            numberPlate: plate,
            dimension: dim
        });

        VehicleManager.spawnedVehicles.push(veh);

        if(invincible) {
            veh.setCanBeVisiblyDamaged(false);
            veh.setCanBreak(false);
            veh.setDeformationFixed();
            veh.setDirtLevel(0);
            veh.setDisablePetrolTankDamage(true);
            veh.setDisablePetrolTankFires(true);
            veh.setInvincible(true);
        }

        return veh;
    }
}