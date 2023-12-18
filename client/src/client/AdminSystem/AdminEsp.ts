import { UserData, VehicleData, CharacterData } from "../@types";
import distBetweenCoords from "../PlayerMethods/distanceBetweenCoords";
import getTargetCharacterData from "../PlayerMethods/getTargetCharacterData";
import getTargetData from "../PlayerMethods/getTargetData";
import getUserData from "../PlayerMethods/getUserData";
import getVehicleData from "../PlayerMethods/getVehicleData";

class AdminEsp {
	public static LocalPlayer: PlayerMp;
	public static _min: Vector3;
	public static _max: Vector3;
	public static _center: Vector3;
	public static _rectWidth: 0.03;
	public static _rectBorder = 0.001;
	public static _rectHeight = 0.0065;

	constructor() {
		AdminEsp.LocalPlayer = mp.players.local;

		mp.events.add("render", AdminEsp.handleRender);
	}

	public static handleRender() {
		let userData: UserData | undefined = getUserData();

		if (userData != null && userData.adminDuty && !userData.adminEsp) {
			AdminEsp.renderPlayerEsp();
			AdminEsp.renderVehiclesEsp();
		}
	}

	public static getCorners(ent: EntityMp): Vector3[] {
		let corners: Vector3[] = [];

		const { minimum, maximum } = mp.game.gameplay.getModelDimensions(ent.model);

		AdminEsp._min = minimum;
		AdminEsp._max = maximum;

		AdminEsp._center = new mp.Vector3(
			(minimum.x + maximum.x) / 2,
			(minimum.y + maximum.y) / 2,
			(minimum.z + maximum.z) / 2
		);

		corners[0] = new mp.Vector3(AdminEsp._min.x, AdminEsp._max.y, AdminEsp._max.z);
		corners[1] = new mp.Vector3(AdminEsp._max.x, AdminEsp._max.y, AdminEsp._max.z);
		corners[2] = new mp.Vector3(AdminEsp._max.x, AdminEsp._min.y, AdminEsp._max.z);
		corners[3] = new mp.Vector3(AdminEsp._min.x, AdminEsp._min.y, AdminEsp._max.z);
		corners[4] = new mp.Vector3(AdminEsp._min.x, AdminEsp._max.y, AdminEsp._min.z);
		corners[5] = new mp.Vector3(AdminEsp._max.x, AdminEsp._max.y, AdminEsp._min.z);
		corners[6] = new mp.Vector3(AdminEsp._max.x, AdminEsp._min.y, AdminEsp._min.z);
		corners[7] = new mp.Vector3(AdminEsp._min.x, AdminEsp._min.y, AdminEsp._min.z);

		return corners;
	}

	public static drawBoxes(ent: EntityMp, corners: Vector3[]) {

		const c1 = ent.getOffsetFromInWorldCoords(corners[0].x, corners[0].y, corners[0].z);
		const c2 = ent.getOffsetFromInWorldCoords(corners[1].x, corners[1].y, corners[1].z);
		const c3 = ent.getOffsetFromInWorldCoords(corners[2].x, corners[2].y, corners[2].z);
		const c4 = ent.getOffsetFromInWorldCoords(corners[3].x, corners[3].y, corners[3].z);
		const c5 = ent.getOffsetFromInWorldCoords(corners[4].x, corners[4].y, corners[4].z);
		const c6 = ent.getOffsetFromInWorldCoords(corners[5].x, corners[5].y, corners[5].z);
		const c7 = ent.getOffsetFromInWorldCoords(corners[6].x, corners[6].y, corners[6].z);
		const c8 = ent.getOffsetFromInWorldCoords(corners[7].x, corners[7].y, corners[7].z);

		mp.game.graphics.drawLine(c1.x, c1.y, c1.z, c2.x, c2.y, c2.z, 244, 155, 255, 255);
		mp.game.graphics.drawLine(c2.x, c2.y, c2.z, c3.x, c3.y, c3.z, 244, 155, 255, 255);
		mp.game.graphics.drawLine(c3.x, c3.y, c3.z, c4.x, c4.y, c4.z, 244, 155, 255, 255);
		mp.game.graphics.drawLine(c4.x, c4.y, c4.z, c1.x, c1.y, c1.z, 244, 155, 255, 255);

		mp.game.graphics.drawLine(c5.x, c5.y, c5.z, c6.x, c6.y, c6.z, 255, 0, 0, 255);
		mp.game.graphics.drawLine(c6.x, c6.y, c6.z, c7.x, c7.y, c7.z, 255, 0, 0, 255);
		mp.game.graphics.drawLine(c7.x, c7.y, c7.z, c8.x, c8.y, c8.z, 255, 0, 0, 255);
		mp.game.graphics.drawLine(c8.x, c8.y, c8.z, c5.x, c5.y, c5.z, 255, 0, 0, 255);

		mp.game.graphics.drawLine(c1.x, c1.y, c1.z, c5.x, c5.y, c5.z, 155, 255, 245, 255);
		mp.game.graphics.drawLine(c2.x, c2.y, c2.z, c6.x, c6.y, c6.z, 155, 255, 245, 255);
		mp.game.graphics.drawLine(c3.x, c3.y, c3.z, c7.x, c7.y, c7.z, 155, 255, 245, 255);
		mp.game.graphics.drawLine(c4.x, c4.y, c4.z, c8.x, c8.y, c8.z, 155, 255, 245, 255);
	}

