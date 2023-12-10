import NotificationSystem from "@/NotificationSystem/NotificationSystem";
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
		const waypoint: number = mp.game.ui.getFirstBlipInfoId(8);
		if (!mp.game.ui.doesBlipExist(waypoint)) return NotificationSystem.createNotification("~r~You do not have a waypoint set.", false);
		const waypointPos: Vector3 = mp.game.ui.getBlipInfoIdCoord(waypoint);
		if (!waypointPos) return NotificationSystem.createNotification("~r~You cannot teleport to this area.", false);

		let zCoord: number = mp.game.gameplay.getGroundZFor3dCoord(waypointPos.x, waypointPos.y, waypointPos.z, false, false);
		if (!zCoord) {
			for (let i = 1000; i >= 0; i -= 25) {
				mp.game.streaming.requestCollisionAtCoord(waypointPos.x, waypointPos.y, i);
				mp.game.wait(0);
			}
			zCoord = mp.game.gameplay.getGroundZFor3dCoord(waypointPos.x, waypointPos.y, 1000, false, false);
			if (!zCoord) return NotificationSystem.createNotification("~r~You cannot teleport to this area.", false);
		}

		AdminEvents.LocalPlayer.position = new mp.Vector3(waypointPos.x, waypointPos.y, zCoord + 0.5);
		return NotificationSystem.createNotification("~r~Teleported to waypoint.", false);
	}

	public static stopFly() {
		AdminEvents.LocalPlayer.freezePosition(false);
	}

}

export default AdminEvents;
