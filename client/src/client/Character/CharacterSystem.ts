import { _sharedAccountDataIdentifier, _sharedCharacterDataIdentifier } from "../Constants/Constants";
import getTargetCharacterData from "../PlayerMethods/getTargetCharacterData";
import { CharacterData, CharacterModel, UserData } from "@types";
import getTargetData from "../PlayerMethods/getTargetData";
import getUserCharacterData from "@/PlayerMethods/getUserCharacterData";
import Tattoos from "./Tattoos";

class CharacterSystem {
	public static LocalPlayer: PlayerMp;
	public static serverName: string = "Cloud Roleplay";
	public static discordStatusUpdate_seconds: number = 15;

	constructor() {
		CharacterSystem.LocalPlayer = mp.players.local;

		mp.events.add("character:setModel", CharacterSystem.setCharacterCustomization);
		mp.events.add("entityStreamIn", CharacterSystem.handleEntityStreamIn);
		mp.events.addDataHandler(_sharedCharacterDataIdentifier, CharacterSystem.handleDataHandler);
		mp.events.addDataHandler(_sharedAccountDataIdentifier, CharacterSystem.handleAdmins);

		setInterval(() => {
			CharacterSystem.setDiscordStatus();
		}, CharacterSystem.discordStatusUpdate_seconds * 1000)
	}

	public static setDiscordStatus() {
		let characterData: CharacterData | undefined = getUserCharacterData();

		mp.discord.update(`Playing on ${CharacterSystem.serverName}`, `${characterData ? `Playing as ${characterData.characterName.replace("_", " ")}` : `Currently logged in`}`)
	}

	public static setCharacterCustomization(characterModel: any, parse: boolean = true, entity: PlayerMp | PedMp = CharacterSystem.LocalPlayer) {
		if(!characterModel) return;

		let charData: CharacterModel = characterModel;

		if (parse) {
			charData = JSON.parse(characterModel);
		}

		let female: number = mp.game.joaat("mp_m_freemode_01");
		let male: number = mp.game.joaat("mp_f_freemode_01");

		entity.model = charData.sex ? female : male;
		entity.setHeading(parseInt(charData.rotation));

		entity.setComponentVariation(2, parseInt(charData.hairStyle), 0, 0);
		entity.setHairColor(parseInt(charData.hairColour), parseInt(charData.hairHighlights));
		entity.setHeadOverlay(1, parseInt(charData.facialHairStyle), 1.0, parseInt(charData.facialHairColour), 0);
		entity.setEyeColor(parseInt(charData.eyeColour));
		entity.setHeadOverlay(10, parseInt(charData.chestHairStyle), 1.0, 0, 0);
		entity.setHeadOverlay(2, parseInt(charData.eyebrowsStyle), 1.0, parseInt(charData.eyebrowsColour), 0);
		entity.setHeadOverlay(5, parseInt(charData.blushStyle), 1.0, parseInt(charData.blushColour), 0);
		entity.setHeadOverlay(8, parseInt(charData.lipstick), 1.0, 0, 0);
		entity.setHeadOverlay(0, parseInt(charData.blemishes), 1.0, 0, 0);
		entity.setHeadOverlay(3, parseInt(charData.ageing), 1.0, 0, 0);
		entity.setHeadOverlay(6, parseInt(charData.complexion), 1.0, 0, 0);
		entity.setHeadOverlay(7, parseInt(charData.sunDamage), 1.0, 0, 0);
		entity.setHeadOverlay(9, parseInt(charData.molesFreckles), 1.0, 0, 0);
		entity.setHeadOverlay(4, parseInt(charData.makeup), 1.0, 0, 0);
		entity.setFaceFeature(0, parseInt(charData.noseWidth) / 10);
		entity.setFaceFeature(1, parseInt(charData.noseHeight) / 10);
		entity.setFaceFeature(2, parseInt(charData.noseLength) / 10);
		entity.setFaceFeature(3, parseInt(charData.noseBridge) / 10);
		entity.setFaceFeature(4, parseInt(charData.noseTip) / 10);
		entity.setFaceFeature(5, parseInt(charData.noseBridgeShift) / 10);
		entity.setFaceFeature(6, parseInt(charData.browHeight) / 10);
		entity.setFaceFeature(7, parseInt(charData.browWidth) / 10);
		entity.setFaceFeature(8, parseInt(charData.cheekBoneHeight) / 10);
		entity.setFaceFeature(9, parseInt(charData.cheekBoneWidth) / 10);
		entity.setFaceFeature(10, parseInt(charData.cheeksWidth) / 10);
		entity.setFaceFeature(11, parseInt(charData.eyes) / 10);
		entity.setFaceFeature(12, parseInt(charData.lips) / 10);
		entity.setFaceFeature(13, parseInt(charData.jawWidth) / 10);
		entity.setFaceFeature(14, parseInt(charData.jawHeight) / 10);
		entity.setFaceFeature(15, parseInt(charData.chinLength) / 10);
		entity.setFaceFeature(16, parseInt(charData.chinPosition) / 10);
		entity.setFaceFeature(17, parseInt(charData.chinWidth) / 10);
		entity.setFaceFeature(18, parseInt(charData.chinShape) / 10);
		entity.setFaceFeature(19, parseInt(charData.neckWidth) / 10);

		entity.setHeadBlendData(parseInt(charData.firstHeadShape), parseInt(charData.secondHeadShape), 0, parseInt(charData.firstHeadShape), parseInt(charData.secondHeadShape), 0, Number(charData.headMix) * 0.01, Number(charData.skinMix) * 0.01, 0, false);

		if(charData.player_tattos && charData.player_tattos.length > 0) {
			Tattoos.setDbTats(entity, charData);
		}
	}

	public static handleAdmins(entity: PlayerMp, data: UserData) {
		if(entity.type != "player" || !data) return;

		let characterData: CharacterData | undefined = getTargetCharacterData(entity);

		if(data.showAdminPed) {
			entity.model = mp.game.joaat(data.adminPed);
		} else {
			CharacterSystem.setCharacterCustomization(characterData?.data.characterModel, false, entity as PlayerMp);
		}
	}

	public static handleEntityStreamIn(entity: EntityMp) {
		if (entity.type != "player") return;
		let characterData: CharacterData | undefined = getTargetCharacterData(entity as PlayerMp);
		let userData: UserData | undefined = getTargetData(entity as PlayerMp);

		if (!userData || !characterData) return;

		if(userData.showAdminPed) {
			entity.model = mp.game.joaat(userData.adminPed);
			return;
		}

		CharacterSystem.setCharacterCustomization(characterData.data.characterModel, false, entity as PlayerMp);
	}

	public static handleDataHandler(entity: EntityMp, data: CharacterData) {
		if (entity.type != "player" || !data) return;
		let userData: UserData | undefined = getTargetData(entity as PlayerMp);
		let characterData: CharacterData | undefined = getTargetCharacterData(entity as PlayerMp);

		if (!userData || !characterData) return;

		if(userData.showAdminPed) {
			entity.model = mp.game.joaat(userData.adminPed);
			return;
		}

		CharacterSystem.setCharacterCustomization(data.characterModel, false, entity as PlayerMp);
	}

}

export default CharacterSystem;