	public static drawPlayerSkeletons(ent: PlayerMp) {
		let userData: UserData | undefined = getTargetData(ent);

		let rootBone: Vector3 = ent.getBoneCoords(0, 0, 0, 0);
		let head: Vector3 = ent.getBoneCoords(12844, 0, 0, 0);
		let rightF: Vector3 = ent.getBoneCoords(52301, 0, 0, 0);
		let leftF: Vector3 = ent.getBoneCoords(14201, 0, 0, 0);
		let leftH: Vector3 = ent.getBoneCoords(18905, 0, 0, 0);
		let rightH: Vector3 = ent.getBoneCoords(57005, 0, 0, 0);

		let alpha: number = 255;
		let cl1 = userData?.adminDuty ? 255 : 155;
		let cl2 = userData?.adminDuty ? 0 : 255;
		let cl3 = userData?.adminDuty ? 0 : 245;

		mp.game.graphics.drawLine(rootBone.x, rootBone.y, rootBone.z, head.x, head.y, head.z, cl1, cl2, cl3, alpha);
		mp.game.graphics.drawLine(rightF.x, rightF.y, rightF.z, rootBone.x, rootBone.y, rootBone.z, cl1, cl2, cl3, alpha);
		mp.game.graphics.drawLine(leftF.x, leftF.y, leftF.z, rootBone.x, rootBone.y, rootBone.z, cl1, cl2, cl3, alpha);
		mp.game.graphics.drawLine(head.x, head.y, head.z, leftH.x, leftH.y, leftH.z, cl1, cl2, cl3, alpha);
		mp.game.graphics.drawLine(head.x, head.y, head.z, rightH.x, rightH.y, rightH.z, cl1, cl2, cl3, alpha);

		let drawTextCoordsCenter: { x: number, y: number } = mp.game.graphics.world3dToScreen2d(new mp.Vector3(ent.position.x, ent.position.y, ent.position.z));
		let drawTextCoordsHead: { x: number, y: number } = mp.game.graphics.world3dToScreen2d(new mp.Vector3(head.x, head.y, head.z));

		let characterData: CharacterData | undefined = getTargetCharacterData(ent);

		let dispTextCenter: string =  userData?.adminDuty ? `~r~[ADMIN ON DUTY] ${userData.adminName}` : `Player (RID #${ent.remoteId}) (Dist ${distBetweenCoords(AdminEsp.LocalPlayer.position, ent.position).toFixed(1)}M) `;
		let dispTextHead: string = userData?.adminDuty ? "" : `Health ~g~${ent.getHealth()} ~w~Armour: ~b~${ent.getArmour()}`;

		if (characterData != null) {
			dispTextCenter += `\n(CID #${characterData.characterId}) (Name ${characterData.characterName})`;
		}

		AdminEsp.renderText(dispTextCenter, drawTextCoordsCenter);
		AdminEsp.renderText(dispTextHead, drawTextCoordsHead);
		AdminEsp.drawStatusBars(ent);
	}

