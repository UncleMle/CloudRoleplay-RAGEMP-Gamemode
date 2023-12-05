import { VehicleData } from "../@types";
import { _control_ids } from "../Constants/Constants";
import getVehicleData from "../PlayerMethods/getVehicleData";

class VehicleEngine {
	public static LocalPlayer: PlayerMp;

	constructor() {
		VehicleEngine.LocalPlayer = mp.players.local;

		mp.events.add("render", VehicleEngine.engineSync);
		mp.keys.bind(_control_ids.Y, false, VehicleEngine.toggleEngine);
	}

	public static toggleEngine() {
		if (VehicleEngine.LocalPlayer.vehicle && !VehicleEngine.LocalPlayer.isTypingInTextChat) {
			let vehicleData: VehicleData | undefined = getVehicleData(VehicleEngine.LocalPlayer.vehicle);
			if (!vehicleData) return;

			mp.events.callRemote("server:toggleEngine");

		}
	}

	public static engineSync() {
		mp.vehicles.forEachInStreamRange((vehicle: VehicleMp) => {
			let vehicleData: VehicleData | undefined = getVehicleData(vehicle);
			if (!vehicleData || vehicleData.engine_status == null) return;

			if (vehicleData.engine_status) {
				vehicle.setEngineOn(true, true, false);
			} else if (!vehicleData.engine_status) {
				vehicle.setEngineOn(true, true, false);
				vehicle.setUndriveable(true);
			}
		})
	}

}

export default VehicleEngine;
