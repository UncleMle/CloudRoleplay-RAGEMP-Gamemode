import { ModInfo, VehicleData, VehicleMods } from '@/@types';
import BrowserSystem from '@/BrowserSystem/BrowserSystem';
import GuiSystem from '@/BrowserSystem/GuiSystem';
import { COLOURED_HEADLIGHT_NATIVE, _SHARED_VEHICLE_DATA, _SHARED_VEHICLE_MODS_DATA } from '@/Constants/Constants';
import DeathSystem from '@/DeathSystem/DeathSystem';
import getVehicleData from '@/PlayerMethods/getVehicleData';
import { Browsers } from '@/enums';

export default class VehicleCustoms {
	public static LocalPlayer: PlayerMp;
	public static _colshapeDataIdentifier: string = 'customsAreaColshapeData';
	public static readonly _vehicleDirtLevelIdentifier: string = 'VehicleDirtLevel';

	constructor() {
		VehicleCustoms.LocalPlayer = mp.players.local;

		mp.events.add('playerExitColshape', VehicleCustoms.handleColEnter);
		mp.events.add('customs:toggleVehicleFreeze', VehicleCustoms.handleVehFreeze);
		mp.events.add('playerLeaveVehicle', VehicleCustoms.handleLeaveVehicle);
		mp.events.add('customs:loadIndexes', VehicleCustoms.loadIndexesIntoBrowser);
		mp.events.add('vehicle:setAttachments', VehicleCustoms.setVehicleAttachments);
		mp.events.add('entityStreamIn', VehicleCustoms.handleStreamIn);
		mp.events.addDataHandler(_SHARED_VEHICLE_MODS_DATA, VehicleCustoms.handleDataHandler_mods_data);
		mp.events.addDataHandler(VehicleCustoms._vehicleDirtLevelIdentifier, VehicleCustoms.handleDataHandler_dirt_level);
		mp.events.add('render', VehicleCustoms.handleRender);
	}

	public static handleVehFreeze(tog: boolean) {
		if (VehicleCustoms.LocalPlayer.vehicle) {
			VehicleCustoms.LocalPlayer.vehicle.freezePosition(tog);
		}
	}

	public static handleLeaveVehicle() {
		if (VehicleCustoms.LocalPlayer.browserRouter == Browsers.ModsView) {
			BrowserSystem.pushRouter('/');
			GuiSystem.toggleHudComplete(true);
		}
	}

