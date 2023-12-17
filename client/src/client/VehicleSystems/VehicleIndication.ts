import { VehicleData } from "../@types";
import { _control_ids } from "../Constants/Constants";
import getVehicleData from "../PlayerMethods/getVehicleData";
import { _SHARED_VEHICLE_DATA } from 'Constants/Constants';

class VehicleIndicators {
	private static eventName: string = "server:toggleIndication";
	public static LocalPlayer: PlayerMp;

	constructor() {
		VehicleIndicators.LocalPlayer = mp.players.local;

		mp.events.add("entityStreamIn", VehicleIndicators.handleVehicleStreamIn);
		mp.events.addDataHandler(_SHARED_VEHICLE_DATA, VehicleIndicators.handleDataHandler);

		mp.keys.bind(_control_ids.LEFTARR, false, () => VehicleIndicators.handleVehicleIndicator(1));
		mp.keys.bind(_control_ids.RIGHTARR, false, () => VehicleIndicators.handleVehicleIndicator(0));
	}

	public static handleVehicleStreamIn(entity: VehicleMp) {
		if (entity.type != "vehicle") return;
		let vehicleData: VehicleData | undefined = getVehicleData(entity);
		if (!vehicleData) return;

		if (vehicleData.indicator_status != -1) {
			entity.setIndicatorLights(-1, true);
		} else {
			entity.setIndicatorLights(1, false);
			entity.setIndicatorLights(0, false);
		}
	}

	public static handleDataHandler(entity: VehicleMp, data: VehicleData) {
		if (entity.type != "vehicle" || !data) return;

		if (data.indicator_status != -1) {
			entity.setIndicatorLights(-1, true);
		} else {
			entity.setIndicatorLights(1, false);
			entity.setIndicatorLights(0, false);
		}
	}

	public static handleVehicleIndicator(indicateId: number) {
		if (VehicleIndicators.LocalPlayer.vehicle && !VehicleIndicators.LocalPlayer.isTypingInTextChat) {
			let vehicleData: VehicleData | undefined = getVehicleData(VehicleIndicators.LocalPlayer.vehicle);
			if (!vehicleData) return;

			if (vehicleData.indicator_status == indicateId) {
				indicateId = -1;
			}

			mp.events.callRemote(VehicleIndicators.eventName, indicateId);
		}

	}
}

export default VehicleIndicators;
