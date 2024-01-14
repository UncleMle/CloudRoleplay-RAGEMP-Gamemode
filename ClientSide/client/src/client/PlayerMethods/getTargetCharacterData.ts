import { CharacterData } from "../@types";
import { _sharedCharacterDataIdentifier } from "../Constants/Constants";

const getTargetCharacterData = (target: PlayerMp): CharacterData | undefined => {
	let sharedData = target.getVariable(_sharedCharacterDataIdentifier);
	if (!sharedData) return;

	return sharedData as CharacterData;
}


export default getTargetCharacterData;
