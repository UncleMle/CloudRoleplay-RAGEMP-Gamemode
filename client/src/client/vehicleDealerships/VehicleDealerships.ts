import { DealerShip } from '@/@types';
import BrowserSystem from '@/BrowserSystem/BrowserSystem';
import GuiSystem from '@/BrowserSystem/GuiSystem';
import { CLEAR_FOCUS, _IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE, _control_ids } from '@/Constants/Constants';
import DeathSystem from '@/DeathSystem/DeathSystem';
import validateKeyPress from '@/PlayerMethods/validateKeyPress';
import VehicleSpeedo from '@/VehicleSystems/VehicleSpeedo';
import { Browsers } from '@/enums';

class VehicleDealerShips {
	public static LocalPlayer: PlayerMp;
	public static _dealershipIdentifer: string = 'vehicleDealership';
	public static _viewDealerEvent: string = 'server:viewDealerVehicles';
	public static _closeDealerEvent: string = 'server:closeDealership';
	public static dealerCam: CameraMp;
	public static dealerCamPos: Vector3 = new mp.Vector3(234.7, -997.9, -98.2);
	public static dealerSelectedVehicle: VehicleMp;

	constructor() {
		VehicleDealerShips.LocalPlayer = mp.players.local;

		mp.keys.bind(_control_ids.Y, false, VehicleDealerShips.handleKeyPress);
		mp.events.add('dealers:initDealership', VehicleDealerShips.initDealership);
		mp.events.add('dealers:closeDealership', VehicleDealerShips.closeDealerShip);
		mp.events.add('dealers:changeSelectVeh', VehicleDealerShips.addDealerShipVehicle);
		mp.events.add('render', VehicleDealerShips.handleRender);
	}

	public static handleRender() {
		if (VehicleDealerShips.LocalPlayer.browserRouter == Browsers.Dealership) {
			DeathSystem.disableControls();
		}
	}

	public static handleKeyPress() {
		if (!validateKeyPress(true) || mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE)) return;

		let dealerData: DealerShip | undefined = VehicleDealerShips.LocalPlayer.getVariable(VehicleDealerShips._dealershipIdentifer);

		if (dealerData) {
			mp.events.callRemote(VehicleDealerShips._viewDealerEvent);
		}
	}

	public static closeDealerShip() {
		let dealerData: DealerShip | undefined = VehicleDealerShips.LocalPlayer.getVariable(VehicleDealerShips._dealershipIdentifer);

		if (dealerData) {
			mp.events.callRemote(VehicleDealerShips._closeDealerEvent);

			if (VehicleDealerShips.dealerCam && mp.game.cam.doesExist(VehicleDealerShips.dealerCam.handle)) {
				VehicleDealerShips.dealerCam.destroy();
				mp.game.cam.renderScriptCams(false, false, 0, false, false);
				mp.game.invoke(CLEAR_FOCUS);
			}
			GuiSystem.toggleHudComplete(true);
		}
	}

	public static async initDealership() {
		if (mp.game.invoke(_IS_PLAYER_SWITCH_IN_PROGRESS_NATIVE)) return;

		let dealerData: DealerShip | undefined = VehicleDealerShips.LocalPlayer.getVariable(VehicleDealerShips._dealershipIdentifer);

		if (dealerData) {
			GuiSystem.toggleHudComplete(false);
			mp.game.cam.doScreenFadeOut(0);

			VehicleDealerShips.LocalPlayer.position = new mp.Vector3(230.7, -997.9, -98.2);
			VehicleDealerShips.dealerCam = mp.cameras.new('default', VehicleDealerShips.dealerCamPos, new mp.Vector3(0, 0, 0), 40);
			VehicleDealerShips.dealerCam.pointAtCoord(227.5, -987.2, -99);
			mp.game.cam.renderScriptCams(true, false, 0, true, false);

            if(dealerData.vehicles.length > 0) {
                VehicleDealerShips.addDealerShipVehicle(dealerData.vehicles[0]);
            }

            dealerData.vehDispNames = [];

			dealerData.vehicles.forEach((data) => {
				let dispName = VehicleSpeedo.getVehDispName(mp.game.joaat(data));
				dealerData?.vehDispNames.push(dispName);
			});

			BrowserSystem._browserInstance.execute(`appSys.commit("playerMutationSetter", {
                _mutationKey: "vehicle_dealer_data",
                data: ${JSON.stringify(dealerData)}
            })`);

			await mp.game.waitAsync(1300);
			mp.game.cam.doScreenFadeIn(600);
			BrowserSystem.pushRouter(Browsers.Dealership);
		}
	}

	public static addDealerShipVehicle(vehName: string) {
        if(!vehName) return;

		let spawnHash: number = mp.game.joaat(vehName);

		if (VehicleDealerShips.dealerSelectedVehicle && mp.vehicles.at(VehicleDealerShips.dealerSelectedVehicle.remoteId)) {
			VehicleDealerShips.dealerSelectedVehicle.destroy();
		}

		VehicleDealerShips.dealerSelectedVehicle = mp.vehicles.new(spawnHash, new mp.Vector3(227.5, -987.2, -99), {
			heading: -127,
			numberPlate: 'DEALER',
			locked: true,
			engine: false,
			dimension: VehicleDealerShips.LocalPlayer.remoteId + 1
		});
	}
}

export default VehicleDealerShips;