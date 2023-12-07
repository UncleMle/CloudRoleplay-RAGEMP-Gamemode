import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";
import { UserData, CharacterData } from "../@types";
import { _TEXT_CLOUD_ADMINBLUE, _TEXT_R_RED, _TEXT_R_WHITE } from '../Constants/Constants';
import getTargetCharacterData from "../PlayerMethods/getTargetCharacterData";
import getTargetData from "../PlayerMethods/getTargetData";

class NameTags {
	public static userData: UserData | undefined;
	public static LocalPlayer: PlayerMp;
	public static ScreenRes: GetScreenResolutionResult;
	public static requestNickEvent: string = "server:requestPlayerNickname";

	constructor() {
		NameTags.LocalPlayer = mp.players.local;
		NameTags.ScreenRes = mp.game.graphics.getScreenResolution();

		mp.nametags.enabled = false;
		mp.events.add('render', NameTags.renderNametags);
		mp.events.add('entityStreamIn', NameTags.handleStreamIn);
		mp.events.add('set:nickName', NameTags.handleNickNameSet);
	}

	public static handleStreamIn(entity: PlayerMp) {
		if(entity.type != "player" || !getUserCharacterData()) return;

		mp.events.callRemote(NameTags.requestNickEvent, entity);
	}

	public static handleNickNameSet(entity: PlayerMp, name: string) {
		if(entity.type != "player" || !getTargetCharacterData(entity)) return;
		entity._nickName = name;
	}

	public static renderNametags() {
		mp.players.forEachInRange(NameTags.LocalPlayer.position, 20, (Target: PlayerMp) => {
			const targetUserData: UserData | undefined = getTargetData(Target);
			const targetCharacterData: CharacterData | undefined = getTargetCharacterData(Target);
			const TargetPosition: Vector3 = Target.position;
			const PlayerPosition: Vector3 = NameTags.LocalPlayer.position;

			if (!targetUserData || targetUserData.isFlying || !targetCharacterData) return;

			const distance: number = new mp.Vector3(PlayerPosition.x, PlayerPosition.y, PlayerPosition.z)
				.subtract(new mp.Vector3(TargetPosition.x, TargetPosition.y, TargetPosition.z))
				.length();


			if ( (distance < 8 || targetUserData.adminDuty && distance < 32) && NameTags.LocalPlayer.id != Target.id && NameTags.LocalPlayer.hasClearLosTo(Target.handle, 17)) {
				const index: number = Target.getBoneIndex(12844);
				const nameTag: Vector3 = Target.getWorldPositionOfBone(index);
				const position: { x: number, y: number } = mp.game.graphics.world3dToScreen2d(new mp.Vector3(nameTag.x, nameTag.y, nameTag.z + 0.4));

				if (!position) return;

				let x: number = position.x;
				let y: number = position.y;

				let scale: number = distance / 25;
				if (scale < 0.6) scale = 0.6;

				y -= scale * (0.005 * (NameTags.ScreenRes.y / 1080)) - parseInt('0.010');

				let voiceState: string = (targetCharacterData.voiceChatState ? "" : "~g~");
				let injuredState: string = (targetCharacterData.data.injured_timer > 0 ? "~r~(( INJURED )) ~w~\n" : "");
				let defaultTagContent: string = injuredState + voiceState + `${Target._nickName ? Target._nickName + " [" + Target.remoteId + "]" : "Player " + Target.remoteId}`;

				if (targetUserData.adminDuty) {
					defaultTagContent = `~w~<font color="${_TEXT_CLOUD_ADMINBLUE}">[Staff]</font> ${voiceState} ${targetUserData.adminName}`;
				}

				Target.isTypingInTextChat ? defaultTagContent += "\n ~m~(( Typing... ))~w~" : "";

				mp.game.graphics.drawText(defaultTagContent, [x, Target.isTypingInTextChat ? y - 0.032 : y], {
					font: 4,
					color: [255, 255, 255, targetUserData.adminDuty ? 255 : 180],
					scale: [0.325, 0.325],
					outline: false
				});
			}
		});
	}
}

export default NameTags;
