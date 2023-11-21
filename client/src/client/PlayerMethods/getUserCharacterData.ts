import { CharacterData } from "../@types";
import { _sharedCharacterDataIdentifier } from "../Constants/Constants";

const getUserCharacterData = (): CharacterData | undefined => {
	let sharedData = mp.players.local.getVariable(_sharedCharacterDataIdentifier);
	if (!sharedData) return;

	return sharedData as CharacterData;
}


export default getUserCharacterData;
