import { _sharedCharacterDataIdentifier } from "../Constants/Constants";
import getTargetCharacterData from "../PlayerMethods/getTargetCharacterData";
import { CharacterData, CharacterModel } from "@types";

class CharacterSystem {
	public static LocalPlayer: PlayerMp;


	constructor() {
		CharacterSystem.LocalPlayer = mp.players.local;

		mp.events.add("character:setModel", CharacterSystem.setCharacterCustomization);
		mp.events.add("entityStreamIn", CharacterSystem.handleEntityStreamIn);
		mp.events.add("entityStreamOut", CharacterSystem.handleEntityStreamOut);
		mp.events.addDataHandler(_sharedCharacterDataIdentifier, CharacterSystem.handleDataHandler);
	}

	public static setCharacterCustomization(characterModel: any) {
		const charData: CharacterModel = JSON.parse(characterModel);

		let female: number = mp.game.joaat("mp_m_freemode_01");
		let male: number = mp.game.joaat("mp_f_freemode_01");

		CharacterSystem.LocalPlayer.model = charData.sex ? female : male;
		CharacterSystem.LocalPlayer.setHeading(parseInt(charData.rotation));

		CharacterSystem.LocalPlayer.setComponentVariation(2, parseInt(charData.hairStyle), 0, 0);
		CharacterSystem.LocalPlayer.setHairColor(parseInt(charData.hairColour), parseInt(charData.hairHighlights));
		CharacterSystem.LocalPlayer.setHeadOverlay(1, parseInt(charData.facialHairStyle), 1.0, parseInt(charData.facialHairColour), 0);
		CharacterSystem.LocalPlayer.setEyeColor(parseInt(charData.eyeColour));
		CharacterSystem.LocalPlayer.setHeadOverlay(10, parseInt(charData.chestHairStyle), 1.0, 0, 0);
		CharacterSystem.LocalPlayer.setHeadOverlay(2, parseInt(charData.eyebrowsStyle), 1.0, parseInt(charData.eyebrowsColour), 0);
		CharacterSystem.LocalPlayer.setHeadOverlay(5, parseInt(charData.blushStyle), 1.0, parseInt(charData.blushColour), 0);
		CharacterSystem.LocalPlayer.setHeadOverlay(8, parseInt(charData.lipstick), 1.0, 0, 0);
		CharacterSystem.LocalPlayer.setHeadOverlay(0, parseInt(charData.blemishes), 1.0, 0, 0);
		CharacterSystem.LocalPlayer.setHeadOverlay(3, parseInt(charData.ageing), 1.0, 0, 0);
		CharacterSystem.LocalPlayer.setHeadOverlay(6, parseInt(charData.complexion), 1.0, 0, 0);
		CharacterSystem.LocalPlayer.setHeadOverlay(7, parseInt(charData.sunDamage), 1.0, 0, 0);
		CharacterSystem.LocalPlayer.setHeadOverlay(9, parseInt(charData.molesFreckles), 1.0, 0, 0);
		CharacterSystem.LocalPlayer.setHeadOverlay(4, parseInt(charData.makeup), 1.0, 0, 0);
		CharacterSystem.LocalPlayer.setFaceFeature(0, parseInt(charData.noseWidth) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(1, parseInt(charData.noseHeight) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(2, parseInt(charData.noseLength) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(3, parseInt(charData.noseBridge) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(4, parseInt(charData.noseTip) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(5, parseInt(charData.noseBridgeShift) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(6, parseInt(charData.browHeight) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(7, parseInt(charData.browWidth) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(8, parseInt(charData.cheekBoneHeight) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(9, parseInt(charData.cheekBoneWidth) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(10, parseInt(charData.cheeksWidth) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(11, parseInt(charData.eyes) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(12, parseInt(charData.lips) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(13, parseInt(charData.jawWidth) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(14, parseInt(charData.jawHeight) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(15, parseInt(charData.chinLength) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(16, parseInt(charData.chinPosition) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(17, parseInt(charData.chinWidth) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(18, parseInt(charData.chinShape) / 10);
		CharacterSystem.LocalPlayer.setFaceFeature(19, parseInt(charData.neckWidth) / 10);


		CharacterSystem.LocalPlayer.setHeadBlendData(parseInt(charData.firstHeadShape), parseInt(charData.secondHeadShape), 0, parseInt(charData.firstHeadShape), parseInt(charData.secondHeadShape), 0, Number(charData.headMix) * 0.01, Number(charData.skinMix) * 0.01, 0, false); 



	}

	public static handleEntityStreamIn() {

	}

	public static handleEntityStreamOut(entity: EntityMp) {
		if (entity.type != "player" || !getTargetCharacterData(entity as PlayerMp)) return;	
		let characterData: CharacterData | undefined = getTargetCharacterData(entity as PlayerMp);

		if (!characterData) return;

		

	}

	public static handleDataHandler() {

	}

}

export default CharacterSystem;
