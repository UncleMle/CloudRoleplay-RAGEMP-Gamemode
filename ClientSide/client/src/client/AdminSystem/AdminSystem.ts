import { AdminRanks } from "@/enums";
import { UserData } from "../@types";
import { _TEXT_R_WHITE, _control_ids, _sharedAccountDataIdentifier, _sharedCharacterDataIdentifier } from '../Constants/Constants';
import getTargetData from "../PlayerMethods/getTargetData";
import getUserData from "../PlayerMethods/getUserData";
import validateKeyPress from "@/PlayerMethods/validateKeyPress";
import AdminRank from "./AdminRank";

export default class AdminSystem {
	public static LocalPlayer: PlayerMp;
	public static userData: UserData | undefined;
	public static viewReportsEvent: string = "server:viewReports";
	public static adminJailTimer: number = 0;
	public static _jailTimeInterval: ReturnType<typeof setInterval> | undefined = undefined;

	constructor() {
		AdminSystem.LocalPlayer = mp.players.local;
		mp.keys.bind(_control_ids.F9, false, AdminSystem.viewActiveReports);

		mp.events.add("render", () => {
			AdminSystem.renderAdutyText();
			AdminSystem.renderJailText();
		});

		mp.events.add("entityStreamIn", AdminSystem.handleEntityStream);
		mp.events.add("client:adminSystem:adminJail:start", AdminSystem.handleJailStart);
		mp.events.add("client:adminSystem:adminJail:end", AdminSystem.clearJailInterval);
		mp.events.add("playerRuleTriggered", AdminSystem.handleRuleCheck);
		mp.events.addDataHandler(_sharedAccountDataIdentifier, AdminSystem.handleFlyStart);
	}

	private static clearJailInterval() {
		AdminSystem.adminJailTimer = 0;

		if (AdminSystem._jailTimeInterval) {
			clearInterval(AdminSystem._jailTimeInterval);
			AdminSystem._jailTimeInterval = undefined;
		}
	}

	private static handleJailStart(time: number) {
		AdminSystem.clearJailInterval();

		AdminSystem.adminJailTimer = time;

		AdminSystem._jailTimeInterval = setInterval(() => {

			if (AdminSystem.adminJailTimer <= 0) return AdminSystem.clearJailInterval();

			AdminSystem.adminJailTimer--;
		}, 1000);
	}

	public static handleRuleCheck(rule: string, counter: number) {
		mp.gui.chat.push(`Rule ${rule} (${counter}) ~r~FAILED`);
		mp.console.logInfo(`Rule ${rule} (${counter}) FAILED`);
	}

	public static viewActiveReports() {
		if (!validateKeyPress()) return;

		let userData: UserData | undefined = getUserData();

		if (!userData) return;

		if (userData.admin_status > AdminRanks.admin_None) {
			mp.events.callRemote(AdminSystem.viewReportsEvent);
		}
	}

	public static handleFlyStart(entity: EntityMp, value: UserData): void {
		if (entity.type != "player" || value == null) return;

		entity.setAlpha(value.isFlying ? 0 : 255);
	}

	private static renderJailText() {
		if (AdminSystem.adminJailTimer <= 0) return;

		let userData: UserData | undefined = getUserData();

		if (!userData) return;

		let mins = Math.round(AdminSystem.adminJailTimer / 60);

		mp.game.graphics.drawText(`You are in ~r~admin jail~w~ there are ${mins != 0 ? mins + " minute(s)" : ""} ${mins != 0 ? "(" : " "}${AdminSystem.adminJailTimer}${mins != 0 ? "s)" : " seconds"} remaining.`, [0.5, 0.69], {
			font: 4,
			color: [255, 255, 255, 255],
			scale: [0.4, 0.4],
			outline: false
		});

		mp.game.graphics.drawText("Reason: ~c~" + userData.admin_jail_reason, [0.5, 0.73], {
			font: 4,
			color: [255, 255, 255, 255],
			scale: [0.4, 0.4],
			outline: false
		});
	}

	public static renderAdutyText() {
		AdminSystem.userData = getUserData();

		if (AdminSystem.userData?.adminDuty) {
			let poz_x: string = AdminSystem.LocalPlayer.position.x.toFixed(1);
			let poz_y: string = AdminSystem.LocalPlayer.position.y.toFixed(1);
			let poz_z: string = AdminSystem.LocalPlayer.position.z.toFixed(1);

			let adminRankData: void | {
				rank: string,
				colour: string
			} = AdminRank.getAdminRankInfo(AdminSystem.userData.admin_status);
			if (!adminRankData) return;

			let positionString: string = `~r~X:~w~ ${poz_x} ~r~Y:~w~ ${poz_y} ~r~Z:~w~ ${poz_z} ~r~ROT:~w~ ${AdminSystem.LocalPlayer.getRotation(5).z.toFixed(1)}`;

			let msg: string = `~r~On duty as ~w~<font color="${adminRankData.colour}">${adminRankData.rank}~r~ ${AdminSystem.userData.admin_name} ${AdminSystem.userData.isFlying ? "\n~g~[Fly enabled]~w~" : ""}`;

			mp.game.graphics.drawText(msg, [0.5, 0.90], {
				font: 4,
				color: [255, 255, 255, 255],
				scale: [0.65, 0.65],
				outline: false
			});

			mp.game.graphics.drawText(positionString, [0.5, AdminSystem.userData.isFlying ? 0.87 : 0.94], {
				font: 4,
				color: [255, 255, 255, 255],
				scale: [0.45, 0.45],
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