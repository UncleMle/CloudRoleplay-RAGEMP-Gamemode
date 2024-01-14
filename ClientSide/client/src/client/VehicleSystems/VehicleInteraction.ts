import { BoneData, VehicleData } from '../@types';
import getVehicleData from '../PlayerMethods/getVehicleData';
import distBetweenCoords from '../PlayerMethods/distanceBetweenCoords';
import { _config_flags, _control_ids } from '../Constants/Constants';

export default class VehicleInteraction {
	public static LocalPlayer: PlayerMp;
	public static bones: string[] = ['door_dside_f', 'door_pside_f', 'door_dside_r', 'door_pside_r', 'bonnet', 'boot'];
	public static names: string[] = ['door', 'door', 'door', 'door', 'hood', 'trunk', 'trunk'];
	public static boneTarget: BoneData;

	constructor() {
		VehicleInteraction.LocalPlayer = mp.players.local;

		mp.events.add('render', VehicleInteraction.handleInteractionRender);
		mp.keys.bind(_control_ids.EBIND, false, VehicleInteraction.handleInteraction);

		mp.events.add('playerLeaveVehicle', VehicleInteraction.syncOnExit);
	}

	public static syncOnExit(vehicle: VehicleMp, seat: number) {
		mp.events.callRemote('server:handleDoorInteraction', vehicle, seat + 1);
	}

	public static handleInteractionRender() {
		VehicleInteraction.syncVehicleDoors();

		VehicleInteraction.LocalPlayer.setConfigFlag(_config_flags.PED_FLAG_STOP_ENGINE_TURNING, true);

		if (VehicleInteraction.checkInteractionRender()) {
			const raycast: RaycastResult | null = VehicleInteraction.getLocalTargetVehicle();
			if (raycast == null || (raycast.entity as EntityMp).type != 'vehicle') return;
			VehicleInteraction.boneTarget = VehicleInteraction.getClosestBone(raycast);

			if (VehicleInteraction.boneTarget) {
				const bonePos: Vector3 = (raycast.entity as EntityMp).getWorldPositionOfBone(VehicleInteraction.boneTarget.boneIndex);

				const vehicleData: VehicleData | undefined = getVehicleData(raycast.entity as VehicleMp);
				if (!vehicleData) return;

				if (vehicleData.vehicle_locked) {
					return;
				}

				let renderText: string =
					'~g~[E]~w~' +
					` ${
						VehicleInteraction.boneTarget.locked
							? `Close ${VehicleInteraction.names[VehicleInteraction.bones.indexOf(VehicleInteraction.boneTarget.name)]}`
							: `Open ${VehicleInteraction.names[VehicleInteraction.bones.indexOf(VehicleInteraction.boneTarget.name)]}`
					}`;

				let dist: number = distBetweenCoords(VehicleInteraction.LocalPlayer.position, bonePos);

				mp.game.graphics.drawText(renderText, [bonePos.x, bonePos.y, bonePos.z], {
					scale: [0.3, 0.3],
					outline: false,
					color: [255, 255, 255, 255 - dist * 80],
					font: 4
				});
			}
		}
	}

	public static syncVehicleDoors() {
		mp.vehicles.forEachInStreamRange((vehicle: VehicleMp) => {
			let vehicleData: VehicleData | undefined = getVehicleData(vehicle);
			if (!vehicleData) return;

			vehicleData.vehicle_doors.forEach((state: string, index: number) => {
				if (state) vehicle.setDoorOpen(index, false, true);
				else vehicle.setDoorShut(index, true);
			});
		});
	}

	public static handleInteraction() {
		if (
			!mp.gui.cursor.visible &&
			!VehicleInteraction.LocalPlayer.isTypingInTextChat &&
			VehicleInteraction.boneTarget &&
			VehicleInteraction.boneTarget.pushTime + 1 >= Date.now() / 1000
		) {
			VehicleInteraction.interactionHandler();
		}
	}

	public static interactionHandler() {
		let vehicleData: VehicleData | undefined = getVehicleData(VehicleInteraction.boneTarget.veh);
		if (!vehicleData || vehicleData?.vehicle_locked) return;
		mp.events.callRemote('server:handleDoorInteraction', VehicleInteraction.boneTarget.veh, VehicleInteraction.boneTarget.id);
	}

	public static getClosestBone(raycast: RaycastResult): BoneData {
		let data: BoneData[] = [];
		VehicleInteraction.bones.forEach((bone: string, index: number) => {
			const rayEntity: EntityMp = raycast.entity as EntityMp;

			if (!rayEntity || rayEntity.type != 'vehicle') return;

			const boneIndex: number = rayEntity.getBoneIndexByName(bone);
			const bonePos: Vector3 = rayEntity.getWorldPositionOfBone(boneIndex);

			if (bonePos) {
				let vehicleData: VehicleData | undefined = getVehicleData(raycast.entity as VehicleMp);

				if (!vehicleData || !vehicleData.vehicle_doors) return;

				data.push({
					id: index,
					boneIndex: boneIndex,
					name: bone,
					locked:
						!vehicleData.vehicle_doors[index] || (!vehicleData.vehicle_doors[index] && !(raycast.entity as any).isDoorFullyOpen(index))
							? false
							: true,
					bonePos: bonePos,
					raycast: raycast,
					veh: raycast.entity as VehicleMp,
					distance: mp.game.gameplay.getDistanceBetweenCoords(
						bonePos.x,
						bonePos.y,
						bonePos.z,
						raycast.position.x,
						raycast.position.y,
						raycast.position.z,
						false
					),
					pushTime: Date.now() / 1000
				});
			}
		});

		return data.sort((a, b) => a.distance - b.distance)[0];
	}

	public static getLocalTargetVehicle(range: number = 1.5): null | RaycastResult {
		let startPosition = mp.players.local.getBoneCoords(12844, 0.5, 0, 0);
		const res = mp.game.graphics.getScreenActiveResolution(1, 1);
		const coord: Vector3 = new mp.Vector3(res.x / 2, res.y / 2, 2 | 4 | 8);
		const secondPoint = mp.game.graphics.screen2dToWorld3d(coord);
		if (!secondPoint) return null;

		startPosition.z -= 0.3;
		const target = mp.raycasting.testPointToPoint(startPosition, secondPoint, mp.players.local, 2 | 4 | 8 | 16);

		if (
			target &&
			mp.game.gameplay.getDistanceBetweenCoords(
				target.position.x,
				target.position.y,
				target.position.z,
				VehicleInteraction.LocalPlayer.position.x,
				VehicleInteraction.LocalPlayer.position.y,
				VehicleInteraction.LocalPlayer.position.z,
				false
			) < range
		)
			return target;
		return null;
	}

	public static checkInteractionRender(): boolean {
		if (!VehicleInteraction.LocalPlayer.vehicle && !mp.gui.cursor.visible && VehicleInteraction.LocalPlayer.getVehicleIsTryingToEnter() == 0) {
			return true;
		}
		return false;
	}

	public static drawTarget3d(
		pos: Vector3,
		textureDict: string = 'mpmissmarkers256',
		textureName: string = 'corona_shade',
		scaleX: number = 0.005,
		scaleY: number = 0.01
	) {
		const position = mp.game.graphics.world3dToScreen2d(pos);
		if (!position) return;
		mp.game.graphics.drawSprite(textureDict, textureName, position.x, position.y, scaleX, scaleY, 0, 0, 0, 0, 200, false);
	}
}
