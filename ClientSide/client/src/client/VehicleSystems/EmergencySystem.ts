import validateKeyPress from "@/PlayerMethods/validateKeyPress";
import { VehicleData } from "../@types";
import { _SHARED_VEHICLE_DATA, _control_ids } from "../Constants/Constants";
import getVehicleData from "../PlayerMethods/getVehicleData";

export default class EmergencySystem {
	public static LocalPlayer: PlayerMp = mp.players.local;
	public static readonly eventName: string = "server:toggleSiren";
	public static readonly elsEventName: string = "server:elsSync";
	public static _emergencyClass: number = 18;
	public static readonly sirenTones: string[] = [
		"VEHICLES_HORNS_SIREN_1", // Siren tone 1
		"VEHICLES_HORNS_SIREN_2", // Siren tone 2
		"VEHICLES_HORNS_POLICE_WARNING", // Siren tone 3
		"VEHICLES_HORNS_AMBULANCE_WARNING", // Siren tone 4
		"VEHICLES_HORNS_SIREN_1", // Auxiliary Siren
		"SIRENS_AIRHORN" // Horn
	];
	public static readonly elsKeyBinds: number[] = [
		81, // Light stage modifier
		49, // Siren tone 1
		50, // Siren tone 2
		51, // Siren tone 3
		52, // Siren tone 4
		53, // Random siren tone every 5 seconds
		54 // Auxiliary siren (tone 1)
	];
	public static readonly keyTimeout_ms: number = 350;

	constructor() {
		mp.events.add({
			"render": EmergencySystem.handleRender,
			"entityStreamIn": EmergencySystem.handleEntityStreamIn
		});

		mp.events.addDataHandler(_SHARED_VEHICLE_DATA, EmergencySystem.handleDataHandler);
		mp.keys.bind(_control_ids.Q, false, EmergencySystem.toggleVehicleSiren);
	}

	public static handleRender() {
		mp.vehicles.forEachInStreamRange((veh: VehicleMp) => {
			let vehicleData: VehicleData | undefined = getVehicleData(veh);
			if (!vehicleData) return;

			if (!vehicleData.vehicle_siren) {
				veh.setSirenSound(false);
			}
		});
	}

	public static handleEntityStreamIn(entity: EntityMp) {
		if (entity.type != "vehicle") return;
		let vehicleData: VehicleData | undefined = getVehicleData(entity as VehicleMp);
		if (!vehicleData) return;

		(entity as VehicleMp).setSirenSound(vehicleData.vehicle_siren ? true : false);
	}

	public static handleDataHandler(entity: VehicleMp, data: VehicleData) {
		if (entity.type != "vehicle" || !data) return;

		entity.setSirenSound(data.vehicle_siren ? true : false);
	}

	public static toggleVehicleSiren() {
		if (!validateKeyPress() || !EmergencySystem.LocalPlayer.vehicle) return;

		if (EmergencySystem.LocalPlayer.vehicle.getClass() == EmergencySystem._emergencyClass) {
			let localPlayerVehicleData: VehicleData | undefined = getVehicleData(EmergencySystem.LocalPlayer.vehicle);
			if (!localPlayerVehicleData) return;

			mp.events.callRemote(EmergencySystem.eventName);
		}
	}
}