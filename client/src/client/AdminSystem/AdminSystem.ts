import { UserData } from "../@types";
import { _sharedCharacterDataIdentifier } from '../Constants/Constants';
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
					let msg = `~r~On duty as ${AdminSystem.userData.adminName}\n${AdminSystem.LocalPlayer.position}`;
					mp.game.graphics.drawText(msg, [0.5, 0.93], {
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
