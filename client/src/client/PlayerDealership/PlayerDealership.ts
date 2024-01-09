import { VehicleData } from "@/@types";
import getVehicleData from "@/PlayerMethods/getVehicleData";

export default class PlayerDealership {
    public static LocalPlayer: PlayerMp = mp.players.local;
    
    constructor() {
        mp.events.add({
            "playerEnterVehicle": PlayerDealership.handleVehEnter,
            "entityStreamIn": PlayerDealership.handleEntityStreamIn
        });
    }

    private static handleVehEnter(vehicle: VehicleMp) {
        let vehicleData: VehicleData | undefined = getVehicleData(vehicle);

        if(vehicleData && vehicleData.dealership_id != -1 && vehicleData.dealership_spot_id != -1) {
            vehicle.freezePosition(true);

            mp.gui.chat.push("Frozen");
        }   
    } 
    
    private static handleEntityStreamIn(vehicle: EntityMp) {
        if(vehicle.type === "vehicle") {
            let vehicleData: VehicleData | undefined = getVehicleData(vehicle as VehicleMp);

            if(vehicleData && vehicleData.dealership_id != -1 && vehicleData.dealership_spot_id != -1) {
                vehicle.freezePosition(true);
            }   
        }
    } 
}