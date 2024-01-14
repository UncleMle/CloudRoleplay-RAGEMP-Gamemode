import { _SHARED_VEHICLE_DATA } from "@/Constants/Constants";
import { VehicleData } from "../@types";
import getVehicleData from "../PlayerMethods/getVehicleData";

export default class VehicleWindows {
	public static LocalPlayer: PlayerMp = mp.players.local;

	constructor() {
		mp.events.add("entityStreamIn", VehicleWindows.handleStreamIn);
		mp.events.addDataHandler(_SHARED_VEHICLE_DATA, VehicleWindows.handleDataHandler);
	}

	private static handleDataHandler(entity: VehicleMp, data: VehicleData) {
		if(entity.type === "vehicle" && data !== undefined) {
			let vehicleData: VehicleData | undefined = getVehicleData(entity as VehicleMp);

			if (!vehicleData || !vehicleData.vehicle_windows) return;

			VehicleWindows.syncWindowState(entity, vehicleData);
		}
	}

	private static handleStreamIn(entity: EntityMp) {
		if(entity.type === "vehicle") {
			let vehicleData: VehicleData | undefined = getVehicleData(entity as VehicleMp);

			if (!vehicleData || !vehicleData.vehicle_windows) return;

			VehicleWindows.syncWindowState(entity as VehicleMp, vehicleData);
		}
	}

	private static syncWindowState(entity: VehicleMp, vehicleData: VehicleData) {
		vehicleData.vehicle_windows.forEach((state: string, index: number) => {
			if (state) entity.rollDownWindow(index);
			else if (!state) {
				if (entity.isWindowIntact(index)) {
					entity.fixWindow(index);
				}

				entity.rollUpWindow(index);
			}
		});
	}
}