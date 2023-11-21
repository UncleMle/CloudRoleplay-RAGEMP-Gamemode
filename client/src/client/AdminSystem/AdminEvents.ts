import { UserData } from "../@types";
import getUserData from "../PlayerMethods/getTargetData";
import AdminSystem from "./AdminSystem";

class AdminEvents {
	public static LocalPlayer: PlayerMp;

	constructor() {
		AdminEvents.LocalPlayer = mp.players.local;

		mp.events.add("admin:events:stopFly", AdminEvents.stopFly);
		mp.events.add("render", AdminEvents.handleRender);
	}

	public static handleRender() {
		let UserData: UserData | undefined = getUserData(AdminSystem.LocalPlayer);
		if (!UserData) return;

		if (UserData.isFrozen) {
			AdminEvents.LocalPlayer.freezePosition(true);
		}
	}

	public static stopFly() {
		AdminEvents.LocalPlayer.freezePosition(false);
	}

}

export default AdminEvents;
