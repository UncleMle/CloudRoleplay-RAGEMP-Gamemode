import getUserCharacterData from '@/PlayerMethods/getUserCharacterData';
import { UserData, CharacterData } from '../@types';
import { _TEXT_CLOUD_ADMINBLUE, _TEXT_R_RED, _TEXT_R_WHITE } from '../Constants/Constants';
import gettargetCharacterData from '../PlayerMethods/getTargetCharacterData';
import gettargetData from '../PlayerMethods/getTargetData';
import distBetweenCoords from '@/PlayerMethods/distanceBetweenCoords';
import VoiceSystem from '@/VoiceChat/VoiceSystem';
import DeathSystem from '@/DeathSystem/DeathSystem';
import NotificationSystem from '@/NotificationSystem/NotificationSystem';
import VehicleSystems from '@/VehicleSystems/VehicleSystem';
import PlayerAuthentication from '@/Authentication/PlayerAuthentication';

export default class NameTags {
	public static userData: UserData | undefined;
	public static LocalPlayer: PlayerMp;
	public static ScreenRes: GetScreenResolutionResult;
	public static requestNickEvent: string = 'server:requestPlayerNickname';
	public static playerIsTypingState: string = 'playerIsTypingState';

	constructor() {
		NameTags.LocalPlayer = mp.players.local;
		NameTags.ScreenRes = mp.game.graphics.getScreenResolution();

		mp.nametags.enabled = false;
		mp.events.add('render', NameTags.renderNametags);
		mp.events.add('entityStreamIn', NameTags.handleStreamIn);
		mp.events.add('set:nickName', NameTags.handleNickNameSet);
		mp.events.add('sendWithNickName', NameTags.sendWithNick);
		mp.events.add('playerQuit', NameTags.sendQuitMessage);
	}

	public static sendQuitMessage(playerQuitting: PlayerMp, exitType: string, reason: string) {
		if (!playerQuitting || !gettargetCharacterData(playerQuitting)) return;
		if (distBetweenCoords(NameTags.LocalPlayer.position, playerQuitting.position) > 25) return;
		mp.gui.chat.push(
			'!{#f57b42}[Disconnected] !{white}' +
				NameTags.getPlayerNick(playerQuitting) +
				' has ' +
				NameTags.formatExit(exitType, reason) +
				' from the server!'
		);
	}

	public static sendWithNick(targetEnt: PlayerMp, prefix: string, suffix: string) {
		if (!targetEnt) return;
		if (targetEnt == NameTags.LocalPlayer) {
			let characterData: CharacterData | undefined = getUserCharacterData();
			mp.gui.chat.push(prefix + characterData?.character_name.replace('_', ' ') + ' ' + suffix);
		} else {
			mp.gui.chat.push(prefix + NameTags.getPlayerNick(targetEnt) + suffix);
		}
	}

	public static formatExit(exitType: string, reason: string) {
		let formattedReason = 'disconnected';

		switch (exitType) {
			case 'timeout': {
				formattedReason = 'timed out';
				break;
			}
			case 'kicked': {
				formattedReason = 'has been kicked ' + reason ? ' with reason ' + reason : '';
			}
		}

		return formattedReason;
	}

	public static handleStreamIn(entity: PlayerMp) {
		if (entity.type != 'player' || !getUserCharacterData()) return;

		mp.events.callRemote(NameTags.requestNickEvent, entity);
	}

	public static handleNickNameSet(entity: PlayerMp, name: string) {
		if (entity.type != 'player' || !gettargetCharacterData(entity)) return;
		entity._nickName = name;
	}

