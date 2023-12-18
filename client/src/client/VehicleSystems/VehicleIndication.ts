import validateKeyPress from "@/PlayerMethods/validateKeyPress";
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

		mp.keys.bind(_control_ids.LEFTARR, false, () => validateKeyPress() && VehicleIndicators.handleVehicleIndicator(1));
		mp.keys.bind(_control_ids.RIGHTARR, false, () => validateKeyPress() && VehicleIndicators.handleVehicleIndicator(0));
	}

	public static handleVehicleStreamIn(entity: VehicleMp) {
		if (entity.type != "vehicle") return;
		let vehicleData: VehicleData | undefined = getVehicleData(entity);
		if (!vehicleData) return;

		VehicleIndicators.setIndicationForVeh(entity, vehicleData.indicator_status);
	}

	public static handleDataHandler(entity: VehicleMp, data: VehicleData) {
		if (entity.type != "vehicle" || !data) return;

		VehicleIndicators.setIndicationForVeh(entity, data.indicator_status);
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

	public static setIndicationForVeh(entity: VehicleMp, indicatorStatus: number) {
		entity.setIndicatorLights(0, false);
		entity.setIndicatorLights(1, false);

		if(indicatorStatus != -1 && typeof indicatorStatus == "number") {
			entity.setIndicatorLights(indicatorStatus, true);
		}
	}
}

export default VehicleIndicators;