	public static loadIndexesIntoBrowser() {
		if (!VehicleCustoms.LocalPlayer.vehicle) return;
		let veh: VehicleMp = VehicleCustoms.LocalPlayer.vehicle;

		VehicleCustoms.handleVehFreeze(true);

		const indexData: ModInfo[] = [
			{ name: 'Front Bumper', modNumber: veh.getNumMods(1) },
			{ name: 'Rear Bumper', modNumber: veh.getNumMods(2) },
			{ name: 'Side Skirt', modNumber: veh.getNumMods(3) },
			{ name: 'Exhaust', modNumber: veh.getNumMods(4) },
			{ name: 'Frame', modNumber: veh.getNumMods(5) },
			{ name: 'Grille', modNumber: veh.getNumMods(6) },
			{ name: 'Hood', modNumber: veh.getNumMods(7) },
			{ name: 'Fender', modNumber: veh.getNumMods(8) },
			{ name: 'Right Fender', modNumber: veh.getNumMods(9) },
			{ name: 'Roof', modNumber: veh.getNumMods(10) },
			{ name: 'Engine', modNumber: veh.getNumMods(11) },
			{ name: 'Brakes', modNumber: veh.getNumMods(11) },
			{ name: 'Transmission', modNumber: veh.getNumMods(13) },
			{ name: 'Horns', modNumber: veh.getNumMods(14) },
			{ name: 'Suspension', modNumber: veh.getNumMods(15) },
			{ name: 'Turbo', modNumber: veh.getNumMods(18) },
			{ name: 'Xenon', modNumber: veh.getNumMods(22) },
			{ name: 'Front Wheels', modNumber: veh.getNumMods(23) },
			{ name: 'Back Wheels', modNumber: veh.getNumMods(24) },
			{ name: 'Plate', modNumber: veh.getNumMods(25) },
			{ name: 'Trim Design', modNumber: veh.getNumMods(27) },
			{ name: 'Ornaments', modNumber: veh.getNumMods(28) },
			{ name: 'Dial Design', modNumber: veh.getNumMods(30) },
			{ name: 'Steering Wheel', modNumber: veh.getNumMods(33) },
			{ name: 'Shift Lever', modNumber: veh.getNumMods(34) },
			{ name: 'Plaques', modNumber: veh.getNumMods(35) },
			{ name: 'Hydraulics', modNumber: veh.getNumMods(38) },
			{ name: 'Boost', modNumber: veh.getNumMods(40) },
			{ name: 'Window Tint', modNumber: veh.getNumMods(55) },
			{ name: 'Livery', modNumber: veh.getNumMods(48) },
			{ name: 'Plate Holders', modNumber: veh.getNumMods(53) },
			{ name: 'Colour One', modNumber: veh.getNumMods(66) },
			{ name: 'Colour Two', modNumber: veh.getNumMods(67) }
		];

		BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationSetter", {
            _mutationKey: "vehicle_mod_indexes",
            data: ${JSON.stringify(indexData)}
        })`);

		BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationSetter", {
            _mutationKey: "vehicle_mod_data_old",
            data: ${JSON.stringify(veh.getVariable(_SHARED_VEHICLE_MODS_DATA))}
        })`);

	}

	public static handleDataHandler_mods_data(entity: VehicleMp, data: VehicleMods) {
		if (entity.type != 'vehicle' || !data) return;

		VehicleCustoms.setVehicleAttachments(data, false, entity);
	}

	public static handleDataHandler_dirt_level(entity: VehicleMp, data: number) {
		if (entity.type != 'vehicle' || data === undefined) return;

		entity.setDirtLevel(data);
	}

	public static async handleStreamIn(entity: VehicleMp) {
		if (entity.type != "vehicle") return;
		let vehicleData: VehicleData | undefined = getVehicleData(entity);
		let dirtLevel: number = entity.getVariable(VehicleCustoms._vehicleDirtLevelIdentifier);

		if (vehicleData && dirtLevel !== undefined) {
			VehicleCustoms.setVehicleAttachments(vehicleData.vehicle_mods, false, entity);
			entity.setDirtLevel(dirtLevel);
		}
	}

	public static handleRender() {
		if (VehicleCustoms.LocalPlayer.browserRouter == Browsers.ModsView && VehicleCustoms.LocalPlayer.vehicle) {
			DeathSystem.disableControls();
			VehicleCustoms.LocalPlayer.vehicle.freezePosition(true);
		}
	}

	public static handleColEnter(colshape: ColshapeMp) {
		if (colshape.getVariable(VehicleCustoms._colshapeDataIdentifier) && VehicleCustoms.LocalPlayer.browserRouter == Browsers.ModsView) {
			mp.gui.cursor.show(false, false);
			BrowserSystem.pushRouter('/');
			GuiSystem.toggleHudComplete(true);
		}
	}

	public static setVehicleAttachments(data: any, parse: boolean = false, vehicle: VehicleMp = VehicleCustoms.LocalPlayer.vehicle) {
		if (!data || !vehicle || vehicle.handle === 0) return;

		let modData: VehicleMods = data;

		if (parse) {
			modData = JSON.parse(data);
		}

		if (modData.headlight_colour != -1) {
			vehicle.toggleMod(22, true);
			mp.game.invoke(COLOURED_HEADLIGHT_NATIVE, vehicle.handle, Number(modData.headlight_colour));
		} else if (modData.xenon != -1) {
			vehicle.setMod(22, Number(modData.xenon));
		}

		vehicle.setWheelType(Number(modData.wheel_type));
		vehicle.setWindowTint(Number(modData.window_tint));
		vehicle.setColours(Number(modData.colour_1), Number(modData.colour_2));
		vehicle.setExtraColours(Number(modData.pearleascent), Number(modData.wheel_colour));

		vehicle.toggleMod(20, true);
		vehicle.setTyreSmokeColor(Number(modData.tyre_smoke_r), Number(modData.tyre_smoke_g), Number(modData.tyre_smoke_b));

		if (Number(modData.neon_colour_r) != -1 || Number(modData.neon_colour_b) != -1 || Number(modData.neon_colour_g) != -1) {
			vehicle.setNeonLightsColour(Number(modData.neon_colour_r), Number(modData.neon_colour_g), Number(modData.neon_colour_b));

			VehicleCustoms.toggleNeons(vehicle, true);
		} else {
			VehicleCustoms.toggleNeons(vehicle, false);
		}

		if (modData.wheel_type == 10) {
			vehicle.setDriftTyresEnabled(true);
		} else {
			vehicle.setDriftTyresEnabled(false);
		}

		let mods: Map<number, number> = new Map<number, number>([
			[0, modData.spoilers],
			[1, modData.front_bumper],
			[2, modData.rear_bumper],
			[3, modData.side_skirt],
			[4, modData.exhaust],
			[5, modData.frame],
			[6, modData.grille],
			[7, modData.hood],
			[8, modData.fender],
			[9, modData.right_fender],
			[10, modData.roof],
			[11, modData.engine],
			[12, modData.brakes],
			[13, modData.transmission],
			[14, modData.horns],
			[15, modData.suspension],
			[16, modData.armor],
			[18, modData.turbo],
			[23, modData.front_wheels],
			[24, modData.back_wheels],
			[25, modData.plate_holders],
			[27, modData.trim_design],
			[28, modData.ornaments],
			[30, modData.dial_design],
			[33, modData.steering_wheel],
			[34, modData.shift_lever],
			[35, modData.plaques],
			[38, modData.hydraulics],
			[40, modData.boost],
			[55, modData.window_tint],
			[48, modData.livery],
			[53, modData.plate],
			[66, modData.colour_1],
			[67, modData.colour_2]
		]);

		for (let [key, value] of mods.entries()) {
			vehicle.setMod(key, Number(value));
		}
	}

	public static toggleNeons(veh: VehicleMp, tog: boolean) {
		for (let i = 0; i <= 3; i++) {
			veh.setNeonLightEnabled(i, tog);
		}
	}
}