	public static renderNametags() {
		if (NameTags.LocalPlayer.getVariable(NameTags.playerIsTypingState)) {
			DeathSystem.disableControls();
		}

		if(getUserCharacterData()?.loggingOut) {
			PlayerAuthentication.LocalPlayer.freezePosition(true);
		}

		mp.players.forEachInRange(NameTags.LocalPlayer.position, 20, (target: PlayerMp) => {
			const targetUserData: UserData | undefined = gettargetData(target);
			const targetCharacterData: CharacterData | undefined = gettargetCharacterData(target);
			const targetPosition: Vector3 = target.position;
			const PlayerPosition: Vector3 = NameTags.LocalPlayer.position;

			if (!targetUserData || targetUserData.isFlying || !targetCharacterData) return;

			const distance: number = new mp.Vector3(PlayerPosition.x, PlayerPosition.y, PlayerPosition.z)
				.subtract(new mp.Vector3(targetPosition.x, targetPosition.y, targetPosition.z))
				.length();

			if (
				(distance < 8 || (targetUserData.adminDuty && distance < 32)) &&
				NameTags.LocalPlayer.id != target.id &&
				NameTags.LocalPlayer.hasClearLosTo(target.handle, 17)
			) {
				const index: number = target.getBoneIndex(12844);
				const nameTag: Vector3 = target.getWorldPositionOfBone(index);
				const position: { x: number; y: number } = mp.game.graphics.world3dToScreen2d(new mp.Vector3(nameTag.x, nameTag.y, nameTag.z + 0.4));

				if (!position) return;

				let x: number = position.x;
				let y: number = position.y;

				let scale: number = distance / 25;
				if (scale < 0.6) scale = 0.6;

				y -= scale * (0.005 * (NameTags.ScreenRes.y / 1080)) - parseInt('0.010');

				let voiceState: string = target.getVariable(VoiceSystem._voiceToggleIdentifier) ? '' : '~g~';
				let injuredState: string = targetCharacterData.injured_timer > 0 ? '~r~(( INJURED )) ~w~\n' : '';
				let defaultTagContent: string = injuredState + voiceState + NameTags.getPlayerNick(target);

				if (targetUserData.adminDuty) {
					defaultTagContent = `~w~<font color="${_TEXT_CLOUD_ADMINBLUE}">[Staff]</font> ${voiceState} ${targetUserData.admin_name}`;
				}

				target.getVariable(NameTags.playerIsTypingState) ? (defaultTagContent += '\n ~m~(( Typing... ))~w~') : '';

				if (NameTags.LocalPlayer.guiState || targetUserData.adminDuty) {
					if (target.getVariable(VehicleSystems._seatBeltIdentifier) && target.vehicle && distance < 5) {
						if (!mp.game.graphics.hasStreamedTextureDictLoaded('3dtextures')) {
							mp.game.graphics.requestStreamedTextureDict('3dtextures', true);
						}

						if (mp.game.graphics.hasStreamedTextureDictLoaded('3dtextures')) {
							mp.game.graphics.drawSprite('3dtextures', 'mpgroundlogo_bikers', x, y - 0.064, 0.025, 0.025, 0, 0, 255, 0, 255, false);
						}
					}


					mp.game.graphics.drawText(defaultTagContent, [x, target.getVariable(NameTags.playerIsTypingState) ? y - 0.032 : y], {
						font: 4,
						color: [255, 255, 255, targetUserData.adminDuty ? 255 : 180],
						scale: [0.325, 0.325],
						outline: false
					});

					if (target.getVariable(NotificationSystem._ameTextIdentifier) && !targetUserData.adminDuty) {
						mp.game.graphics.drawText(
							target.getVariable(NotificationSystem._ameTextIdentifier),
							[x, y - (target.getVariable(NameTags.playerIsTypingState) ? 0.062 : 0.032)],
							{
								font: 4,
								color: [220, 125, 225, 255],
								scale: [0.325, 0.325],
								outline: false
							}
						);
					}

					if(target.getVariable(PlayerAuthentication._logoutIdentifier)) {
						mp.game.graphics.drawText(
							"~y~Logging out...~w~",
							[x, y + 0.032],
							{
								font: 4,
								color: [220, 125, 225, 255],
								scale: [0.325, 0.325],
								outline: false
							}
						);
					}
				}
			}
		});
	}

	public static getPlayerNick(player: PlayerMp): string {
		let pCharData: CharacterData | undefined = gettargetCharacterData(player);
		if (!pCharData) return '';

		let nick: string =
			player._nickName && pCharData.characterClothing.mask == 0
				? player._nickName + ' [' + player.remoteId + ']'
				: 'Stranger ' + player.remoteId;

		return nick;
	}
}
