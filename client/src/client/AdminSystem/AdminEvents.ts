import { UserData } from "../@types";
import getUserData from "../PlayerMethods/getUserData";
import sendNotification from "../PlayerMethods/SendNotification";

class AdminEvents {
	public static LocalPlayer: PlayerMp;

	constructor() {
		AdminEvents.LocalPlayer = mp.players.local;

		mp.events.add("admin:events:stopFly", AdminEvents.stopFly);
		mp.events.add("admin:events:teleportWay", AdminEvents.teleportWaypoint);
		mp.events.add("render", AdminEvents.handleRender);
	}

	public static handleRender() {
		let UserData: UserData | undefined = getUserData();
		if (!UserData) return;

		if (UserData.isFrozen) {
			AdminEvents.LocalPlayer.freezePosition(true);
		}
	}

	public static teleportWaypoint() {
		const waypoint = mp.game.ui.getFirstBlipInfoId(8);
		if (!mp.game.ui.doesBlipExist(waypoint)) return sendNotification("Not found!");
		const waypointPos = mp.game.ui.getBlipInfoIdCoord(waypoint);
		if (!waypointPos) return sendNotification("No pos!");

		let zCoord = mp.game.gameplay.getGroundZFor3dCoord(waypointPos.x, waypointPos.y, waypointPos.z, false, false);
		if (!zCoord) {
			for (let i = 1000; i >= 0; i -= 25) {
				mp.game.streaming.requestCollisionAtCoord(waypointPos.x, waypointPos.y, i);
				mp.game.wait(0);
			}
			zCoord = mp.game.gameplay.getGroundZFor3dCoord(waypointPos.x, waypointPos.y, 1000, false, false);
			if (!zCoord) return sendNotification("You cannot teleport to this area!");
		}

		AdminEvents.LocalPlayer.position = new mp.Vector3(waypointPos.x, waypointPos.y, zCoord + 0.5);
		return sendNotification("Teleported to waypoint");
	}

	public static stopFly() {
		AdminEvents.LocalPlayer.freezePosition(false);
	}

}

export default AdminEvents;
