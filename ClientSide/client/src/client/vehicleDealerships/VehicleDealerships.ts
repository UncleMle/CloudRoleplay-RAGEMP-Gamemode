import { DealerShip } from '@/@types';
import BrowserSystem from '@/BrowserSystem/BrowserSystem';
import GuiSystem from '@/BrowserSystem/GuiSystem';
import { CLEAR_FOCUS, _IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE, _control_ids } from '@/Constants/Constants';
import { Browsers } from '@/enums';
import vehicleData from './VehicleData.json';
import VehicleManager from '@/VehicleSystems/VehicleManager';

export default class VehicleDealerShips {
	public static LocalPlayer: PlayerMp = mp.players.local;
	public static _dealershipIdentifer: string = 'vehicleDealership';
	public static _closeDealerEvent: string = 'server:closeDealership';
	public static _dealerPurchaseEvent: string = 'server:purchaseVehicleConfirm';
	public static dealerCam: CameraMp;
	public static dealerCamPos: Vector3 = new mp.Vector3(234.7, -997.9, -98.2);
	public static dealerSelectedVehicle: VehicleMp;
	public static defaultSpawnColour: number = 111;

	constructor() {
		mp.events.add({
			"dealers:initDealership": VehicleDealerShips.initDealership,
			"dealers:closeDealership": VehicleDealerShips.closeDealerShip,
			"dealers:changeSelectVeh": VehicleDealerShips.addDealerShipVehicle,
			"dealers:setSelectedVehRot": VehicleDealerShips.setDealerVehRot,
			"dealers:changeSelectVehColour": VehicleDealerShips.setDealerVehColour
		});
	}

	public static closeDealerShip() {
		let dealerData: DealerShip | null = VehicleDealerShips.LocalPlayer.getVariable(VehicleDealerShips._dealershipIdentifer);

		if (dealerData) {
			mp.events.callRemote(VehicleDealerShips._closeDealerEvent);

			if (VehicleDealerShips.dealerCam && mp.game.cam.doesExist(VehicleDealerShips.dealerCam.handle)) {
				VehicleDealerShips.dealerCam.destroy();
				mp.game.cam.renderScriptCams(false, false, 0, false, false);
				mp.game.invoke(CLEAR_FOCUS);
			}

			mp.gui.cursor.show(false, false);
			GuiSystem.toggleHudComplete(true);
		}
	}

	public static async initDealership() {
		if (mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE)) return;

		let dealerData: DealerShip | null = VehicleDealerShips.LocalPlayer.getVariable(VehicleDealerShips._dealershipIdentifer);

		if (dealerData) {
			GuiSystem.toggleHudComplete(false);
			mp.game.cam.doScreenFadeOut(0);

			VehicleDealerShips.dealerCam = mp.cameras.new('default', VehicleDealerShips.dealerCamPos, new mp.Vector3(0, 0, 0), 40);
			VehicleDealerShips.dealerCam.pointAtCoord(227.5, -987.2, -99);
			mp.game.cam.renderScriptCams(true, false, 0, true, false);

			if (dealerData.vehicles.length > 0) {
				VehicleDealerShips.addDealerShipVehicle(dealerData.vehicles[0].spawnName, 180, VehicleDealerShips.defaultSpawnColour);
			}

			dealerData.vehDispNames = [];

			dealerData.vehicles.forEach((data) => {
				let dispName = mp.game.vehicle.getDisplayNameFromVehicleModel(mp.game.joaat(data.spawnName));
				dealerData?.vehDispNames.push(dispName);
			});

			BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationSetter", {
                _mutationKey: "vehicle_dealer_data",
                data: ${JSON.stringify(dealerData)}
            })`);

			await mp.game.waitAsync(1300);
			mp.game.cam.doScreenFadeIn(600);
			BrowserSystem.pushRouter(Browsers.Dealership, true);
		}
	}

	public static setDealerVehRot(rotation: number) {
		if (VehicleDealerShips.dealerSelectedVehicle) {
			VehicleDealerShips.dealerSelectedVehicle.setHeading(Number(rotation));
		}
	}

	public static setDealerVehColour(colour: string | number) {
		if (VehicleDealerShips.dealerSelectedVehicle) {
			mp.console.logInfo(Number(colour) + " colour");
			VehicleDealerShips.dealerSelectedVehicle.setColours(Number(colour), Number(colour));
		}
	}

	public static insertPerformanceToBrowser(vehSpawnName: string) {
		let vehiclePerformanceData: any;

		vehicleData.forEach((data) => {
			if (data.model == vehSpawnName) {
				vehiclePerformanceData = data;
			}
		});

		BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationSetter", {
			_mutationKey: "vehicle_performance_data",
			data: ${JSON.stringify(vehiclePerformanceData)}
		})`);
	}

	public static async addDealerShipVehicle(vehName: string, rotation: string | number, colour: string | number) {
		if (!vehName) return;

		VehicleDealerShips.insertPerformanceToBrowser(vehName);

		if (VehicleDealerShips.dealerSelectedVehicle && mp.game.vehicle.getDisplayNameFromVehicleModel(VehicleDealerShips.dealerSelectedVehicle.model) === vehName) return;

		if (VehicleDealerShips.dealerSelectedVehicle) {
			VehicleDealerShips.dealerSelectedVehicle.destroy();
		}

		VehicleDealerShips.dealerSelectedVehicle = VehicleManager.createVehicle(vehName, new mp.Vector3(227.5, -987.2, -99), 111, 111, true, "DEALER", VehicleDealerShips.LocalPlayer.remoteId + 1);

		for (let i = 0; VehicleDealerShips.dealerSelectedVehicle.handle === 0 && i < 15; ++i) {
			await mp.game.waitAsync(100);
		}

		VehicleDealerShips.dealerSelectedVehicle.setDirtLevel(0);
		VehicleDealerShips.dealerSelectedVehicle.setHeading(Number(rotation));
		VehicleDealerShips.dealerSelectedVehicle.setColours(Number(colour), Number(colour));
	}
}