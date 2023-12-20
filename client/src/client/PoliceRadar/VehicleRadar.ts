import BrowserSystem from '@/BrowserSystem/BrowserSystem';

class VehicleRadar {
	public static LocalPlayer: PlayerMp;
	public static drawBoneStart: string = 'bonnet';
	public static maxFindDist: number = 15;
	public static emergencyVehicleClass: number = 18;

	constructor() {
		VehicleRadar.LocalPlayer = mp.players.local;

		mp.events.add('playerLeaveVehicle', (veh: VehicleMp) => VehicleRadar.toggleRadarOn(veh, false));
		mp.events.add('playerEnterVehicle', (veh: VehicleMp) => VehicleRadar.toggleRadarOn(veh, true));
		mp.events.add('render', VehicleRadar.handleRender);
	}

	public static handleRender() {
		if (VehicleRadar.LocalPlayer.vehicle && VehicleRadar.LocalPlayer.vehicle.getClass() == VehicleRadar.emergencyVehicleClass) {
			const targetVehs: VehicleMp[] | undefined = mp.vehicles.getClosest(VehicleRadar.LocalPlayer.vehicle.position, 2);

			if (targetVehs.length > 1) {
				let distList: { veh: VehicleMp; dist: number }[] = [];

				targetVehs.forEach((veh: VehicleMp) => {
					if (veh.handle != VehicleRadar.LocalPlayer.vehicle.handle) {
						let pPos: Vector3 = VehicleRadar.LocalPlayer.vehicle.position;

						distList.push({
							dist: mp.game.gameplay.getDistanceBetweenCoords(
								veh.position.x,
								veh.position.y,
								veh.position.z,
								pPos.x,
								pPos.y,
								pPos.z,
								true
							),
							veh: veh
						});
					}
				});

				distList.sort((a, b) => a.dist - b.dist);

				let targetV: VehicleMp = distList[0].veh;

				if (!targetV || distList[0].dist > VehicleRadar.maxFindDist) return;

				const boneIndex: number = VehicleRadar.LocalPlayer.vehicle.getBoneIndexByName(VehicleRadar.drawBoneStart);

				const playerVehBonePos: Vector3 = VehicleRadar.LocalPlayer.vehicle.getWorldPositionOfBone(boneIndex);
				const targetVehBonePos: Vector3 = targetV.getWorldPositionOfBone(boneIndex);

				let intersectWithWorld: RaycastResult | undefined = mp.raycasting.testPointToPoint(
					playerVehBonePos,
					targetVehBonePos,
					[VehicleRadar.LocalPlayer.vehicle.handle],
					1 + 16
				);

				if (!intersectWithWorld) {
					mp.game.graphics.drawLine(
						playerVehBonePos.x,
						playerVehBonePos.y,
						playerVehBonePos.z,
						targetVehBonePos.x,
						targetVehBonePos.y,
						targetVehBonePos.z,
						255,
						255,
						255,
						255
					);

					BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
                        _stateKey: "vehicleSpeedoData",
                        status: true
                    })`);
				}
			}
		}
	}

	public static toggleRadarOn(veh: VehicleMp, tog: boolean) {
		if (veh.getClass() == VehicleRadar.emergencyVehicleClass) {
			BrowserSystem._browserInstance.execute(`appSys.commit("setUiState", {
                _stateKey: "vehicleRadar",
                status: ${tog}
            })`);
		}
	}
}

export default VehicleRadar;
