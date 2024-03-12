import { BoneData, FreeLanceJobVehicleData, VehicleData } from '../../@types';
import getVehicleData from '../../PlayerMethods/getVehicleData';
import distBetweenCoords from '../../PlayerMethods/distanceBetweenCoords';
import { FREELANCE_JOB_VEHICLE_DATA_KEY, _config_flags, _control_ids } from '../../Constants/Constants';
import { FreelanceJobs, InteractMenu } from '@/enums';
import getUserCharacterData from '@/PlayerMethods/getUserCharacterData';

export default class VehicleInteraction {
	public static LocalPlayer: PlayerMp = mp.players.local;
	public static bones: string[] = ["handle_dside_f", "handle_pside_f", "handle_dside_r", "handle_pside_r", "bonnet", "boot"];
	public static names: string[] = ["door", "door", "door", "door", "bonnet", "boot"];
	public static boneTarget: BoneData;
	private static wheelMenuPosition: number = 0;
	private static renderedMenu: string[];

	constructor() {
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
			let vehicleList: VehicleMp[] = mp.vehicles.getClosest(VehicleInteraction.LocalPlayer.position, 1);

			if (vehicleList.length == 0) return;

			let veh: VehicleMp = vehicleList[0];

			let vehData: VehicleData | undefined = getVehicleData(veh);

			if (!vehData) return;

			let pPos: Vector3 = VehicleInteraction.LocalPlayer.position;

			let dist: number = mp.game.gameplay.getDistanceBetweenCoords(
				pPos.x,
				pPos.y,
				pPos.z,
				veh.position.x,
				veh.position.y,
				veh.position.z,
				true
			);

			if (dist > 6) return;

			VehicleInteraction.bones.forEach((bone, idx) => {
				let boneRenderPos: Vector3 = veh.getWorldPositionOfBone(veh.getBoneIndexByName(bone));
				if (!boneRenderPos) return;

				if (mp.game.gameplay.getDistanceBetweenCoords(
					pPos.x,
					pPos.y,
					pPos.z,
					boneRenderPos.x,
					boneRenderPos.y,
					boneRenderPos.z,
					true
				) > 2) return;

				let name: string = VehicleInteraction.names[idx];

				mp.game.graphics.drawText(
					name[0].toUpperCase() + name.substring(1) + ` ${vehData?.vehicle_locked ? '~r~locked' : '~g~unlocked'}`,
					[boneRenderPos.x, boneRenderPos.y, boneRenderPos.z + 0.11],
					{
						font: 4,
						color: [198, 163, 255, 160],
						scale: [0.325, 0.325],
						outline: false
					}
				);
			});

			if (vehData.vehicle_locked) return;

			const raycast: RaycastResult | null = VehicleInteraction.getLocalTargetVehicle();
			if (raycast == null || (raycast.entity as EntityMp).type != 'vehicle') return;
			VehicleInteraction.boneTarget = VehicleInteraction.getClosestBone(raycast);

			if (VehicleInteraction.boneTarget) {
				const bonePos: Vector3 = (raycast.entity as EntityMp).getWorldPositionOfBone(VehicleInteraction.boneTarget.boneIndex);

				const vehicleData: VehicleData | undefined = getVehicleData(raycast.entity as VehicleMp);
				const freelanceData: FreeLanceJobVehicleData | null = VehicleInteraction.boneTarget.veh.getVariable(FREELANCE_JOB_VEHICLE_DATA_KEY);
				if (!vehicleData) return;

				if (vehicleData.vehicle_locked) return;

				let renderText: string[] =
					[
						` ${VehicleInteraction.boneTarget.locked
							? `Close ${VehicleInteraction.names[VehicleInteraction.bones.indexOf(VehicleInteraction.boneTarget.name)]}`
							: `Open ${VehicleInteraction.names[VehicleInteraction.bones.indexOf(VehicleInteraction.boneTarget.name)]}`
						}`
					];

				if (freelanceData && freelanceData.characterOwnerId == getUserCharacterData()?.character_id) {
					if (VehicleInteraction.boneTarget.name == VehicleInteraction.bones[2] || VehicleInteraction.boneTarget.name == VehicleInteraction.bones[3]) {
						switch (freelanceData.jobId) {
							case FreelanceJobs.PostalJob: {
								renderText.push(InteractMenu.PostalMenu);
								break;
							}
							case FreelanceJobs.GruppeSix: {
								renderText.push(InteractMenu.GruppeSix);
								break;
							}
						}
					}
				}

				VehicleInteraction.handleWheelMenu(renderText);

				let dist: number = distBetweenCoords(VehicleInteraction.LocalPlayer.position, bonePos);

				renderText.forEach((text, idx) => {
					let textSelected: string = VehicleInteraction.wheelMenuPosition === idx ? "[E]" : "~c~";

					mp.game.graphics.drawText(textSelected + text, [bonePos.x, bonePos.y, bonePos.z - (idx > 0 ? idx / 7 : 0)], {
						scale: [0.3, 0.3],
						outline: false,
						color: [255, 255, 255, 255 - dist * 80],
						font: 4
					});
				});
			}
		}
	}

	private static handleWheelMenu(renderArr: string[]) {
		VehicleInteraction.renderedMenu = renderArr;
		mp.game.ui.weaponWheelIgnoreSelection();

		if (renderArr.length === 1) {
			VehicleInteraction.wheelMenuPosition = 0;
			return;
		}

		let wheelDown = mp.game.controls.isControlPressed(0, 14);
		let wheelUp = mp.game.controls.isControlPressed(0, 15);

		if (wheelUp) {
			if (VehicleInteraction.wheelMenuPosition >= renderArr.length - 1) {
				VehicleInteraction.wheelMenuPosition = renderArr.length - 1;
				return;
			}
			VehicleInteraction.wheelMenuPosition++;
		}
		if (wheelDown) {
			if (VehicleInteraction.wheelMenuPosition <= 0) {
				VehicleInteraction.wheelMenuPosition = 0;
				return;
			}
			VehicleInteraction.wheelMenuPosition--;
		}
	}

	public static syncVehicleDoors() {
		mp.vehicles.forEachInStreamRange((vehicle: VehicleMp) => {
			let vehicleData: VehicleData | undefined = getVehicleData(vehicle);
			if (!vehicleData) return;

			vehicleData.vehicle_doors.forEach((state: string, index: number) => {
				if (state) vehicle.setDoorOpen(index, false, false);
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
			&& VehicleInteraction.renderedMenu
		) {
			switch (VehicleInteraction.renderedMenu[VehicleInteraction.wheelMenuPosition]) {
				case InteractMenu.PostalMenu:
					{
						mp.events.callRemote("server:postalJob:pickPackage", VehicleInteraction.boneTarget.veh);
						break;
					}
				case InteractMenu.GruppeSix:
					{
						mp.events.callRemote("server:jobs:gruppeSix:takeMoney", VehicleInteraction.boneTarget.veh);
						break;
					}
				default: {
					VehicleInteraction.interactionHandler();
				}
			}
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
}
