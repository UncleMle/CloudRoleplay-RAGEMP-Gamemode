import NotificationSystem from "@/NotificationSystem/NotificationSystem";
import { VehicleData } from "../@types";
import { _control_ids } from "../Constants/Constants";
import getVehicleData from "../PlayerMethods/getVehicleData";
import { Browsers } from "@/enums";

class VehicleEngine {
	public static LocalPlayer: PlayerMp;
	public static engineToggleEvent: string = "server:toggleEngine";

	constructor() {
		VehicleEngine.LocalPlayer = mp.players.local;

		mp.events.add("render", VehicleEngine.engineSync);
		mp.keys.bind(_control_ids.Y, false, VehicleEngine.toggleEngine);
	}

	public static toggleEngine() {
		if (VehicleEngine.LocalPlayer.vehicle && !VehicleEngine.LocalPlayer.isTypingInTextChat && VehicleEngine.LocalPlayer.vehicle.getPedInSeat(-1) == VehicleEngine.LocalPlayer.handle && VehicleEngine.LocalPlayer.browserRouter != Browsers.ModsView) {
			let vehicleData: VehicleData | undefined = getVehicleData(VehicleEngine.LocalPlayer.vehicle);
			if (!vehicleData) return;

			if(vehicleData.vehicle_fuel <= 0) {
				NotificationSystem.createNotification("~r~Engine fails to start.", false);
				return;
			}

			mp.events.callRemote(VehicleEngine.engineToggleEvent);
		}
	}

	public static engineSync() {
		mp.vehicles.forEachInStreamRange((vehicle: VehicleMp) => {
			let vehicleData: VehicleData | undefined = getVehicleData(vehicle);
			if (!vehicleData || vehicleData.engine_status == null) return;

			if (vehicleData.engine_status && vehicleData.vehicle_fuel > 0) {
				vehicle.setEngineOn(true, true, false);
			} else if (!vehicleData.engine_status) {
				vehicle.setEngineOn(true, true, false);
				vehicle.setUndriveable(true);
			}
		})
	}

}

export default VehicleEngine;
