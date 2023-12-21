import NotificationSystem from "@/NotificationSystem/NotificationSystem";
import { VehicleData } from "../@types";
import { _SHARED_VEHICLE_DATA, _control_ids } from "../Constants/Constants";
import getVehicleData from "../PlayerMethods/getVehicleData";
import { Browsers } from "@/enums";
import getTargetCharacterData from "@/PlayerMethods/getTargetCharacterData";
import HandsUp from "@/Animation/HandsUpAnim";

class VehicleEngine {
	public static LocalPlayer: PlayerMp;
	public static engineToggleEvent: string = "server:toggleEngine";

	constructor() {
		VehicleEngine.LocalPlayer = mp.players.local;

		mp.events.add("playerReady", VehicleEngine.handleStartUp);
		mp.events.add("entityStreamIn", VehicleEngine.handleStreamIn);
		mp.events.addDataHandler(_SHARED_VEHICLE_DATA, VehicleEngine.handleDataHandler);
		mp.keys.bind(_control_ids.Y, false, VehicleEngine.toggleEngine);
	}

	public static handleStartUp() {
		mp.game.vehicle.defaultEngineBehaviour = false;
	}

	public static async handleStreamIn(entity: VehicleMp) {
		let vehicleData: VehicleData | undefined = getVehicleData(entity);
		if(entity.type == "vehicle" && vehicleData && vehicleData.engine_status && vehicleData.vehicle_fuel > 0) {

			for (let i = 0; entity.handle === 0 && i < 15; ++i) {
				await mp.game.waitAsync(100);
			}

			entity.setEngineOn(true, true, true);
		}
	}

	public static handleDataHandler(entity: VehicleMp, vehicleData: VehicleData) {
		if(entity.type != "vehicle" || !vehicleData) return;

		if(VehicleEngine.LocalPlayer.vehicle && VehicleEngine.LocalPlayer.vehicle == entity && VehicleEngine.LocalPlayer.browserRouter == Browsers.ModsView) return;
		if(mp.players.atHandle(entity.getPedInSeat(-1)) && mp.players.atHandle(entity.getPedInSeat(-1)).getVariable(HandsUp._handsUpAnimIdentifer)) return;

		if(vehicleData.engine_status) {
			entity.setEngineOn(true, true, true);
		} else {
			entity.setEngineOn(false, true, true);
			entity.setUndriveable(true);
		}
	}

	public static toggleEngine() {
		if (VehicleEngine.LocalPlayer.vehicle && !VehicleEngine.LocalPlayer.isTypingInTextChat && VehicleEngine.LocalPlayer.vehicle.getPedInSeat(-1) == VehicleEngine.LocalPlayer.handle && VehicleEngine.LocalPlayer.browserRouter != Browsers.ModsView) {
			let vehicleData: VehicleData | undefined = getVehicleData(VehicleEngine.LocalPlayer.vehicle);
			if (!vehicleData) return;

			if(vehicleData.vehicle_fuel <= 0 || vehicleData.vehicle_health <= 0) {
				NotificationSystem.createNotification("~r~Engine fails to start.", false);
				return;
			}

			mp.events.callRemote(VehicleEngine.engineToggleEvent);
		}
	}
}

export default VehicleEngine;
