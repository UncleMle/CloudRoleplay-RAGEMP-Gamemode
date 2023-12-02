import { UserData } from "../@types";
import getUserData from "../PlayerMethods/getUserData";

class AdminEsp {
	public static LocalPlayer: PlayerMp;
	public static Graphics: GameGraphics;
	public static _min: Vector3;
	public static _max: Vector3;
	public static _center: Vector3;

	constructor() {
		AdminEsp.LocalPlayer = mp.players.local;
		AdminEsp.Graphics = AdminEsp.Graphics;

		mp.events.add("render", AdminEsp.handleRender);
	}

	public static handleRender() {
		let userData: UserData | undefined = getUserData();

		if (userData != null && userData.adminDuty) {
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
		var rootBone: Vector3 = ent.getBoneCoords(0, 0, 0, 0);
		var head: Vector3 = ent.getBoneCoords(12844, 0, 0, 0);
		var rightF: Vector3 = ent.getBoneCoords(52301, 0, 0, 0);
		var leftF: Vector3 = ent.getBoneCoords(14201, 0, 0, 0)
		var leftH: Vector3 = ent.getBoneCoords(18905, 0, 0, 0)
		var rightH: Vector3 = ent.getBoneCoords(57005, 0, 0, 0)

		AdminEsp.Graphics.drawLine(rootBone.x, rootBone.y, rootBone.z, head.x, head.y, head.z, 155, 255, 245, 255);
		AdminEsp.Graphics.drawLine(rightF.x, rightF.y, rightF.z, rootBone.x, rootBone.y, rootBone.z, 155, 255, 245, 255);
		AdminEsp.Graphics.drawLine(leftF.x, leftF.y, leftF.z, rootBone.x, rootBone.y, rootBone.z, 155, 255, 245, 255);
		AdminEsp.Graphics.drawLine(head.x, head.y, head.z, leftH.x, leftH.y, leftH.z, 155, 255, 245, 255);
		AdminEsp.Graphics.drawLine(head.x, head.y, head.z, rightH.x, rightH.y, rightH.z, 155, 255, 245, 255);
	}

	public static renderPlayerEsp() {
		mp.players.forEachInStreamRange((ent: PlayerMp) => {
			if (ent && ent.handle != AdminEsp.LocalPlayer.handle) {
				let corners: Vector3[] = AdminEsp.getCorners(ent);

				ent.setAlpha(120);

				AdminEsp.drawBoxes(ent, corners);
				AdminEsp.drawPlayerSkeletons(ent);
			}
		});
	}

	public static renderVehiclesEsp() {
		mp.vehicles.forEachInStreamRange((ent: VehicleMp) => {
			if (ent && ent.handle != AdminEsp.LocalPlayer.handle) {
				let corners: Vector3[] = AdminEsp.getCorners(ent);

				ent.setAlpha(120);

				AdminEsp.drawBoxes(ent, corners);
			}
		});
	}

}

export default AdminEsp;