	public static drawStatusBars(entity: PlayerMp) {
		let head: Vector3 = entity.getBoneCoords(12844, 0, 0, 0);

		let y2 = head.y + 0.042;
		let x2 = head.x - AdminEsp._rectWidth / 2 - AdminEsp._rectBorder / 2;

		if (entity.getArmour() > 0) {
			mp.game.graphics.drawRect(x2, y2, AdminEsp._rectWidth + AdminEsp._rectBorder * 2, 0.0085, 0, 0, 0, 200, false);
			mp.game.graphics.drawRect(x2, y2, AdminEsp._rectWidth, AdminEsp._rectHeight, 150, 150, 150, 255, false);
			mp.game.graphics.drawRect(x2 - AdminEsp._rectWidth / 2 * (1 - entity.getHealth()), y2, AdminEsp._rectWidth * entity.getHealth(), AdminEsp._rectHeight, 255, 255, 255, 200, false);

			x2 = head.x + AdminEsp._rectWidth / 2 + AdminEsp._rectBorder / 2;

			mp.game.graphics.drawRect(x2, y2, AdminEsp._rectWidth + AdminEsp._rectBorder * 2, AdminEsp._rectHeight + AdminEsp._rectBorder * 2, 0, 0, 0, 200, false);
			mp.game.graphics.drawRect(x2, y2, AdminEsp._rectWidth, AdminEsp._rectHeight, 41, 66, 78, 255, false);
			mp.game.graphics.drawRect(x2 - AdminEsp._rectWidth / 2 * (1 - entity.getArmour()), y2, AdminEsp._rectWidth * entity.getArmour(), AdminEsp._rectHeight, 48, 108, 135, 200, false);
		}
		else {
			mp.game.graphics.drawRect(head.x, y2, AdminEsp._rectWidth + AdminEsp._rectBorder * 2, AdminEsp._rectHeight + AdminEsp._rectBorder * 2, 0, 0, 0, 200, false);
			mp.game.graphics.drawRect(head.x, y2, AdminEsp._rectWidth, AdminEsp._rectHeight, 150, 150, 150, 255, false);
			mp.game.graphics.drawRect(head.x - AdminEsp._rectWidth / 2 * (1 - entity.getHealth()), y2, AdminEsp._rectWidth * entity.getHealth(), AdminEsp._rectHeight, 255, 255, 255, 200, false);
		}
	}

	public static renderPlayerEsp() {
		mp.players.forEachInStreamRange((ent: PlayerMp) => {
			if (ent && ent.handle != AdminEsp.LocalPlayer.handle) {
				let corners: Vector3[] = AdminEsp.getCorners(ent);

				AdminEsp.drawBoxes(ent, corners);
				AdminEsp.drawPlayerSkeletons(ent);
			}
		});
	}

	public static renderVehiclesEsp() {
		mp.vehicles.forEachInStreamRange((ent: VehicleMp) => {
			let corners: Vector3[] = AdminEsp.getCorners(ent);
			AdminEsp.drawBoxes(ent, corners);

			let drawTextCoords: { x: number, y: number } = mp.game.graphics.world3dToScreen2d(new mp.Vector3(ent.position.x, ent.position.y, ent.position.z));

			let vehicleData: VehicleData | undefined = getVehicleData(ent as VehicleMp);

			let dispText: string = `Vehicle (RID #${ent.remoteId}) (Model ${AdminEsp.getVehicleName(ent as VehicleMp)}) (Dist ${distBetweenCoords(AdminEsp.LocalPlayer.position, ent.position).toFixed(1)}M) `;

			if (vehicleData != null) {
				dispText += `(VID #${vehicleData.vehicle_id}) (Locked ${vehicleData.vehicle_locked}) I = ${vehicleData.indicator_status}`;
			}

			AdminEsp.renderText(dispText, drawTextCoords);
		});
	}

	public static getVehicleName(vehicle: VehicleMp): string {
		let vehicleName: string = mp.game.ui.getLabelText(mp.game.vehicle.getDisplayNameFromVehicleModel(vehicle.model));
		return vehicleName;
	}

	public static renderText(text: string, coords: {x: number, y: number}) {
		mp.game.graphics.drawText(text, [coords.x, coords.y], {
			font: 4,
			color: [255, 255, 255, 185],
			scale: [0.3, 0.3],
			outline: true
		});
	}

}

export default AdminEsp;
