import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";
import { CharacterData } from "../@types";
import { _control_ids, _sharedCharacterDataIdentifier } from "../Constants/Constants";
import getTargetCharacterData from "@/PlayerMethods/getTargetCharacterData";

class VoiceSystem {
	public static Localplayer: PlayerMp;
	public static Use3d: boolean = true;
	public static UseAutoVolume: boolean = false;
	public static MaxRange: number = 20;
	public static VoiceVol: number = 1.0;
	public static VoiceChatKey = _control_ids.NBIND;
	public static _voiceListeners: PlayerMp[] = [];
	public static addListenerEvent: string = "server:voiceAddVoiceListener";
	public static removeListenerEvent: string = "server:voiceRemoveVoiceListener";
	public static togVoiceEvent: string = "server:togVoiceStatus";


	constructor() {
		VoiceSystem.Localplayer = mp.players.local;

		mp.keys.bind(VoiceSystem.VoiceChatKey, false, () => VoiceSystem.toggleVoice(true));
		mp.keys.bind(VoiceSystem.VoiceChatKey, true, () => VoiceSystem.toggleVoice(false));

		mp.events.add("entityStreamOut", VoiceSystem.handleStreamOut);
		mp.events.add("entityStreamIn", VoiceSystem.handleStreamIn);
		mp.events.addDataHandler(_sharedCharacterDataIdentifier, VoiceSystem.handleDataHandler);
		mp.events.add("playerQuit", VoiceSystem.handlePlayerLeave);
		mp.events.add("render", VoiceSystem.handleRender);

		setInterval(() => {
			mp.players.forEachInStreamRange(player => {
				if (player != VoiceSystem.Localplayer) {
					if (!player.isListening) {
						let dist = mp.game.system.vdist(player.position.x, player.position.y, player.position.z, VoiceSystem.Localplayer.position.x, VoiceSystem.Localplayer.position.y, VoiceSystem.Localplayer.position.z);

						if (dist <= VoiceSystem.MaxRange) {
							VoiceSystem.addListener(player);
						}
					}
				}
			});

			VoiceSystem._voiceListeners.forEach((player: PlayerMp) => {
				if (player.handle !== 0) {
					const playerPos = player.position;
					let dist = mp.game.system.vdist(playerPos.x, playerPos.y, playerPos.z, VoiceSystem.Localplayer.position.x, VoiceSystem.Localplayer.position.y, VoiceSystem.Localplayer.position.z);

					if (dist > VoiceSystem.MaxRange) {
						VoiceSystem.removeListener(player, true);
					}
					else if (!VoiceSystem.UseAutoVolume) {
						player.voiceVolume = 1 - (dist / VoiceSystem.MaxRange);
					}
				}
				else {
					VoiceSystem.removeListener(player, true);
				}
			});
		}, 500);
	}

	public static handleRender() {
		if(!mp.voiceChat.muted) {
			mp.game.graphics.drawText("~g~[TALKING]", [0.5, 0.7], {
				font: 4,
				color: [255, 255, 255, 185],
				scale: [1.2, 1.2],
				outline: true
			  });
		}
	}

	public static handleDataHandler(entity: EntityMp, characterData: CharacterData) {
		if(entity.type != "player" || !characterData) return;

		if(!characterData.voiceChatState) {
			(entity as PlayerMp).playFacialAnim("mic_chatter", "mp_facial");
		} else {
			(entity as PlayerMp).playFacialAnim("mood_normal_1", "facials@gen_male@variations@normal");
		}
	}

	public static handleStreamOut(entity: EntityMp) {
		if(entity.type != "player") return;

		let characterData: CharacterData | undefined = getTargetCharacterData(entity as PlayerMp);

		if(!characterData?.voiceChatState) {
			(entity as PlayerMp).playFacialAnim("mood_normal_1", "facials@gen_male@variations@normal");
		}
	}

	public static handleStreamIn(entity: EntityMp) {
		if(entity.type != "player") return;

		let characterData: CharacterData | undefined = getTargetCharacterData(entity as PlayerMp);

		if(!characterData?.voiceChatState) {
			(entity as PlayerMp).playFacialAnim("mic_chatter", "mp_facial");
		}
	}

	public static addListener(player: PlayerMp) {

		VoiceSystem._voiceListeners.push(player);

		player.isListening = true;

		mp.events.callRemote(VoiceSystem.addListenerEvent, player);

		if (VoiceSystem.UseAutoVolume) {
			player.voiceAutoVolume = true;
		}
		else {
			player.voiceVolume = 1.0;
		}

		if (VoiceSystem.Use3d) {
			player.voice3d = true;
		}
	}

	public static removeListener(player: PlayerMp, notify: boolean) {
		let idx = VoiceSystem._voiceListeners.indexOf(player);

		if (idx !== -1) {
			VoiceSystem._voiceListeners.splice(idx, 1);
		}

		player.isListening = false;

		if (notify) {
			mp.events.callRemote(VoiceSystem.removeListenerEvent, player);
		}
	}

	public static toggleVoice(tog: boolean) {
		let characterData: CharacterData | undefined = getUserCharacterData();

		if (!VoiceSystem.Localplayer.isTypingInTextChat && characterData) {
			mp.voiceChat.muted = tog;
			mp.events.callRemote(VoiceSystem.togVoiceEvent, tog);
		}
	}

	public static handlePlayerLeave(player: PlayerMp) {
		if (player.isListening) {
			VoiceSystem.removeListener(player, false);
		}
	}

}

export default VoiceSystem;
