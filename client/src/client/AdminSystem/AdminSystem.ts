import { UserData } from "../@types";
import { _TEXT_R_WHITE, _sharedCharacterDataIdentifier } from '../Constants/Constants';
import getUserData from "../PlayerMethods/getUserData";

class AdminSystem {
	public static userData: UserData | undefined;
	public static LocalPlayer: PlayerMp;

	constructor() {
		AdminSystem.LocalPlayer = mp.players.local;

		mp.events.add({
			"render": () => {
				AdminSystem.userData = getUserData();

				if (AdminSystem.userData?.adminDuty) {
					let poz_x: string = AdminSystem.LocalPlayer.position.x.toFixed(1);
					let poz_y: string = AdminSystem.LocalPlayer.position.y.toFixed(1);
					let poz_z: string = AdminSystem.LocalPlayer.position.z.toFixed(1);

					let positionString = `${_TEXT_R_WHITE} X: ${poz_x} Y: ${poz_y} Z: ${poz_z}`;

					let msg = `~r~On duty as ${AdminSystem.userData.adminName} ${AdminSystem.userData.isFlying ? "~g~[Fly enabled]~w~" : ""}]\n${positionString}`;

					mp.game.graphics.drawText(msg, [0.5, 0.90], {
						font: 4,
						color: [255, 255, 255, 255],
						scale: [0.7, 0.7],
						outline: false
					});
				}

			}
		})

	}

}

export default AdminSystem;
