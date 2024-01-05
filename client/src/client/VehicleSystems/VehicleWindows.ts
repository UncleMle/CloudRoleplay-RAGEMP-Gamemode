import { VehicleData } from "../@types";
import getVehicleData from "../PlayerMethods/getVehicleData";

export default class VehicleWindows {
	public static LocalPlayer: PlayerMp;

	constructor() {
		VehicleWindows.LocalPlayer = mp.players.local;

		mp.events.add("render", VehicleWindows.vehicleWindowSync);
	}

	public static vehicleWindowSync() {
		mp.vehicles.forEachInStreamRange((veh: VehicleMp) => {
			let vehicleData: VehicleData | undefined = getVehicleData(veh);

			if (!vehicleData || !vehicleData.vehicle_windows) return;

			vehicleData.vehicle_windows.forEach((state: string, index: number) => {
				if (state) veh.rollDownWindow(index);
				else if (!state) {
					if (veh.isWindowIntact(index)) {
						veh.fixWindow(index);
					}

					veh.rollUpWindow(index);
				}
			});

		})

	}

}