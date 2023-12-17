import { AdminRanks } from "@/enums";
import { UserData } from "../@types";
import { _TEXT_R_WHITE, _control_ids, _sharedAccountDataIdentifier, _sharedCharacterDataIdentifier } from '../Constants/Constants';
import getTargetData from "../PlayerMethods/getTargetData";
import getUserData from "../PlayerMethods/getUserData";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";

class AdminSystem {
	public static userData: UserData | undefined;
	public static LocalPlayer: PlayerMp;
	public static viewReportsEvent: string = "server:viewReports";

	constructor() {
		AdminSystem.LocalPlayer = mp.players.local;
		mp.keys.bind(_control_ids.F9, false, AdminSystem.viewActiveReports);

		mp.events.add("render", AdminSystem.renderTextOnScreen);
		mp.events.add("entityStreamIn", AdminSystem.handleEntityStream);
		mp.events.addDataHandler(_sharedAccountDataIdentifier, AdminSystem.handleFlyStart);
	}

	public static viewActiveReports() {
		if(!validateKeyPress()) return;

		let userData: UserData | undefined = getUserData();

		if(!userData) return;

		if(userData.adminLevel > AdminRanks.admin_None) {
			mp.events.callRemote(AdminSystem.viewReportsEvent);
		}
	}

	public static handleFlyStart(entity: EntityMp, value: UserData): void {
		if (entity.type != "player" || value == null) return;

		if (value.isFlying) {
			entity.setAlpha(0);
		} else {
			entity.setAlpha(255);
		}
	}

	public static renderTextOnScreen() {
		AdminSystem.userData = getUserData();

		if (AdminSystem.userData?.adminDuty) {
			let poz_x: string = AdminSystem.LocalPlayer.position.x.toFixed(1);
			let poz_y: string = AdminSystem.LocalPlayer.position.y.toFixed(1);
			let poz_z: string = AdminSystem.LocalPlayer.position.z.toFixed(1);

			let positionString = `${_TEXT_R_WHITE} X: ${poz_x} Y: ${poz_y} Z: ${poz_z}`;

			let msg = `~r~On duty as ${AdminSystem.userData.adminName} ${AdminSystem.userData.isFlying ? "~g~[Fly enabled]~w~" : ""}\n${positionString}`;

			mp.game.graphics.drawText(msg, [0.5, 0.90], {
				font: 4,
				color: [255, 255, 255, 255],
				scale: [0.7, 0.7],
				outline: false
			});
		}
	}

	public static handleEntityStream(entity: EntityMp) {
		if (entity.type != "player") return;

		let streamedEntityData: UserData | undefined = getTargetData(entity as PlayerMp);

		if (!streamedEntityData) return;
	}

}

export default AdminSystem;
