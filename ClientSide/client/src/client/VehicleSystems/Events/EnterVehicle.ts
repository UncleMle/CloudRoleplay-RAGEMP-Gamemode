import { VehicleData } from '../../@types';
import { TASK_WARP_PED_INTO_VEHICLE, _control_ids, _sharedAccountDataIdentifier } from '../../Constants/Constants';
import calcDist from '../../PlayerMethods/calcDist';
import getVehicleData from '../../PlayerMethods/getVehicleData';
import getClosestVehicleInRange from '../../PlayerMethods/getVehicleInRange';


export default class EnterVehicle {
	public static LocalPlayer: PlayerMp;

	constructor() {
		EnterVehicle.LocalPlayer = mp.players.local;

		mp.keys.bind(_control_ids.G, false, EnterVehicle.handleEnterPassenger);
	}

	public static handleEnterPassenger() {
		if (mp.players.local.vehicle == null && mp.gui.cursor.visible == false) {
			const driverSeatId = -1;
			const playerPos = mp.players.local.position;
			const vehicle = getClosestVehicleInRange(6);
			if (!vehicle) return;

			let vehicleData: VehicleData | undefined = getVehicleData(vehicle);

			if (vehicle.isAVehicle() && vehicleData) {
				if (vehicleData.vehicle_locked) {
					vehicle.setDoorsLockedForAllPlayers(true);
					return;
				}

				if (mp.game.vehicle.isThisModelABike(vehicle.model)) {
					if (vehicle.isSeatFree(0) && !mp.gui.cursor.visible) {
						mp.players.local.taskEnterVehicle(vehicle.handle, 5000, 0, 2.0, 1, 0);
					}
					return;
				}

				const seatRear = vehicle.getBoneIndexByName('seat_r');
				const seatFrontPassenger = vehicle.getBoneIndexByName('seat_pside_f');
				const seatRearDriver = vehicle.getBoneIndexByName('seat_dside_r');
				const seatRearDriver1 = vehicle.getBoneIndexByName('seat_dside_r1');
				const seatRearDriver2 = vehicle.getBoneIndexByName('seat_dside_r2');
				const seatRearDriver3 = vehicle.getBoneIndexByName('seat_dside_r3');
				const seatRearDriver4 = vehicle.getBoneIndexByName('seat_dside_r4');
				const seatRearDriver5 = vehicle.getBoneIndexByName('seat_dside_r5');
				const seatRearDriver6 = vehicle.getBoneIndexByName('seat_dside_r6');
				const seatRearDriver7 = vehicle.getBoneIndexByName('seat_dside_r7');
				const seatRearPassenger = vehicle.getBoneIndexByName('seat_pside_r');
				const seatRearPassenger1 = vehicle.getBoneIndexByName('seat_pside_r1');
				const seatRearPassenger2 = vehicle.getBoneIndexByName('seat_pside_r2');
				const seatRearPassenger3 = vehicle.getBoneIndexByName('seat_pside_r3');
				const seatRearPassenger4 = vehicle.getBoneIndexByName('seat_pside_r4');
				const seatRearPassenger5 = vehicle.getBoneIndexByName('seat_pside_r5');
				const seatRearPassenger6 = vehicle.getBoneIndexByName('seat_pside_r6');
				const seatRearPassenger7 = vehicle.getBoneIndexByName('seat_pside_r7');

				const seatRearPosition = seatRear === -1 ? null : vehicle.getWorldPositionOfBone(seatRear);
				const seatFrontPassengerPosition = seatFrontPassenger === -1 ? null : vehicle.getWorldPositionOfBone(seatFrontPassenger);
				const seatRearDriverPosition = seatRearDriver === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver);
				const seatRearDriver1Position = seatRearDriver1 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver1);
				const seatRearDriver2Position = seatRearDriver2 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver2);
				const seatRearDriver3Position = seatRearDriver3 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver3);
				const seatRearDriver4Position = seatRearDriver4 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver4);
				const seatRearDriver5Position = seatRearDriver5 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver5);
				const seatRearDriver6Position = seatRearDriver6 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver6);
				const seatRearDriver7Position = seatRearDriver7 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearDriver7);
				const seatRearPassengerPosition = seatRearPassenger === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger);
				const seatRearPassenger1Position = seatRearPassenger1 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger1);
				const seatRearPassenger2Position = seatRearPassenger2 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger2);
				const seatRearPassenger3Position = seatRearPassenger3 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger3);
				const seatRearPassenger4Position = seatRearPassenger4 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger4);
				const seatRearPassenger5Position = seatRearPassenger5 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger5);
				const seatRearPassenger6Position = seatRearPassenger6 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger6);
				const seatRearPassenger7Position = seatRearPassenger7 === -1 ? null : vehicle.getWorldPositionOfBone(seatRearPassenger7);

				let closestFreeSeatNumber = -1;
				let seatIndex = driverSeatId;
				let closestSeatDistance = Number.MAX_SAFE_INTEGER;
				let calculatedDistance = null;

				calculatedDistance = seatRearPosition === null ? null : calcDist(playerPos, seatRearPosition);
				seatIndex = seatRear === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				calculatedDistance = seatFrontPassengerPosition === null ? null : calcDist(playerPos, seatFrontPassengerPosition);
				seatIndex = seatFrontPassenger === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				calculatedDistance = seatRearDriverPosition === null ? null : calcDist(playerPos, seatRearDriverPosition);
				seatIndex = seatRearDriver === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				calculatedDistance = seatRearPassengerPosition === null ? null : calcDist(playerPos, seatRearPassengerPosition);
				seatIndex = seatRearPassenger === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				calculatedDistance = seatRearDriver1Position === null ? null : calcDist(playerPos, seatRearDriver1Position);
				seatIndex = seatRearDriver1 === -1 ? seatIndex : seatIndex + 1; // 3
				if (!vehicle.isSeatFree(seatIndex - 2) || mp.keys.isDown(17)) {
					if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
						closestSeatDistance = calculatedDistance;
						closestFreeSeatNumber = seatIndex;
					}
				}

				calculatedDistance = seatRearPassenger1Position === null ? null : calcDist(playerPos, seatRearPassenger1Position);
				seatIndex = seatRearPassenger1 === -1 ? seatIndex : seatIndex + 1; // 4
				if (!vehicle.isSeatFree(seatIndex - 2) || mp.keys.isDown(17)) {
					if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
						closestSeatDistance = calculatedDistance;
						closestFreeSeatNumber = seatIndex;
					}
				}

				calculatedDistance = seatRearDriver2Position === null ? null : calcDist(playerPos, seatRearDriver2Position);
				seatIndex = seatRearDriver2 === -1 ? seatIndex : seatIndex + 1; // 5
				if (!vehicle.isSeatFree(seatIndex - 4) || mp.keys.isDown(17)) {
					if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
						closestSeatDistance = calculatedDistance;
						closestFreeSeatNumber = seatIndex;
					}
				}

				calculatedDistance = seatRearPassenger2Position === null ? null : calcDist(playerPos, seatRearPassenger2Position);
				seatIndex = seatRearPassenger2 === -1 ? seatIndex : seatIndex + 1; // 6
				if (!vehicle.isSeatFree(seatIndex - 4) || mp.keys.isDown(17)) {
					if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
						closestSeatDistance = calculatedDistance;
						closestFreeSeatNumber = seatIndex;
					}
				}

				calculatedDistance = seatRearDriver3Position === null ? null : calcDist(playerPos, seatRearDriver3Position);
				seatIndex = seatRearDriver3 === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				calculatedDistance = seatRearPassenger3Position === null ? null : calcDist(playerPos, seatRearPassenger3Position);
				seatIndex = seatRearPassenger3 === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				calculatedDistance = seatRearDriver4Position === null ? null : calcDist(playerPos, seatRearDriver4Position);
				seatIndex = seatRearDriver4 === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				calculatedDistance = seatRearPassenger4Position === null ? null : calcDist(playerPos, seatRearPassenger4Position);
				seatIndex = seatRearPassenger4 === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				calculatedDistance = seatRearDriver5Position === null ? null : calcDist(playerPos, seatRearDriver5Position);
				seatIndex = seatRearDriver5 === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				calculatedDistance = seatRearPassenger5Position === null ? null : calcDist(playerPos, seatRearPassenger5Position);
				seatIndex = seatRearPassenger5 === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				calculatedDistance = seatRearDriver6Position === null ? null : calcDist(playerPos, seatRearDriver6Position);
				seatIndex = seatRearDriver6 === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				calculatedDistance = seatRearPassenger6Position === null ? null : calcDist(playerPos, seatRearPassenger6Position);
				seatIndex = seatRearPassenger6 === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				calculatedDistance = seatRearDriver7Position === null ? null : calcDist(playerPos, seatRearDriver7Position);
				seatIndex = seatRearDriver7 === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				calculatedDistance = seatRearPassenger7Position === null ? null : calcDist(playerPos, seatRearPassenger7Position);
				seatIndex = seatRearPassenger7 === -1 ? seatIndex : seatIndex + 1;
				if (calculatedDistance !== null && vehicle.isSeatFree(seatIndex) && calculatedDistance < closestSeatDistance) {
					closestSeatDistance = calculatedDistance;
					closestFreeSeatNumber = seatIndex;
				}

				if (closestFreeSeatNumber === -1) {
					return;
				}

				const lastAnimatableSeatOverrides = {
					[mp.game.joaat('journey')]: driverSeatId + 1,
					[mp.game.joaat('journey2')]: driverSeatId + 1
				};

				let lastAnimatableSeatIndex = driverSeatId + 3;
				if (lastAnimatableSeatOverrides[vehicle.model] !== undefined) {
					lastAnimatableSeatIndex = lastAnimatableSeatOverrides[vehicle.model];
				}

				if (closestFreeSeatNumber <= lastAnimatableSeatIndex) {
					mp.players.local.taskEnterVehicle(vehicle.handle, 5000, closestFreeSeatNumber, 2.0, 1, 0);
				} else {
					mp.game.invoke(TASK_WARP_PED_INTO_VEHICLE, mp.players.local.handle, vehicle.handle, closestFreeSeatNumber);
				}
			}
		}
	}
}
