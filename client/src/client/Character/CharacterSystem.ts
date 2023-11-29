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

		// This is stringified from server or CEF and parsed again (I assume ragemp does some logic to it so this has to happen.) 
		const charData: CharacterModel = JSON.parse(characterModel);

		// Type casting here can be a little odd (this is the only way I managed to get this method to work properly)...
		CharacterSystem.LocalPlayer.setHeadBlendData(parseInt(Number(charData.firstHeadShape)), parseInt(Number(charData.secondHeadShape)), 0, parseInt(Number(charData.firstHeadShape)), parseInt(Number(charData.secondHeadShape)), 0, Number(charData.headMix) * 0.01, Number(charData.skinMix) * 0.01, 0, false);

		
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
